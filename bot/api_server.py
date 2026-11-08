import json
import logging
from datetime import datetime
from aiohttp import web
from sqlalchemy import select

from bot.database.base import async_session_maker
from bot.database.models import Salon, User, Master, Booking
from bot.database.requests import sync_salon_masters, transliterate_to_latin
from bot.handlers.user import get_user_app_url
from aiogram.types import MenuButtonWebApp, WebAppInfo

logger = logging.getLogger("okoshko_api")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
}


async def handle_cors_options(request: web.Request) -> web.Response:
    """Preflight CORS response"""
    return web.Response(status=204, headers=CORS_HEADERS)


async def handle_get_salon(request: web.Request) -> web.Response:
    """Возвращает актуальные данные салона из PostgreSQL для Mini App"""
    user_id_str = request.query.get("user_id", "1205557089")
    try:
        user_id = int(user_id_str)
    except ValueError:
        user_id = 1205557089

    async with async_session_maker() as session:
        # Ищем салон по владельцу или админу
        res = await session.execute(
            select(Salon).where((Salon.owner_id == user_id) | (Salon.admin_id == user_id))
        )
        salon = res.scalar_one_or_none()
        if not salon:
            res_bs = await session.execute(select(Salon).where(Salon.id == 1))
            salon = res_bs.scalar_one_or_none()

        if not salon:
            return web.json_response({"error": "Salon not found"}, headers=CORS_HEADERS, status=404)

        # Список мастеров
        masters_res = await session.execute(
            select(Master).where(Master.salon_id == salon.id).order_by(Master.id)
        )
        db_masters = []
        for m in masters_res.scalars().all():
            m_slots = ["10:00", "12:00", "14:30", "16:00", "18:00"]
            if m.slots_json:
                try:
                    parsed_s = json.loads(m.slots_json)
                    if isinstance(parsed_s, list) and len(parsed_s) > 0:
                        m_slots = parsed_s
                except Exception:
                    pass
            db_masters.append({
                "id": f"db_master_{m.id}",
                "name": m.name,
                "lastName": m.last_name or "",
                "role_title": m.role_title,
                "experience": m.experience or "3 года",
                "avatar_url": m.avatar_url or "",
                "telegram_handle": m.telegram_handle or "",
                "telegram_id": m.telegram_id,
                "bio": m.bio or "",
                "slots": m_slots,
            })

        services = []
        if salon.services_json:
            try:
                services = json.loads(salon.services_json)
            except Exception:
                pass

        updated_time = 0
        if getattr(salon, "updated_at", None):
            updated_time = int(salon.updated_at.timestamp() * 1000)
        elif getattr(salon, "created_at", None):
            updated_time = int(salon.created_at.timestamp() * 1000)

        payload = {
            "id": salon.id,
            "name": salon.name or "",
            "address": salon.address or "",
            "phone": salon.phone or "",
            "city": salon.region_name or "Москва",
            "cityKey": salon.region or "moscow",
            "latitude": salon.latitude,
            "longitude": salon.longitude,
            "avatar_url": salon.logo_url or "",
            "cover_url": salon.cover_image_url or "",
            "admin_tag": salon.admin_tag or "",
            "schedule": salon.schedule_json or "{}",
            "top": bool(getattr(salon, "top", False)),
            "masters": db_masters,
            "services": services,
            "updatedAt": updated_time,
        }
        return web.json_response(payload, headers=CORS_HEADERS)


async def handle_update_salon(request: web.Request) -> web.Response:
    """Обновляет профиль салона в PostgreSQL при редактировании в Mini App"""
    bot = request.app.get("bot")
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"Invalid JSON: {e}"}, status=400, headers=CORS_HEADERS)

    user_id = data.get("user_id") or 1205557089
    s_name = data.get("salon_name")
    s_addr = data.get("address")
    s_phone = data.get("phone")
    s_city = data.get("city")
    s_avatar = data.get("avatar_url")
    s_cover = data.get("cover_url")
    s_admin_tag = data.get("admin_tag")
    s_lat = data.get("latitude")
    s_lon = data.get("longitude")
    s_masters = data.get("masters")
    s_services = data.get("services")

    async with async_session_maker() as session:
        # Ищем салон пользователя
        res = await session.execute(
            select(Salon).where((Salon.owner_id == user_id) | (Salon.admin_id == user_id))
        )
        salon = res.scalar_one_or_none()
        if not salon:
            res_bs = await session.execute(select(Salon).where(Salon.id == 1))
            salon = res_bs.scalar_one_or_none()

        if salon:
            if not salon.owner_id:
                salon.owner_id = user_id
            if s_name is not None:
                salon.name = s_name.strip()
                new_slug = transliterate_to_latin(s_name.strip())
                if new_slug:
                    salon.slug = new_slug
            if s_addr is not None:
                salon.address = s_addr.strip()
            if s_phone is not None:
                salon.phone = s_phone.strip()
            if s_city is not None:
                salon.region_name = s_city.strip()
            s_city_key = data.get("cityKey") or data.get("city_key")
            if s_city_key:
                salon.region = s_city_key.strip()
            elif s_city and "ростов" in s_city.lower():
                salon.region = "rostov"
            elif s_city and "москв" in s_city.lower():
                salon.region = "moscow"
            if s_avatar is not None:
                salon.logo_url = s_avatar
            if s_cover is not None:
                salon.cover_image_url = s_cover
            if s_admin_tag is not None:
                salon.admin_tag = s_admin_tag.strip()
                if not salon.admin_tag:
                    salon.admin_id = None
            if s_lat is not None:
                try:
                    salon.latitude = float(s_lat)
                except Exception:
                    pass
            if s_lon is not None:
                try:
                    salon.longitude = float(s_lon)
                except Exception:
                    pass
            if s_services is not None and isinstance(s_services, list):
                salon.services_json = json.dumps(s_services, ensure_ascii=False)
            if s_masters is not None and isinstance(s_masters, list):
                await sync_salon_masters(session, salon.id, s_masters)

            s_type = data.get("salon_type") or data.get("business_type")
            if s_type is not None:
                salon.salon_type = str(s_type).strip()

            s_filter_tags = data.get("filter_tags") or data.get("filterTags")
            if s_filter_tags is not None:
                if isinstance(s_filter_tags, list):
                    salon.filter_tags_json = json.dumps(s_filter_tags, ensure_ascii=False)
                elif isinstance(s_filter_tags, str):
                    salon.filter_tags_json = s_filter_tags

            s_keywords = data.get("search_keywords") or data.get("searchKeywords")
            if s_keywords is not None:
                if isinstance(s_keywords, list):
                    salon.search_keywords_json = json.dumps(s_keywords, ensure_ascii=False)
                elif isinstance(s_keywords, str):
                    salon.search_keywords_json = s_keywords

            s_promoted = data.get("is_promoted") if "is_promoted" in data else data.get("isPromoted")
            if s_promoted is not None:
                salon.is_promoted = bool(s_promoted)

            if "top" in data:
                salon.top = bool(data["top"])

            s_photos = data.get("photos")
            if s_photos is not None:
                if isinstance(s_photos, list):
                    salon.photos_json = json.dumps(s_photos, ensure_ascii=False)
                elif isinstance(s_photos, str):
                    salon.photos_json = s_photos

            s_schedule = data.get("schedule") or data.get("schedule_json")
            if s_schedule is not None:
                if isinstance(s_schedule, (dict, list)):
                    salon.schedule_json = json.dumps(s_schedule, ensure_ascii=False)
                elif isinstance(s_schedule, str):
                    salon.schedule_json = s_schedule

            now = datetime.utcnow()
            if hasattr(salon, "updated_at"):
                salon.updated_at = now

            # Обновляем пользователя
            u_res = await session.execute(select(User).where(User.telegram_id == user_id))
            user = u_res.scalar_one_or_none()
            if user:
                user.is_pro = True
                user.salon_id = salon.id
                if s_phone is not None:
                    user.phone = s_phone.strip()

            await session.commit()
            logger.info(
                f"✅ [API] Салон '{salon.name}' (ID {salon.id}, адрес: '{salon.address}', телефон: '{salon.phone}') успешно сохранен в PostgreSQL!"
            )

            # Обновляем MenuButton для пользователя со свежими параметрами
            if bot:
                try:
                    fresh_url = await get_user_app_url(user_id)
                    await bot.set_chat_menu_button(
                        chat_id=user_id,
                        menu_button=MenuButtonWebApp(
                            text="💅 Окошко",
                            web_app=WebAppInfo(url=fresh_url),
                        ),
                    )
                except Exception as m_err:
                    logger.warning(f"Не удалось обновить MenuButton для {user_id}: {m_err}")

            return web.json_response(
                {"status": "ok", "message": "Salon data saved to PostgreSQL successfully"},
                headers=CORS_HEADERS,
            )

    return web.json_response({"error": "Salon not found"}, status=404, headers=CORS_HEADERS)


async def handle_update_user_phone(request: web.Request) -> web.Response:
    """Обновляет номер телефона пользователя в PostgreSQL"""
    bot = request.app.get("bot")
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"Invalid JSON: {e}"}, status=400, headers=CORS_HEADERS)

    user_id = data.get("user_id") or 1205557089
    phone = (data.get("phone") or "").strip()

    async with async_session_maker() as session:
        res = await session.execute(select(User).where(User.telegram_id == user_id))
        user = res.scalar_one_or_none()
        if not user:
            user = User(telegram_id=user_id, phone=phone)
            session.add(user)
        else:
            user.phone = phone
        await session.commit()
        logger.info(f"✅ [API] Телефон пользователя {user_id} обновлен в PostgreSQL: {phone}")

    # Обновляем MenuButton для пользователя со свежим номером телефона
    if bot:
        try:
            fresh_url = await get_user_app_url(user_id)
            await bot.set_chat_menu_button(
                chat_id=user_id,
                menu_button=MenuButtonWebApp(
                    text="💅 Окошко",
                    web_app=WebAppInfo(url=fresh_url),
                ),
            )
        except Exception as m_err:
            logger.warning(f"Не удалось обновить MenuButton для {user_id}: {m_err}")

    return web.json_response({"status": "ok", "phone": phone}, headers=CORS_HEADERS)


async def handle_get_user_phone(request: web.Request) -> web.Response:
    """Возвращает номер телефона пользователя из PostgreSQL"""
    user_id_str = request.query.get("user_id", "1205557089")
    try:
        user_id = int(user_id_str)
    except ValueError:
        user_id = 1205557089

    async with async_session_maker() as session:
        res = await session.execute(select(User).where(User.telegram_id == user_id))
        user = res.scalar_one_or_none()
        phone = user.phone if user else ""
        return web.json_response({"user_id": user_id, "phone": phone or ""}, headers=CORS_HEADERS)


async def handle_get_master(request: web.Request) -> web.Response:
    """Возвращает профиль мастера, услуги и график"""
    user_id_raw = request.query.get("user_id") or request.query.get("telegram_id")
    master_id_raw = request.query.get("master_id")
    user_id = int(user_id_raw) if user_id_raw and user_id_raw.isdigit() else 1205557089
    master_id = int(master_id_raw) if master_id_raw and master_id_raw.isdigit() else None

    async with async_session_maker() as session:
        master = None
        if master_id:
            res = await session.execute(select(Master).where(Master.id == master_id))
            master = res.scalar_one_or_none()
        if not master and user_id:
            res = await session.execute(select(Master).where(Master.telegram_id == user_id))
            master = res.scalar_one_or_none()

        if not master:
            return web.json_response({"error": "Master not found", "found": False}, status=404, headers=CORS_HEADERS)

        services = []
        if master.services_json:
            try:
                services = json.loads(master.services_json)
            except Exception:
                services = []

        slots = []
        if master.slots_json:
            try:
                slots = json.loads(master.slots_json)
            except Exception:
                slots = []

        portfolio_photos = []
        if getattr(master, "portfolio_photos_json", None):
            try:
                portfolio_photos = json.loads(master.portfolio_photos_json)
            except Exception:
                portfolio_photos = []

        return web.json_response({
            "found": True,
            "id": master.id,
            "salon_id": master.salon_id,
            "name": master.name or "",
            "lastName": master.last_name or "",
            "role_title": master.role_title or "Специалист",
            "experience": master.experience or "3 года",
            "avatar_url": master.avatar_url or "",
            "telegram_handle": master.telegram_handle or "",
            "bio": master.bio or "",
            "rating": master.rating or 5.0,
            "services": services,
            "slots": slots,
            "portfolio_photos": portfolio_photos
        }, headers=CORS_HEADERS)


async def handle_update_master(request: web.Request) -> web.Response:
    """Обновляет профиль мастера, его услуги и свободные окошки"""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"Invalid JSON: {e}"}, status=400, headers=CORS_HEADERS)

    user_id = data.get("user_id") or data.get("telegram_id") or 1205557089
    master_id = data.get("master_id")

    async with async_session_maker() as session:
        master = None
        if master_id:
            try:
                res = await session.execute(select(Master).where(Master.id == int(master_id)))
                master = res.scalar_one_or_none()
            except Exception:
                pass
        if not master and user_id:
            try:
                res = await session.execute(select(Master).where(Master.telegram_id == int(user_id)))
                master = res.scalar_one_or_none()
            except Exception:
                pass

        if not master:
            salon_id = data.get("salon_id") or 1
            master = Master(
                salon_id=salon_id,
                name=data.get("name") or "Мастер",
                last_name=data.get("lastName") or "",
                role_title=data.get("role_title") or "Специалист",
                telegram_id=int(user_id),
                telegram_handle=data.get("telegram_handle") or "",
                avatar_url=data.get("avatar_url") or "",
                experience=data.get("experience") or "3 года",
                bio=data.get("bio") or ""
            )
            session.add(master)
            await session.flush()
        else:
            if "name" in data and data["name"]:
                master.name = str(data["name"]).strip()
            if "lastName" in data:
                master.last_name = str(data["lastName"]).strip()
            if "role_title" in data and data["role_title"]:
                master.role_title = str(data["role_title"]).strip()
            if "experience" in data:
                master.experience = str(data["experience"]).strip()
            if "bio" in data:
                master.bio = str(data["bio"]).strip()
            if "avatar_url" in data:
                master.avatar_url = str(data["avatar_url"]).strip()
            if "telegram_handle" in data:
                master.telegram_handle = str(data["telegram_handle"]).strip()

        if "slots" in data and data["slots"] is not None:
            master.slots_json = json.dumps(data["slots"], ensure_ascii=False)

        if "portfolio_photos" in data and data["portfolio_photos"] is not None:
            master.portfolio_photos_json = json.dumps(data["portfolio_photos"], ensure_ascii=False)

        if "services" in data and data["services"] is not None:
            master.services_json = json.dumps(data["services"], ensure_ascii=False)
            if master.salon_id:
                s_res = await session.execute(select(Salon).where(Salon.id == master.salon_id))
                salon = s_res.scalar_one_or_none()
                if salon and salon.services_json:
                    try:
                        salon_services = json.loads(salon.services_json)
                        for m_svc in data["services"]:
                            existing = next((s for s in salon_services if s.get("id") == m_svc.get("id") or s.get("name") == m_svc.get("name")), None)
                            if existing:
                                existing["price"] = m_svc.get("price", existing.get("price", 0))
                                existing["duration"] = m_svc.get("duration", existing.get("duration", 60))
                                m_ids = existing.get("masterIds") or []
                                if master.id not in m_ids and f"db_master_{master.id}" not in m_ids:
                                    m_ids.append(master.id)
                                existing["masterIds"] = m_ids
                            else:
                                new_svc = dict(m_svc)
                                new_svc["masterIds"] = [master.id]
                                salon_services.append(new_svc)
                        salon.services_json = json.dumps(salon_services, ensure_ascii=False)
                    except Exception as err:
                        logger.warning(f"Ошибка синхронизации услуг мастера с салоном: {err}")

        await session.commit()
        return web.json_response({
            "status": "ok",
            "master_id": master.id,
            "name": master.name,
            "role_title": master.role_title
        }, headers=CORS_HEADERS)


async def handle_create_booking(request: web.Request) -> web.Response:
    """Создает новую запись клиента и сохраняет в БД PostgreSQL"""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"Invalid JSON: {e}"}, status=400, headers=CORS_HEADERS)

    user_id_raw = data.get("user_id") or 1205557089
    try:
        user_id = int(user_id_raw)
    except Exception:
        user_id = 1205557089

    salon_name = data.get("salon") or "Beauty Studio"
    master_name = data.get("master") or "Алина Романова"
    booking_date = data.get("date") or "Сегодня"
    booking_time = data.get("time") or "14:00"
    services = data.get("services") or "Маникюр"
    total_price = float(data.get("total") or 0.0)
    status = data.get("status") or "active"
    client_name = data.get("client_name") or "Клиент"
    client_phone = data.get("client_phone") or ""
    client_handle = data.get("client_handle") or ""
    salon_id_raw = data.get("salon_id")
    master_id_raw = data.get("master_id")

    salon_id = int(salon_id_raw) if salon_id_raw and str(salon_id_raw).isdigit() else 1
    master_id = int(master_id_raw) if master_id_raw and str(master_id_raw).isdigit() else None

    async with async_session_maker() as session:
        # Убеждаемся, что пользователь существует в users
        u_res = await session.execute(select(User).where(User.telegram_id == user_id))
        user = u_res.scalar_one_or_none()
        if not user:
            user = User(
                telegram_id=user_id,
                first_name=client_name or "Клиент",
                phone=client_phone or None,
                username=client_handle.replace("@", "") if client_handle else None
            )
            session.add(user)
            await session.flush()
        elif client_phone and not user.phone:
            user.phone = client_phone

        booking = Booking(
            user_id=user_id,
            salon_id=salon_id,
            salon=salon_name,
            master_id=master_id,
            master=master_name,
            client_name=client_name,
            client_phone=client_phone,
            client_handle=client_handle,
            booking_date=booking_date,
            booking_time=booking_time,
            services=services,
            total_price=total_price,
            status=status
        )
        session.add(booking)
        await session.commit()
        await session.refresh(booking)

        logger.info(f"✅ [API] Запись #{booking.id} сохранена в PostgreSQL ({client_name} -> {master_name}, {booking_date} в {booking_time})")
        return web.json_response({
            "status": "ok",
            "booking_id": booking.id,
            "message": "Запись успешно сохранена в базе данных"
        }, headers=CORS_HEADERS)


async def handle_get_pro_bookings(request: web.Request) -> web.Response:
    """Возвращает все записи клиентов для отображения в кабинете салона PRO"""
    async with async_session_maker() as session:
        res = await session.execute(select(Booking).order_by(Booking.id.desc()))
        bookings = res.scalars().all()
        items = []
        for b in bookings:
            items.append({
                "id": f"pro_bk_{b.id}",
                "bookingId": b.id,
                "clientName": b.client_name or (b.user.first_name if b.user and b.user.first_name else "Клиент"),
                "clientPhone": b.client_phone or (b.user.phone if b.user and b.user.phone else ""),
                "clientHandle": b.client_handle or (f"@{b.user.username}" if b.user and b.user.username else ""),
                "salon": b.salon,
                "salon_id": b.salon_id,
                "master": b.master,
                "master_id": b.master_id,
                "service": b.services,
                "price": b.total_price,
                "date": b.booking_date,
                "time": b.booking_time,
                "status": b.status,
                "createdAt": int(b.created_at.timestamp() * 1000) if getattr(b, "created_at", None) else 0
            })
        return web.json_response({"status": "ok", "bookings": items}, headers=CORS_HEADERS)


async def handle_update_booking_status(request: web.Request) -> web.Response:
    """Обновляет статус записи (active, completed, cancelled) в PostgreSQL"""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"Invalid JSON: {e}"}, status=400, headers=CORS_HEADERS)

    booking_id_raw = data.get("booking_id")
    new_status = data.get("status") or "completed"

    if not booking_id_raw:
        return web.json_response({"error": "booking_id is required"}, status=400, headers=CORS_HEADERS)

    clean_id_str = str(booking_id_raw).replace("pro_bk_", "").replace("bk_", "").replace("pro_", "")
    if clean_id_str.isdigit():
        async with async_session_maker() as session:
            res = await session.execute(select(Booking).where(Booking.id == int(clean_id_str)))
            booking = res.scalar_one_or_none()
            if booking:
                booking.status = new_status
                await session.commit()
                logger.info(f"✅ [API] Статус записи #{booking.id} обновлен на '{new_status}'")
                return web.json_response({"status": "ok", "booking_id": booking.id, "new_status": new_status}, headers=CORS_HEADERS)

    return web.json_response({"status": "ok", "note": "Updated locally or demo booking"}, headers=CORS_HEADERS)


async def start_api_server(bot, host="0.0.0.0", port=8080):
    """Запускает HTTP сервер для прямого взаимодействия с Mini App"""
    app = web.Application()
    app["bot"] = bot
    app.router.add_options("/api/pro_salon_update", handle_cors_options)
    app.router.add_post("/api/pro_salon_update", handle_update_salon)
    app.router.add_options("/api/pro_salon_get", handle_cors_options)
    app.router.add_get("/api/pro_salon_get", handle_get_salon)
    app.router.add_options("/api/user_phone_update", handle_cors_options)
    app.router.add_post("/api/user_phone_update", handle_update_user_phone)
    app.router.add_options("/api/user_phone_get", handle_cors_options)
    app.router.add_get("/api/user_phone_get", handle_get_user_phone)
    app.router.add_options("/api/master_update", handle_cors_options)
    app.router.add_post("/api/master_update", handle_update_master)
    app.router.add_options("/api/master_get", handle_cors_options)
    app.router.add_get("/api/master_get", handle_get_master)
    app.router.add_options("/api/booking_create", handle_cors_options)
    app.router.add_post("/api/booking_create", handle_create_booking)
    app.router.add_options("/api/pro_bookings_get", handle_cors_options)
    app.router.add_get("/api/pro_bookings_get", handle_get_pro_bookings)
    app.router.add_options("/api/booking_update_status", handle_cors_options)
    app.router.add_post("/api/booking_update_status", handle_update_booking_status)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host, port)
    await site.start()
    logger.info(f"🚀 Локальный HTTP API сервер запущен на http://127.0.0.1:{port} (эндпоинты /api/booking_create, /api/pro_bookings_get, /api/booking_update_status)")
    return runner
