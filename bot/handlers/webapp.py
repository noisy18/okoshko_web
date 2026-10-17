import json
import logging
from aiogram import Bot, F, Router
from aiogram.types import Message

from bot.database import create_booking, get_or_create_user
from bot.handlers.user import get_user_app_url

logger = logging.getLogger(__name__)
webapp_router = Router(name="webapp_router")


@webapp_router.message(F.web_app_data)
async def handle_web_app_data(message: Message):
    """
    Обработка данных бронирования, отправленных из Mini App
    через Telegram.WebApp.sendData(...)
    """
    raw_data = message.web_app_data.data
    user_id = message.from_user.id if message.from_user else "unknown"
    logger.info(f"Получены данные из WebApp от {user_id}: {raw_data}")

    try:
        data = json.loads(raw_data)
        if data.get("action") == "booking_confirmed":
            salon = data.get("salon", "Beauty Studio")
            master = data.get("master", "Алина Романова")
            date = data.get("date", "Сегодня")
            time = data.get("time", "14:00")
            services = data.get("services", "Маникюр")
            total = data.get("total", 0)

            booking_id = None
            if message.from_user:
                try:
                    await get_or_create_user(
                        telegram_id=message.from_user.id,
                        username=message.from_user.username,
                        first_name=message.from_user.first_name,
                        last_name=message.from_user.last_name,
                    )
                    booking = await create_booking(
                        user_id=message.from_user.id,
                        salon=salon,
                        master=master,
                        booking_date=date,
                        booking_time=time,
                        services=services,
                        total_price=float(total) if total else 0.0,
                    )
                    booking_id = booking.id
                except Exception as e:
                    logger.error(f"Ошибка сохранения записи в БД: {e}")

            order_number_str = f"🔖 <b>Номер брони:</b> #{booking_id}\n" if booking_id else ""

            response = (
                "🎉 <b>Запись успешно подтверждена!</b>\n\n"
                f"{order_number_str}"
                f"📍 <b>Салон:</b> {salon}\n"
                f"👩‍🎨 <b>Мастер:</b> {master}\n"
                f"🗓 <b>Дата и время:</b> {date} в {time}\n"
                f"💅 <b>Услуги:</b> {services}\n"
                f"💳 <b>Сумма к оплате:</b> {total:,.0f} ₽\n\n"
                "Оплата производится на месте после визита.\n"
                "⏰ <i>Мы пришлём вам напоминание за 2 часа до визита!</i>"
            ).replace(",", " ")

            user_app_url = await get_user_app_url(message.from_user.id if message.from_user else None)
            user_pro_url = await get_user_app_url(message.from_user.id if message.from_user else None, is_pro_entry=True)
            await message.answer(
                text=response,
            )
            return

        elif data.get("action") == "review_added":
            salon_id = data.get("salon_id")
            salon_name = data.get("salon_name", "Салон")
            user_name = data.get("user_name", "Клиент")
            service_name = data.get("service_name", "Услуга")
            rating = int(data.get("rating", 5))
            text = data.get("text", "")

            from bot.database import add_salon_review, Salon
            from bot.database.base import async_session_maker
            from sqlalchemy import select

            if message.from_user:
                try:
                    await get_or_create_user(
                        telegram_id=message.from_user.id,
                        username=message.from_user.username,
                        first_name=message.from_user.first_name,
                        last_name=message.from_user.last_name,
                    )
                    # Находим салон по slug или id
                    async with async_session_maker() as session:
                        res = await session.execute(
                            select(Salon).where((Salon.slug == str(salon_id)) | (Salon.id == int(salon_id) if str(salon_id).isdigit() else False))
                        )
                        target_salon = res.scalar_one_or_none()
                        if target_salon:
                            await add_salon_review(
                                user_id=message.from_user.id,
                                salon_id=target_salon.id,
                                user_name=user_name,
                                service_name=service_name,
                                rating=rating,
                                text=text,
                            )
                except Exception as e:
                    logger.error(f"Ошибка сохранения отзыва в БД: {e}")

            stars = "⭐" * rating
            response = (
                f"🌟 <b>Спасибо за ваш отзыв!</b>\n\n"
                f"📍 <b>Салон:</b> {salon_name}\n"
                f"💅 <b>Услуга:</b> {service_name}\n"
                f"⭐ <b>Оценка:</b> {stars} ({rating}/5)\n"
                f"💬 <b>Отзыв:</b> «{text}»\n\n"
                f"Ваша обратная связь помогает мастерам становиться лучше, а другим клиентам — выбирать лучших!"
            )
            await message.answer(
                text=response,
            )
            return

        elif data.get("action") == "business_application_submitted":
            from bot.config import BUSINESS_GROUP_ID
            from bot.database import create_business_application

            biz_type = data.get("biz_type", "salon")
            name = data.get("name", "Не указано")
            category = data.get("category", "Салон красоты")
            address = data.get("address") or "Не указан"
            contact = data.get("contact", "Не указан")
            user_tg_id = message.from_user.id if message.from_user else None

            # 1. Сохраняем в базу данных
            app_id = None
            try:
                if message.from_user:
                    await get_or_create_user(
                        telegram_id=message.from_user.id,
                        username=message.from_user.username,
                        first_name=message.from_user.first_name,
                        last_name=message.from_user.last_name,
                    )
                app = await create_business_application(
                    user_id=user_tg_id,
                    biz_type=biz_type,
                    name=name,
                    category=category,
                    address=address if address != "Не указан" else None,
                    contact=contact,
                )
                app_id = app.id
            except Exception as e:
                logger.error(f"Ошибка сохранения заявки бизнеса в БД: {e}")

            # 2. Формируем подробное уведомление для администраторов в группе
            type_label = "🏢 Салон красоты" if biz_type == "salon" else "💇 Частный мастер"
            app_id_str = f"#{app_id}" if app_id else "Новая"

            user_mention = "Не указан"
            if message.from_user:
                if message.from_user.username:
                    user_mention = f"@{message.from_user.username} (ID: <code>{message.from_user.id}</code>)"
                else:
                    user_mention = f"{message.from_user.full_name} (ID: <code>{message.from_user.id}</code>)"

            group_notification = (
                f"🔥 <b>Новая заявка на PRO Бизнес-аккаунт!</b>\n\n"
                f"📌 <b>Заявка:</b> {app_id_str}\n"
                f"🏷 <b>Тип:</b> {type_label}\n"
                f"🏢 <b>Название / Имя:</b> <b>{name}</b>\n"
                f"💅 <b>Категория:</b> {category}\n"
                f"📍 <b>Адрес:</b> {address}\n"
                f"📞 <b>Контакт для связи:</b> <code>{contact}</code>\n"
                f"👤 <b>Отправитель в TG:</b> {user_mention}\n\n"
                f"⚡ <i>Свяжитесь с партнером для подключения и настройки профиля!</i>"
            )

            # 3. Отправляем в группу бизнеса
            try:
                await message.bot.send_message(
                    chat_id=BUSINESS_GROUP_ID,
                    text=group_notification,
                )
                logger.info(f"Заявка на PRO аккаунт {app_id_str} успешно отправлена в группу {BUSINESS_GROUP_ID}")
            except Exception as e:
                logger.error(f"Не удалось отправить заявку в группу {BUSINESS_GROUP_ID}: {e}")

            # 4. Отвечаем пользователю в личный чат с ботом
            user_response = (
                f"🎉 <b>Ваша заявка на подключение PRO принята!</b>\n\n"
                f"🏢 <b>Предприятие:</b> {name}\n"
                f"🏷 <b>Категория:</b> {category}\n"
                f"📞 <b>Контакт:</b> {contact}\n\n"
                f"Менеджер Okoshko уже получил вашу заявку и свяжется с вами в Telegram в ближайшее время для подтверждения данных."
            )
            await message.answer(
                text=user_response,
            )
            return

        elif data.get("action") == "pro_salon_updated":
            from bot.database import Salon, User
            from bot.database.base import async_session_maker
            from sqlalchemy import select

            s_name = data.get("salon_name", "Beauty Studio")
            s_addr = data.get("address")
            s_phone = data.get("phone")
            s_city = data.get("city")
            s_avatar = data.get("avatar_url")
            s_cover = data.get("cover_url")
            s_admin_tag = data.get("admin_tag")
            s_lat = data.get("latitude")
            s_lon = data.get("longitude")
            target_salon_id = data.get("salon_id")
            user_id = message.from_user.id if message.from_user else None

            if user_id:
                from bot.database.requests import transliterate_to_latin
                async with async_session_maker() as session:
                    # Ищем сначала пользователя для определения его salon_id или роли
                    u_res = await session.execute(select(User).where(User.telegram_id == user_id))
                    user = u_res.scalar_one_or_none()
                    user_salon_id = user.salon_id if user else None

                    # Ищем салон пользователя с приоритетом:
                    # 1. Где user_id является owner_id или admin_id
                    # 2. По привязке user.salon_id
                    # 3. По явному target_salon_id
                    # 4. Лишь при их отсутствии — салон по умолчанию (ID 1)
                    salon = None
                    owner_res = await session.execute(
                        select(Salon).where((Salon.owner_id == user_id) | (Salon.admin_id == user_id))
                    )
                    salon = owner_res.scalar_one_or_none()

                    if not salon and user_salon_id:
                        us_res = await session.execute(select(Salon).where(Salon.id == user_salon_id))
                        salon = us_res.scalar_one_or_none()

                    if not salon and target_salon_id:
                        ts_res = await session.execute(select(Salon).where(Salon.id == target_salon_id))
                        salon = ts_res.scalar_one_or_none()

                    if not salon:
                        bs_res = await session.execute(select(Salon).where(Salon.id == 1))
                        salon = bs_res.scalar_one_or_none()

                    if salon:
                        if not salon.owner_id and (not user or user.role != "admin"):
                            salon.owner_id = user_id
                        salon.name = s_name
                        # Обновляем slug на основе транслитерации нового названия
                        new_slug = transliterate_to_latin(s_name)
                        if new_slug:
                            # Проверяем уникальность slug перед обновлением
                            slug_check = await session.execute(
                                select(Salon).where((Salon.slug == new_slug) & (Salon.id != salon.id))
                            )
                            if not slug_check.scalar_one_or_none():
                                salon.slug = new_slug
                        s_lat = data.get("latitude")
                        s_lon = data.get("longitude")
                        if s_addr is not None: salon.address = s_addr
                        if s_city is not None: salon.region_name = s_city
                        if s_phone is not None: salon.phone = s_phone
                        if s_avatar is not None: salon.logo_url = s_avatar
                        if s_cover is not None: salon.cover_image_url = s_cover
                        if s_admin_tag is not None:
                            salon.admin_tag = s_admin_tag
                            if not s_admin_tag:
                                salon.admin_id = None
                        if s_lat is not None:
                            try:
                                salon.latitude = float(s_lat)
                            except (ValueError, TypeError):
                                pass
                        if s_lon is not None:
                            try:
                                salon.longitude = float(s_lon)
                            except (ValueError, TypeError):
                                pass

                        # Синхронизация услуг салона в БД
                        s_services = data.get("services")
                        if s_services is not None and isinstance(s_services, list):
                            salon.services_json = json.dumps(s_services, ensure_ascii=False)

                        # Синхронизация мастеров салона в БД
                        s_masters = data.get("masters")
                        if s_masters is not None and isinstance(s_masters, list):
                            from bot.database import sync_salon_masters
                            await sync_salon_masters(session, salon.id, s_masters)

                        # Также обновляем пользователя как владельца/PRO
                        if user:
                            user.is_pro = True
                            user.salon_id = salon.id
                            if s_phone is not None:
                                user.phone = s_phone

                        await session.commit()
                        logger.info(f"Данные салона '{s_name}' (ID {salon.id}, slug '{salon.slug}', адрес '{salon.address}', телефон '{salon.phone}') успешно обновлены в БД для пользователя {user_id}")

                        # Обновляем кнопку меню чата для пользователя со свежими параметрами салона
                        try:
                            fresh_url = await get_user_app_url(user_id)
                            from aiogram.types import MenuButtonWebApp, WebAppInfo
                            await message.bot.set_chat_menu_button(
                                chat_id=user_id,
                                menu_button=MenuButtonWebApp(
                                    text="💅 Окошко",
                                    web_app=WebAppInfo(url=fresh_url),
                                ),
                            )
                            if salon.owner_id and salon.owner_id != user_id:
                                owner_fresh_url = await get_user_app_url(salon.owner_id)
                                await message.bot.set_chat_menu_button(
                                    chat_id=salon.owner_id,
                                    menu_button=MenuButtonWebApp(
                                        text="💅 Окошко",
                                        web_app=WebAppInfo(url=owner_fresh_url),
                                    ),
                                )
                            await message.bot.send_message(
                                chat_id=user_id,
                                text=f"✅ Данные салона «{s_name}» успешно сохранены в базе данных!\n📍 Адрес: {salon.address or 'не указан'}\n📞 Телефон: {salon.phone or 'не указан'}",
                            )
                        except Exception as m_err:
                            logger.warning(f"Не удалось обновить MenuButton для {user_id}: {m_err}")
                return
        elif data.get("action") == "user_phone_updated":
            from bot.database import User
            from bot.database.base import async_session_maker
            from sqlalchemy import select

            new_phone = data.get("phone")
            user_id = message.from_user.id if message.from_user else None
            if user_id and new_phone:
                async with async_session_maker() as session:
                    u_res = await session.execute(select(User).where(User.telegram_id == user_id))
                    user = u_res.scalar_one_or_none()
                    if user:
                        user.phone = new_phone
                        await session.commit()
                        logger.info(f"Телефон пользователя {user_id} успешно обновлен в БД: {new_phone}")
            return

    except Exception as e:
        logger.error(f"Ошибка парсинга WebApp данных: {e}")

    user_app_url = await get_user_app_url(message.from_user.id if message.from_user else None)
    user_pro_url = await get_user_app_url(message.from_user.id if message.from_user else None, is_pro_entry=True)
    await message.answer(
        f"✅ Данные из приложения получены:\n<code>{raw_data}</code>",
    )


@webapp_router.message(F.text.startswith('{"action":'))
async def handle_direct_json_data(message: Message):
    """
    Обработка данных, если WebApp отправляет обновление профиля салона
    напрямую через Telegram Bot API sendMessage при открытии не из inline-кнопки
    """
    raw_data = message.text
    user_id = message.from_user.id if message.from_user else None
    logger.info(f"Получены прямые JSON данные от {user_id}: {raw_data}")

    try:
        data = json.loads(raw_data)
        if data.get("action") == "pro_salon_updated" and user_id:
            from bot.database import Salon, User
            from bot.database.base import async_session_maker
            from bot.database.requests import transliterate_to_latin
            from sqlalchemy import select

            s_name = data.get("salon_name", "Beauty Studio")
            s_addr = data.get("address")
            s_phone = data.get("phone")
            s_city = data.get("city")
            s_avatar = data.get("avatar_url")
            s_cover = data.get("cover_url")
            s_admin_tag = data.get("admin_tag")
            target_salon_id = data.get("salon_id")

            async with async_session_maker() as session:
                u_res = await session.execute(select(User).where(User.telegram_id == user_id))
                user = u_res.scalar_one_or_none()
                user_salon_id = user.salon_id if user else None

                salon = None
                owner_res = await session.execute(
                    select(Salon).where((Salon.owner_id == user_id) | (Salon.admin_id == user_id))
                )
                salon = owner_res.scalar_one_or_none()

                if not salon and user_salon_id:
                    us_res = await session.execute(select(Salon).where(Salon.id == user_salon_id))
                    salon = us_res.scalar_one_or_none()

                if not salon and target_salon_id:
                    ts_res = await session.execute(select(Salon).where(Salon.id == target_salon_id))
                    salon = ts_res.scalar_one_or_none()

                if not salon:
                    bs_res = await session.execute(select(Salon).where(Salon.id == 1))
                    salon = bs_res.scalar_one_or_none()

                if salon:
                    if not salon.owner_id and (not user or user.role != "admin"):
                        salon.owner_id = user_id
                    salon.name = s_name
                    new_slug = transliterate_to_latin(s_name)
                    if new_slug:
                        slug_check = await session.execute(
                            select(Salon).where((Salon.slug == new_slug) & (Salon.id != salon.id))
                        )
                        if not slug_check.scalar_one_or_none():
                            salon.slug = new_slug
                    s_lat = data.get("latitude")
                    s_lon = data.get("longitude")
                    if s_addr is not None: salon.address = s_addr
                    if s_city is not None: salon.region_name = s_city
                    if s_lat is not None:
                        try:
                            salon.latitude = float(s_lat)
                        except (ValueError, TypeError):
                            pass
                    if s_lon is not None:
                        try:
                            salon.longitude = float(s_lon)
                        except (ValueError, TypeError):
                            pass
                    if s_phone is not None: salon.phone = s_phone
                    if s_avatar is not None: salon.logo_url = s_avatar
                    if s_cover is not None: salon.cover_image_url = s_cover
                    if s_admin_tag is not None:
                        salon.admin_tag = s_admin_tag
                        if not s_admin_tag:
                            salon.admin_id = None

                    # Синхронизация услуг салона в БД
                    s_services = data.get("services")
                    if s_services is not None and isinstance(s_services, list):
                        salon.services_json = json.dumps(s_services, ensure_ascii=False)

                    # Синхронизация мастеров салона в БД
                    s_masters = data.get("masters")
                    if s_masters is not None and isinstance(s_masters, list):
                        from bot.database import sync_salon_masters
                        await sync_salon_masters(session, salon.id, s_masters)

                    if user:
                        user.is_pro = True
                        user.salon_id = salon.id
                        if s_phone is not None:
                            user.phone = s_phone

                    await session.commit()
                    logger.info(f"Данные салона '{s_name}' (ID {salon.id}, slug '{salon.slug}', адрес '{salon.address}', телефон '{salon.phone}') успешно обновлены в БД для пользователя {user_id} через прямой канал")

                    # Обновляем кнопку меню чата для пользователя со свежими параметрами салона
                    try:
                        fresh_url = await get_user_app_url(user_id)
                        from aiogram.types import MenuButtonWebApp, WebAppInfo
                        await message.bot.set_chat_menu_button(
                            chat_id=user_id,
                            menu_button=MenuButtonWebApp(
                                text="💅 Окошко",
                                web_app=WebAppInfo(url=fresh_url),
                            ),
                        )
                        if salon.owner_id and salon.owner_id != user_id:
                            owner_fresh_url = await get_user_app_url(salon.owner_id)
                            await message.bot.set_chat_menu_button(
                                chat_id=salon.owner_id,
                                menu_button=MenuButtonWebApp(
                                    text="💅 Окошко",
                                    web_app=WebAppInfo(url=owner_fresh_url),
                                ),
                            )
                        await message.bot.send_message(
                            chat_id=user_id,
                            text=f"✅ Данные салона «{s_name}» успешно сохранены в базе данных!\n📍 Адрес: {salon.address or 'не указан'}\n📞 Телефон: {salon.phone or 'не указан'}",
                        )
                    except Exception as m_err:
                        logger.warning(f"Не удалось обновить MenuButton для {user_id}: {m_err}")
        
        elif data.get("action") == "user_phone_updated" and user_id:
            from bot.database import User
            from bot.database.base import async_session_maker
            from sqlalchemy import select

            new_phone = data.get("phone")
            if new_phone:
                async with async_session_maker() as session:
                    u_res = await session.execute(select(User).where(User.telegram_id == user_id))
                    user = u_res.scalar_one_or_none()
                    if user:
                        user.phone = new_phone
                        await session.commit()
                        logger.info(f"Телефон пользователя {user_id} успешно обновлен в БД через прямой канал: {new_phone}")

        # Удаляем системное JSON сообщение из чата, чтобы не засорять переписку
        try:
            await message.delete()
        except Exception:
            pass
        return
    except Exception as e:
        logger.error(f"Ошибка обработки прямого JSON: {e}")


@webapp_router.message(F.photo)
async def handle_salon_photo_upload_message(message: Message, bot: Bot):
    """
    Принимает фото аватарки или фона салона из Mini App (через bot.sendPhoto в BUSINESS_GROUP_ID),
    сохраняет постоянный CDN URL в PostgreSQL и обновляет персональную MenuButton владельца/админа.
    """
    caption = message.caption or ""
    if not (caption.startswith("#pro_salon_photo") or caption.startswith("SALON_PHOTO")):
        return

    try:
        parts = caption.split("|")
        # Формат: #pro_salon_photo|avatar|1205557089|1
        photo_type = parts[1] if len(parts) > 1 else "avatar"
        user_id = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else (message.from_user.id if message.from_user else 1205557089)
        salon_id = int(parts[3]) if len(parts) > 3 and parts[3].isdigit() else 1

        file_id = message.photo[-1].file_id
        file_info = await bot.get_file(file_id)
        if not file_info.file_path:
            return

        cdn_url = f"https://api.telegram.org/file/bot{bot.token}/{file_info.file_path}"

        from bot.database import Salon
        from bot.database.base import async_session_maker
        from sqlalchemy import select
        from datetime import datetime

        async with async_session_maker() as session:
            res = await session.execute(
                select(Salon).where((Salon.owner_id == user_id) | (Salon.admin_id == user_id) | (Salon.id == salon_id))
            )
            salon = res.scalar_one_or_none()
            if not salon:
                res_bs = await session.execute(select(Salon).where(Salon.id == 1))
                salon = res_bs.scalar_one_or_none()

            if salon:
                if photo_type == "avatar":
                    salon.logo_url = cdn_url
                elif photo_type == "cover":
                    salon.cover_image_url = cdn_url
                elif photo_type == "master":
                    logger.info(f"📸 Фото мастера загружено в CDN Telegram: {cdn_url}")
                salon.updated_at = datetime.utcnow()
                await session.commit()
                logger.info(f"📸 Фото ({photo_type}) салона ID {salon.id} успешно сохранено в PostgreSQL: {cdn_url}")

                # Обновляем кнопку меню чата для пользователя со свежей ссылкой
                try:
                    from aiogram.types import MenuButtonWebApp, WebAppInfo
                    fresh_url = await get_user_app_url(user_id)
                    await bot.set_chat_menu_button(
                        chat_id=user_id,
                        menu_button=MenuButtonWebApp(
                            text="💅 Окошко",
                            web_app=WebAppInfo(url=fresh_url),
                        ),
                    )
                    logger.info(f"Кнопка меню для {user_id} обновлена с новым фото URL")
                except Exception as m_err:
                    logger.warning(f"Не удалось обновить MenuButton для {user_id} после сохранения фото: {m_err}")
    except Exception as e:
        logger.error(f"Ошибка сохранения фото салона в БД: {e}")


@webapp_router.message(F.text.startswith("#pro_salon_add_master"))
async def handle_salon_add_master_message(message: Message, bot: Bot):
    """
    Добавляет нового мастера в PostgreSQL из Mini App (обычная форма) и обновляет MenuButton владельца
    """
    try:
        parts = message.text.split("|", 3)
        # Формат: #pro_salon_add_master|1205557089|1|{"name":"...","role_title":"..."}
        user_id = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else (message.from_user.id if message.from_user else 1205557089)
        salon_id = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 1
        m_raw = parts[3] if len(parts) > 3 else "{}"
        m_data = json.loads(m_raw)

        m_name = (m_data.get("name") or "").strip()
        if not m_name:
            return

        m_last = (m_data.get("lastName") or "").strip()
        m_role = (m_data.get("role_title") or "Специалист салона").strip()
        m_exp = (m_data.get("experience") or "3 года").strip()
        m_avatar = (m_data.get("avatar_url") or "").strip()
        safe_avatar = m_avatar if not m_avatar.startswith("data:image") else ""

        from bot.database import Salon, Master
        from bot.database.base import async_session_maker
        from sqlalchemy import select
        from datetime import datetime

        async with async_session_maker() as session:
            res = await session.execute(
                select(Salon).where((Salon.owner_id == user_id) | (Salon.admin_id == user_id) | (Salon.id == salon_id))
            )
            salon = res.scalar_one_or_none()
            if not salon:
                res_bs = await session.execute(select(Salon).where(Salon.id == 1))
                salon = res_bs.scalar_one_or_none()

            if salon:
                # Проверяем, существует ли уже мастер с таким именем в этом салоне
                existing_res = await session.execute(
                    select(Master).where(Master.salon_id == salon.id, Master.name == m_name, Master.last_name == m_last)
                )
                existing_m = existing_res.scalar_one_or_none()
                if existing_m:
                    existing_m.role_title = m_role
                    existing_m.experience = m_exp
                    if safe_avatar:
                        existing_m.avatar_url = safe_avatar
                else:
                    new_m = Master(
                        salon_id=salon.id,
                        name=m_name,
                        last_name=m_last,
                        role_title=m_role,
                        experience=m_exp,
                        avatar_url=safe_avatar,
                    )
                    session.add(new_m)

                salon.updated_at = datetime.utcnow()
                await session.commit()
                logger.info(f"💇 Мастер '{m_name} {m_last}' успешно сохранен в PostgreSQL (салон ID {salon.id})")

                # Обновляем MenuButton для владельца салона со свежим списком мастеров
                try:
                    from aiogram.types import MenuButtonWebApp, WebAppInfo
                    fresh_url = await get_user_app_url(user_id)
                    await bot.set_chat_menu_button(
                        chat_id=user_id,
                        menu_button=MenuButtonWebApp(
                            text="💅 Окошко",
                            web_app=WebAppInfo(url=fresh_url),
                        ),
                    )
                    logger.info(f"MenuButton для {user_id} обновлена со свежим списком мастеров")
                except Exception as m_err:
                    logger.warning(f"Не удалось обновить MenuButton для {user_id}: {m_err}")
    except Exception as e:
        logger.error(f"Ошибка сохранения мастера из формы в БД: {e}")
    finally:
        try:
            await message.delete()
        except Exception:
            pass


@webapp_router.message(F.text.startswith("#pro_salon_delete_master"))
async def handle_salon_delete_master_message(message: Message, bot: Bot):
    """
    Удаляет мастера из PostgreSQL при удалении из Mini App
    """
    try:
        parts = message.text.split("|")
        # Формат: #pro_salon_delete_master|1205557089|1|master_id_or_tag|m_name
        user_id = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else (message.from_user.id if message.from_user else 1205557089)
        salon_id = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 1
        m_id_str = parts[3] if len(parts) > 3 else ""
        m_name = parts[4] if len(parts) > 4 else ""

        from bot.database import Salon, Master
        from bot.database.base import async_session_maker
        from sqlalchemy import select
        from datetime import datetime

        async with async_session_maker() as session:
            target_m = None
            if m_id_str.startswith("db_master_"):
                try:
                    db_id = int(m_id_str.replace("db_master_", ""))
                    res = await session.execute(select(Master).where(Master.id == db_id))
                    target_m = res.scalar_one_or_none()
                except Exception:
                    pass
            elif m_id_str.isdigit():
                res = await session.execute(select(Master).where(Master.id == int(m_id_str)))
                target_m = res.scalar_one_or_none()

            if not target_m and m_name:
                import urllib.parse
                clean_name = urllib.parse.unquote(m_name).strip()
                res = await session.execute(select(Master).where(Master.salon_id == salon_id, Master.name == clean_name))
                target_m = res.scalar_one_or_none()

            if target_m:
                await session.delete(target_m)
                salon_res = await session.execute(select(Salon).where(Salon.id == salon_id))
                salon = salon_res.scalar_one_or_none()
                if salon:
                    salon.updated_at = datetime.utcnow()
                await session.commit()
                logger.info(f"🗑️ Мастер ID {target_m.id} удален из PostgreSQL")

                try:
                    from aiogram.types import MenuButtonWebApp, WebAppInfo
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
    except Exception as e:
        logger.error(f"Ошибка удаления мастера в БД: {e}")
    finally:
        try:
            await message.delete()
        except Exception:
            pass


@webapp_router.message(F.text.startswith("#pro_salon_remove_photo"))
async def handle_salon_remove_photo_message(message: Message, bot: Bot):
    """
    Очищает URL аватарки или фона салона в PostgreSQL при удалении из Mini App.
    """
    try:
        parts = message.text.split("|")
        # Формат: #pro_salon_remove_photo|avatar|1205557089|1
        photo_type = parts[1] if len(parts) > 1 else "avatar"
        user_id = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else (message.from_user.id if message.from_user else 1205557089)
        salon_id = int(parts[3]) if len(parts) > 3 and parts[3].isdigit() else 1

        from bot.database import Salon
        from bot.database.base import async_session_maker
        from sqlalchemy import select
        from datetime import datetime

        async with async_session_maker() as session:
            res = await session.execute(
                select(Salon).where((Salon.owner_id == user_id) | (Salon.admin_id == user_id) | (Salon.id == salon_id))
            )
            salon = res.scalar_one_or_none()
            if not salon:
                res_bs = await session.execute(select(Salon).where(Salon.id == 1))
                salon = res_bs.scalar_one_or_none()

            if salon:
                if photo_type == "avatar":
                    salon.logo_url = ""
                else:
                    salon.cover_image_url = ""
                salon.updated_at = datetime.utcnow()
                await session.commit()
                logger.info(f"🗑️ Фото ({photo_type}) салона ID {salon.id} очищено в PostgreSQL")

                try:
                    from aiogram.types import MenuButtonWebApp, WebAppInfo
                    fresh_url = await get_user_app_url(user_id)
                    await bot.set_chat_menu_button(
                        chat_id=user_id,
                        menu_button=MenuButtonWebApp(
                            text="💅 Окошко",
                            web_app=WebAppInfo(url=fresh_url),
                        ),
                    )
                except Exception as m_err:
                    logger.warning(f"Не удалось обновить MenuButton для {user_id} после удаления фото: {m_err}")
    except Exception as e:
        logger.error(f"Ошибка удаления фото салона в БД: {e}")


@webapp_router.message(F.text.startswith("#pro_salon_update_info"))
async def handle_salon_update_info_message(message: Message, bot: Bot):
    """
    Обновляет основные данные салона (название, адрес, город, координаты, телефон) в PostgreSQL из Mini App
    Формат: #pro_salon_update_info|user_id|salon_id|{"name":"...","address":"...","city":"...","cityKey":"...","latitude":...,"longitude":...,"phone":"..."}
    """
    try:
        parts = message.text.split("|", 3)
        user_id = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else (message.from_user.id if message.from_user else 1205557089)
        salon_id = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 1
        raw_payload = parts[3] if len(parts) > 3 else "{}"
        payload = json.loads(raw_payload)

        from bot.database.base import async_session_maker
        from bot.database.models import Salon
        from bot.database.requests import transliterate_to_latin
        from bot.handlers.user import get_user_app_url
        from aiogram.types import MenuButtonWebApp, WebAppInfo
        from sqlalchemy import select

        async with async_session_maker() as session:
            res = await session.execute(
                select(Salon).where((Salon.owner_id == user_id) | (Salon.admin_id == user_id) | (Salon.id == salon_id))
            )
            salon = res.scalar_one_or_none()
            if not salon:
                res_first = await session.execute(select(Salon).where(Salon.id == 1))
                salon = res_first.scalar_one_or_none()

            if salon:
                if not salon.owner_id:
                    salon.owner_id = user_id

                name = (payload.get("name") or "").strip()
                if name:
                    salon.name = name
                    slug = transliterate_to_latin(name)
                    if slug:
                        salon.slug = slug

                address = (payload.get("address") or "").strip()
                if address:
                    salon.address = address

                city = (payload.get("city") or "").strip()
                city_key = (payload.get("cityKey") or "").strip()

                # Автоопределение города если в адресе есть Ростов или Москва
                addr_lower = (address or "").lower()
                city_lower = (city or "").lower()
                if "ростов" in addr_lower or "ростов" in city_lower:
                    city = "Ростов-на-Дону"
                    city_key = "rostov"
                elif "москв" in addr_lower or "москв" in city_lower:
                    city = "Москва"
                    city_key = "moscow"

                if city:
                    salon.region_name = city
                if city_key:
                    salon.region = city_key

                lat = payload.get("latitude")
                lon = payload.get("longitude")
                if lat is not None:
                    try:
                        salon.latitude = float(lat)
                    except (ValueError, TypeError):
                        pass
                if lon is not None:
                    try:
                        salon.longitude = float(lon)
                    except (ValueError, TypeError):
                        pass

                phone = (payload.get("phone") or "").strip()
                if phone:
                    salon.phone = phone

                admin_tag = payload.get("admin_tag")
                if admin_tag is not None:
                    salon.admin_tag = admin_tag.strip()
                    if not salon.admin_tag:
                        salon.admin_id = None

                salon_type = payload.get("salon_type")
                if salon_type is not None:
                    salon.salon_type = salon_type.strip()

                filter_tags = payload.get("filter_tags")
                if filter_tags is not None:
                    if isinstance(filter_tags, list):
                        salon.filter_tags_json = json.dumps(filter_tags, ensure_ascii=False)
                    elif isinstance(filter_tags, str):
                        salon.filter_tags_json = filter_tags

                search_keywords = payload.get("search_keywords")
                if search_keywords is not None:
                    if isinstance(search_keywords, list):
                        salon.search_keywords_json = json.dumps(search_keywords, ensure_ascii=False)
                    elif isinstance(search_keywords, str):
                        salon.search_keywords_json = search_keywords

                is_promoted = payload.get("is_promoted")
                if is_promoted is not None:
                    salon.is_promoted = bool(is_promoted)

                salon.updated_at = datetime.utcnow()
                await session.commit()
                logger.info(f"✅ Данные салона id={salon.id} обновлены в БД: name='{salon.name}', city='{salon.region_name}', addr='{salon.address}', coords=[{salon.latitude}, {salon.longitude}]")

                # Обновляем кнопку меню владельца
                try:
                    fresh_url = await get_user_app_url(user_id)
                    await bot.set_chat_menu_button(
                        chat_id=user_id,
                        menu_button=MenuButtonWebApp(
                            text="💅 Окошко",
                            web_app=WebAppInfo(url=fresh_url),
                        ),
                    )
                    logger.info(f"MenuButton для {user_id} обновлена со свежими координатами и адресом")
                except Exception as m_err:
                    logger.warning(f"Не удалось обновить MenuButton: {m_err}")

        # Удаляем сервисное сообщение
        try:
            await message.delete()
        except Exception:
            pass

    except Exception as e:
        logger.error(f"Ошибка в handle_salon_update_info_message: {e}")


