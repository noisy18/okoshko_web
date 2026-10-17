import logging
from typing import Optional
from aiogram import Bot, F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, MenuButtonWebApp, Message, WebAppInfo

from bot.config import MINI_APP_URL
from bot.database import (
    get_or_create_user,
    get_salon_by_slug_or_name,
    bind_user_as_admin,
    bind_user_as_master,
)
from bot.keyboards import (
    get_admin_invite_keyboard,
    get_master_invite_keyboard,
    get_role_choice_keyboard,
    get_master_setup_keyboard,
    get_master_services_keyboard,
    get_master_exp_keyboard,
    get_master_role_keyboard,
)

logger = logging.getLogger(__name__)
user_router = Router(name="user_router")


import urllib.parse
from aiogram.filters import Command, CommandObject, CommandStart

@user_router.message(CommandStart())
async def handle_start(message: Message, bot: Bot, command: Optional[CommandObject] = None):
    """Обработчик команды /start с поддержкой deep-link приглашений администраторов и мастеров."""
    user_name = message.from_user.first_name if message.from_user else "друг"
    start_arg = ""

    # Извлечение deep-link аргумента через CommandObject или message.text
    if command and command.args:
        start_arg = command.args.strip()
    elif message.text and " " in message.text:
        start_arg = message.text.split(maxsplit=1)[1].strip()

    # Декодируем URL-encoded символы (например %D0%BC%D0%B0%D0%BA%D1%81%D0%B8%D0%BC -> максим)
    if start_arg:
        try:
            start_arg = urllib.parse.unquote(start_arg)
        except Exception:
            pass

    app_url = MINI_APP_URL
    db_user = None

    # Регистрация / обновление пользователя в БД
    if message.from_user:
        try:
            db_user = await get_or_create_user(
                telegram_id=message.from_user.id,
                username=message.from_user.username,
                first_name=message.from_user.first_name,
                last_name=message.from_user.last_name,
            )
            app_url = await get_user_app_url(message.from_user.id)
        except Exception as e:
            logger.error(f"Ошибка сохранения пользователя {message.from_user.id} в БД: {e}")

    # Устанавливаем кнопку меню в левом нижнем углу чата (Menu Button)
    try:
        await bot.set_chat_menu_button(
            chat_id=message.chat.id,
            menu_button=MenuButtonWebApp(
                text="💅 Окошко",
                web_app=WebAppInfo(url=app_url),
            ),
        )
    except Exception as e:
        logger.warning(f"Не удалось установить MenuButton для чата {message.chat.id}: {e}")

    # Проверка deep-link на приглашение администратора или мастера
    # Поддерживаемые форматы:
    # 1. bind_admin_<salon_slug>
    # 2. bind_master_<salon_slug>_<master_name>
    # 3. invite_<salon_slug> или bind_<salon_slug> (общее приглашение с выбором Стать администратором / Стать мастером)
    if start_arg:
        logger.info(f"Получен start аргумент: '{start_arg}' от пользователя {message.from_user.id if message.from_user else 'unknown'}")

        clean_arg = start_arg.lower()
        if clean_arg.startswith("bind_admin_"):
            salon_ident = start_arg[len("bind_admin_"):].strip()
            # Пробуем найти салон по slug, имени, или если это ID владельца/салона
            owner_hint = int(salon_ident) if salon_ident.isdigit() else None
            salon = await get_salon_by_slug_or_name(salon_ident, owner_id=owner_hint)
            salon_name = salon.name if salon else salon_ident.replace("-", " ").title()
            salon_id = salon.id if salon else 1

            invite_text = (
                f"👋 Здравствуйте, <b>{user_name}</b>!\n\n"
                f"🏢 Вас пригласили присоединиться к салону <b>«{salon_name}»</b> "
                f"в качестве <b>Администратора</b>.\n\n"
                f"✨ <b>Возможности администратора:</b>\n"
                f"• Управление расписанием и записями клиентов\n"
                f"• Мгновенные уведомления о новых визитах\n"
                f"• Добавление мастеров, услуг и синхронизация графиков\n\n"
                f"Для подтверждения привязки вашего Telegram-аккаунта нажмите кнопку ниже:"
            )
            await message.answer(
                text=invite_text,
                reply_markup=get_admin_invite_keyboard(salon_id),
            )
            return

        elif clean_arg.startswith("bind_master_"):
            raw_target = start_arg[len("bind_master_"):].strip()
            parts = raw_target.split("_", 1)
            salon_ident = parts[0]
            master_hint = parts[1] if len(parts) > 1 else ""

            salon = await get_salon_by_slug_or_name(salon_ident)
            salon_name = (salon.name.strip() if salon and salon.name and salon.name.strip() else None) or "Beauty Studio"
            salon_id = salon.id if salon else (int(salon_ident) if salon_ident.isdigit() else 1)


            invite_text = (
                f"👋 Здравствуйте, <b>{user_name}</b>!\n\n"
                f"💇 Вас пригласили присоединиться к команде салона <b>«{salon_name}»</b> "
                f"в качестве <b>Мастера</b>.\n\n"
                f"✨ <b>Возможности мастера в «Окошке»:</b>\n"
                f"• Персональный онлайн-график и журнал визитов\n"
                f"• Уведомления о записях прямо в Telegram\n"
                f"• Портфолио работ и отзывы ваших постоянных клиентов\n\n"
                f"Выберите желаемую роль для привязки к салону:"
            )
            await message.answer(
                text=invite_text,
                reply_markup=get_master_invite_keyboard(salon_id, master_hint),
            )
            return

        elif clean_arg.startswith("invite_") or clean_arg.startswith("bind_"):
            prefix = "invite_" if clean_arg.startswith("invite_") else "bind_"
            salon_ident = start_arg[len(prefix):].strip()
            owner_hint = int(salon_ident) if salon_ident.isdigit() else None
            salon = await get_salon_by_slug_or_name(salon_ident, owner_id=owner_hint)
            salon_name = salon.name if salon else salon_ident.replace("-", " ").title()
            salon_id = salon.id if salon else 1

            invite_text = (
                f"👋 Здравствуйте, <b>{user_name}</b>!\n\n"
                f"🏢 Вас пригласили в команду салона <b>«{salon_name}»</b>.\n\n"
                f"Пожалуйста, выберите вашу роль для привязки вашего Telegram-аккаунта:"
            )
            await message.answer(
                text=invite_text,
                reply_markup=get_role_choice_keyboard(salon_id),
            )
            return

    welcome_text = (
        f"Привет, <b>{user_name}</b>! 👋✨\n\n"
        f"Добро пожаловать в <b>«Окошко»</b> — сервис быстрой записи "
        f"в лучшие салоны красоты и к проверенным мастерам вашего города.\n\n"
        f"🗺 <b>Реальная интерактивная карта:</b> находите свободные слоты рядом с вами\n"
        f"✨ <b>Топ-мастера:</b> реальные портфолио, отзывы и прайс-листы\n"
        f"💅 <b>Запись в 2 клика:</b> без звонков, ожидания и переписок\n"
        f"👤 <b>Telegram-профиль:</b> ваши данные автоматически синхронизированы\n\n"
        f"💅 Открывайте сервис в любой момент через синюю кнопку <b>«Меню»</b> внизу экрана слева!"
    )

    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
    app_btn = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💅 Открыть «Окошко»",
                    web_app=WebAppInfo(url=app_url),
                )
            ]
        ]
    )
    await message.answer(
        text=welcome_text,
        reply_markup=app_btn,
    )


async def get_user_app_url(telegram_id: Optional[int], is_pro_entry: bool = False) -> str:
    """Генерирует ссылку на WebApp с параметрами даты регистрации, PRO статуса, роли и администратора салона из БД"""
    if not telegram_id:
        if is_pro_entry:
            delimiter = "&" if "?" in MINI_APP_URL else "?"
            return f"{MINI_APP_URL}{delimiter}pro_entry=1"
        return MINI_APP_URL
    try:
        from bot.database.base import async_session_maker
        from bot.database.models import User, Salon
        from sqlalchemy import select

        async with async_session_maker() as session:
            res = await session.execute(select(User).where(User.telegram_id == telegram_id))
            user = res.scalar_one_or_none()
            if user:
                params = []
                if user.created_at:
                    params.append(f"registered_at={int(user.created_at.timestamp() * 1000)}")
                if user.is_pro:
                    params.append("is_pro=1")
                if user.role and user.role != "client":
                    params.append(f"pro_role={user.role}")
                if user.salon_id:
                    params.append(f"salon_id={user.salon_id}")

                # Ищем салон пользователя с четким приоритетом:
                # 1. Владелец или администратор (owner_id / admin_id)
                # 2. Привязанный user.salon_id
                # 3. Лишь если ничего нет и запрошен вход в ПРО — главный салон Beauty Studio (id 1)
                user_salon = None
                owner_res = await session.execute(
                    select(Salon).where((Salon.owner_id == telegram_id) | (Salon.admin_id == telegram_id))
                )
                user_salon = owner_res.scalar_one_or_none()

                if not user_salon and user.salon_id:
                    us_res = await session.execute(select(Salon).where(Salon.id == user.salon_id))
                    user_salon = us_res.scalar_one_or_none()

                if not user_salon and (user.is_pro or user.role == "admin" or is_pro_entry):
                    bs_res = await session.execute(select(Salon).where(Salon.id == 1))
                    user_salon = bs_res.scalar_one_or_none()

                if user_salon:
                    import urllib.parse
                    import json
                    from bot.database.models import Master

                    if user_salon.admin_tag and user_salon.admin_tag.strip():
                        params.append(f"admin_tag={urllib.parse.quote(user_salon.admin_tag.strip())}")
                    if user_salon.name and user_salon.name.strip():
                        params.append(f"salon_name={urllib.parse.quote(user_salon.name.strip())}")
                    if user_salon.address and user_salon.address.strip():
                        params.append(f"address={urllib.parse.quote(user_salon.address.strip())}")
                    if user_salon.region_name and user_salon.region_name.strip():
                        params.append(f"city={urllib.parse.quote(user_salon.region_name.strip())}")
                    if getattr(user_salon, "region", None) and user_salon.region.strip():
                        params.append(f"city_key={urllib.parse.quote(user_salon.region.strip())}")
                    if user_salon.latitude is not None and user_salon.latitude != 0:
                        params.append(f"lat={user_salon.latitude}")
                    if user_salon.longitude is not None and user_salon.longitude != 0:
                        params.append(f"lon={user_salon.longitude}")
                    salon_phone = getattr(user_salon, "phone", None)
                    if salon_phone and salon_phone.strip():
                        params.append(f"phone={urllib.parse.quote(salon_phone.strip())}")
                    if getattr(user_salon, "logo_url", None) and user_salon.logo_url.strip() and len(user_salon.logo_url) < 1000:
                        params.append(f"avatar_url={urllib.parse.quote(user_salon.logo_url.strip())}")
                    if getattr(user_salon, "cover_image_url", None) and user_salon.cover_image_url.strip() and len(user_salon.cover_image_url) < 1000:
                        params.append(f"cover_url={urllib.parse.quote(user_salon.cover_image_url.strip())}")
                    if user_salon.id:
                        params.append(f"salon_id={user_salon.id}")

                    updated_ts = 0
                    if getattr(user_salon, "updated_at", None):
                        updated_ts = int(user_salon.updated_at.timestamp() * 1000)
                    elif getattr(user_salon, "created_at", None):
                        updated_ts = int(user_salon.created_at.timestamp() * 1000)
                    if updated_ts > 0:
                        params.append(f"v={updated_ts}")

                    # Передаем список услуг салона из БД в Mini App
                    if getattr(user_salon, "services_json", None):
                        params.append(f"services_json={urllib.parse.quote(user_salon.services_json)}")

                    # Передаем актуальный список мастеров салона из БД в Mini App
                    try:
                        masters_res = await session.execute(
                            select(Master).where(Master.salon_id == user_salon.id).order_by(Master.id)
                        )
                        db_masters = list(masters_res.scalars().all())
                        if db_masters:
                            masters_list = [
                                {
                                    "id": f"db_master_{m.id}",
                                    "name": m.name,
                                    "lastName": m.last_name or "",
                                    "role_title": m.role_title,
                                    "experience": m.experience or "3 года",
                                    "avatar_url": m.avatar_url or "",
                                    "telegram_handle": m.telegram_handle or "",
                                    "telegram_id": m.telegram_id,
                                }
                                for m in db_masters
                            ]
                            masters_json_str = json.dumps(masters_list, ensure_ascii=False)
                            params.append(f"masters_json={urllib.parse.quote(masters_json_str)}")
                    except Exception as me:
                        logger.warning(f"Ошибка получения списка мастеров салона {user_salon.id}: {me}")

                user_phone = getattr(user, "phone", None) or (user_salon and getattr(user_salon, "phone", None))
                if user_phone:
                    params.append(f"user_phone={urllib.parse.quote(user_phone)}")

                if is_pro_entry:
                    params.append("pro_entry=1")

                if params:
                    delimiter = "&" if "?" in MINI_APP_URL else "?"
                    return f"{MINI_APP_URL}{delimiter}{'&'.join(params)}"
    except Exception as e:
        logger.warning(f"Ошибка получения параметров пользователя для {telegram_id}: {e}")

    if is_pro_entry:
        delimiter = "&" if "?" in MINI_APP_URL else "?"
        return f"{MINI_APP_URL}{delimiter}pro_entry=1"
    return MINI_APP_URL




@user_router.message(Command("help"))
@user_router.message(F.text == "💬 Помощь")
async def handle_help(message: Message):
    """Справка и список возможностей."""
    user_id = message.from_user.id if message.from_user else None
    app_url = await get_user_app_url(user_id)
    pro_app_url = await get_user_app_url(user_id, is_pro_entry=True)
    help_text = (
        "<b>📖 Как пользоваться сервисом «Окошко»:</b>\n\n"
        "1️⃣ Нажмите <b>«Открыть Окошко»</b> или кнопку <b>«Записаться онлайн»</b>\n"
        "2️⃣ Выберите нужную категорию услуг (маникюр, стрижка, брови и др.)\n"
        "3️⃣ Найдите салон или мастера на Яндекс.Картах\n"
        "4️⃣ Выберите удобную дату и время из свободных «окошек»\n"
        "5️⃣ Подтвердите запись — напоминание придёт прямо сюда в чат!\n\n"
        "<b>Команды бота:</b>\n"
        "/start — Главное меню и запуск приложения\n"
        "/app — Прямая ссылка на Mini App\n"
        "/help — Помощь и справка\n\n"
        "❓ По вопросам поддержки: @okoshko_support"
    )
    await message.answer(
        text=help_text,
    )


@user_router.message(Command("app"))
async def handle_app_command(message: Message):
    """Быстрый запуск Mini App."""
    await message.answer(
        text="💅 Вы можете открыть приложение <b>«Окошко»</b> в любой момент через синюю кнопку <b>«Меню»</b> внизу экрана слева!",
    )


@user_router.callback_query(F.data == "about_service")
@user_router.message(F.text == "ℹ️ О сервисе")
async def handle_about(event: Message | CallbackQuery):
    """Информация о сервисе «Окошко»."""
    about_text = (
        "✨ <b>О сервисе «Окошко»</b>\n\n"
        "«Окошко» создано для того, чтобы поиск бьюти-мастера был лёгким, "
        "а запись — моментальной.\n\n"
        "🌸 <b>Для клиентов:</b>\n"
        "• Мгновенный просмотр свободных окон на сегодня и ближайшие дни\n"
        "• Реальные Яндекс.Карты с точными адресами салонов\n"
        "• Честные цены без скрытых доплат\n"
        "• Бонусная система и скидки на повторные визиты\n\n"
        "💼 <b>Для мастеров:</b>\n"
        "• Удобный онлайн-график и автоматические напоминания клиентам\n"
        "• Привлечение новых клиентов прямо из Telegram"
    )

    if isinstance(event, CallbackQuery):
        await event.answer()
        await event.message.answer(text=about_text)
    else:
        await event.answer(text=about_text)


@user_router.callback_query(F.data == "my_bookings")
async def handle_my_bookings(callback: CallbackQuery):
    """Переход в раздел записей."""
    await callback.answer()
    text = (
        "📅 <b>Управление вашими записями</b>\n\n"
        "Все активные и прошедшие визиты хранятся во вкладке <b>«Записи»</b> "
        "внутри приложения.\n\n"
        "Там вы можете:\n"
        "• Посмотреть точный адрес и построить маршрут на Яндекс.Картах\n"
        "• Перенести запись на другое свободное время\n"
        "• Отменить визит или связаться с мастером в Telegram\n\n"
        "Откройте приложение через кнопку меню внизу слева, чтобы просмотреть записи!"
    )
    await callback.message.answer(text=text)


@user_router.callback_query(F.data.startswith("confirm_bind_admin:"))
async def handle_confirm_bind_admin(callback: CallbackQuery, bot: Bot):
    """Подтверждение привязки пользователя в качестве Администратора салона."""
    await callback.answer()
    salon_id_raw = callback.data.split(":")[1]
    salon_id = int(salon_id_raw) if salon_id_raw.isdigit() else 1
    user = callback.from_user

    # Проверяем, не является ли пользователь уже владельцем салона
    from bot.database import Salon
    from bot.database.base import async_session_maker
    from sqlalchemy import select

    async with async_session_maker() as session:
        s_res = await session.execute(select(Salon).where(Salon.id == salon_id))
        cur_salon = s_res.scalar_one_or_none()
        if not cur_salon:
            cur_salon = (await session.execute(select(Salon).where(Salon.id == 1))).scalar_one_or_none()
        if cur_salon and cur_salon.owner_id == user.id:
            admin_handle = f"@{user.username}" if user.username else (user.first_name or f"ID {user.id}")
            cur_salon.admin_id = user.id
            cur_salon.admin_tag = admin_handle
            await session.commit()
            owner_app_url = await get_user_app_url(user.id)
            try:
                await bot.set_chat_menu_button(
                    chat_id=user.id,
                    menu_button=MenuButtonWebApp(
                        text="💅 Окошко",
                        web_app=WebAppInfo(url=owner_app_url),
                    ),
                )
            except Exception:
                pass
            await callback.message.edit_text(
                f"👑 <b>Вы являетесь Владельцем салона «{cur_salon.name or 'Мой салон'}»!</b>\n\n"
                f"👤 Вы успешно назначили себя Администратором: <b>{admin_handle}</b>.\n"
                f"Ваш статус владельца сохранен, а тег администратора теперь привязан к салону.\n\n"
                f"💡 Чтобы привязать другого сотрудника, перешлите ему эту ссылку."
            )
            return

    salon = await bind_user_as_admin(
        telegram_id=user.id,
        salon_id=salon_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
    )

    salon_name = salon.name if salon else "Beauty Studio"
    app_url = await get_user_app_url(user.id)

    # Обновляем кнопку меню чата для нового администратора
    try:
        await bot.set_chat_menu_button(
            chat_id=callback.message.chat.id,
            menu_button=MenuButtonWebApp(
                text="💅 Окошко",
                web_app=WebAppInfo(url=app_url),
            ),
        )
    except Exception as e:
        logger.warning(f"Не удалось обновить MenuButton для администратора {callback.message.chat.id}: {e}")

    # Если у салона есть владелец, обновляем ему MenuButton и отправляем уведомление
    owner_tg = salon.owner_id if salon and salon.owner_id else 1205557089
    if owner_tg and owner_tg != user.id:
        try:
            owner_app_url = await get_user_app_url(owner_tg)
            await bot.set_chat_menu_button(
                chat_id=owner_tg,
                menu_button=MenuButtonWebApp(
                    text="💅 Окошко",
                    web_app=WebAppInfo(url=owner_app_url),
                ),
            )
            admin_mention = f"@{user.username}" if user.username else (user.first_name or f"ID {user.id}")
            await bot.send_message(
                chat_id=owner_tg,
                text=(
                    f"🎉 <b>Администратор успешно привязан!</b>\n\n"
                    f"🏢 Салон: <b>{salon_name}</b>\n"
                    f"👤 Администратор: <b>{admin_mention}</b> (ID: <code>{user.id}</code>)\n\n"
                    f"Ваш профиль салона синхронизирован. Вы можете открыть бизнес-кабинет через синюю кнопку меню внизу слева."
                ),
            )
        except Exception as e:
            logger.warning(f"Не удалось отправить уведомление владельцу салона {owner_tg}: {e}")

    success_text = (
        f"🎉 <b>Поздравляем! Вы успешно привязаны как Администратор!</b>\n\n"
        f"🏢 <b>Салон:</b> {salon_name}\n"
        f"👤 <b>Telegram:</b> @{user.username if user.username else user.first_name} (ID: <code>{user.id}</code>)\n"
        f"⚡ <b>Статус:</b> PRO Партнёр активирован\n\n"
        f"Теперь вам доступны:\n"
        f"• Кабинет управления салоном и записями клиентов\n"
        f"• Настройка услуг, прайса и графиков работы мастеров\n"
        f"• Оповещения обо всех бронированиях в режиме реального времени\n\n"
        f"Открывайте сервис в любой момент через синюю кнопку <b>«Меню»</b> внизу экрана слева!"
    )

    await callback.message.edit_text(
        text=success_text,
    )


@user_router.callback_query(F.data.startswith("confirm_bind_master:"))
async def handle_confirm_bind_master(callback: CallbackQuery, bot: Bot):
    """Подтверждение привязки пользователя в качестве Мастера салона с интерактивной анкетой."""
    await callback.answer()
    parts = callback.data.split(":")
    salon_id_raw = parts[1] if len(parts) > 1 else "1"
    master_hint = parts[2] if len(parts) > 2 else ""
    salon_id = int(salon_id_raw) if salon_id_raw.isdigit() else 1
    user = callback.from_user

    # Автоматически пробуем извлечь аватарку пользователя из профиля Telegram
    avatar_url = None
    try:
        user_photos = await bot.get_user_profile_photos(user.id, limit=1)
        if user_photos.total_count > 0:
            file_id = user_photos.photos[0][-1].file_id
            file_info = await bot.get_file(file_id)
            if file_info.file_path:
                avatar_url = f"https://api.telegram.org/file/bot{bot.token}/{file_info.file_path}"
    except Exception as e:
        logger.warning(f"Не удалось получить фото профиля Telegram для {user.id}: {e}")

    salon, master = await bind_user_as_master(
        telegram_id=user.id,
        salon_id=salon_id,
        master_hint_name=master_hint,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=avatar_url,
    )

    salon_name = (salon.name.strip() if salon and salon.name and salon.name.strip() else None) or "Beauty Studio"
    master_name = (master.name.strip() if master and master.name and master.name.strip() else None) or (user.first_name or "Мастер")
    master_id = master.id if master else 0

    # Обновляем кнопку меню чата для мастера
    try:
        app_url = await get_user_app_url(user.id)
        await bot.set_chat_menu_button(
            chat_id=callback.message.chat.id,
            menu_button=MenuButtonWebApp(
                text="💅 Окошко",
                web_app=WebAppInfo(url=app_url),
            ),
        )
    except Exception as e:
        logger.warning(f"Не удалось обновить MenuButton для {callback.message.chat.id}: {e}")

    # Если у салона есть владелец, отправляем уведомление и обновляем ему MenuButton с актуальным списком мастеров
    owner_tg = salon.owner_id if salon and salon.owner_id else 1205557089
    if owner_tg and owner_tg != user.id:
        try:
            owner_app_url = await get_user_app_url(owner_tg)
            await bot.set_chat_menu_button(
                chat_id=owner_tg,
                menu_button=MenuButtonWebApp(
                    text="💅 Окошко",
                    web_app=WebAppInfo(url=owner_app_url),
                ),
            )
            m_mention = f"@{user.username}" if user.username else (user.first_name or f"ID {user.id}")
            owner_markup = InlineKeyboardMarkup(
                inline_keyboard=[
                    [
                        InlineKeyboardButton(
                            text="💇 Открыть команду мастеров",
                            web_app=WebAppInfo(url=owner_app_url),
                        )
                    ]
                ]
            )
            await bot.send_message(
                chat_id=owner_tg,
                text=(
                    f"🎉 <b>Новый мастер присоединился к команде!</b>\n\n"
                    f"🏢 Салон: <b>{salon_name}</b>\n"
                    f"💇 Мастер: <b>{master_name}</b> ({m_mention}, ID: <code>{user.id}</code>)\n"
                    f"Специализация: <i>{master.role_title if master else 'Специалист'}</i>"
                ),
                reply_markup=owner_markup,
            )
        except Exception as e:
            logger.warning(f"Не удалось уведомить владельца салона: {e}")

    # Если у салона есть администратор, отправляем ему тоже уведомление и обновляем MenuButton
    if salon and salon.admin_id and salon.admin_id != user.id and salon.admin_id != owner_tg:
        try:
            admin_app_url = await get_user_app_url(salon.admin_id)
            await bot.set_chat_menu_button(
                chat_id=salon.admin_id,
                menu_button=MenuButtonWebApp(
                    text="💅 Окошко",
                    web_app=WebAppInfo(url=admin_app_url),
                ),
            )
            m_mention = f"@{user.username}" if user.username else (user.first_name or f"ID {user.id}")
            admin_markup = InlineKeyboardMarkup(
                inline_keyboard=[
                    [
                        InlineKeyboardButton(
                            text="💇 Открыть команду мастеров",
                            web_app=WebAppInfo(url=admin_app_url),
                        )
                    ]
                ]
            )
            await bot.send_message(
                chat_id=salon.admin_id,
                text=(
                    f"🎉 <b>Новый мастер присоединился к команде!</b>\n\n"
                    f"🏢 Салон: <b>{salon_name}</b>\n"
                    f"💇 Мастер: <b>{master_name}</b> ({m_mention}, ID: <code>{user.id}</code>)\n"
                    f"Специализация: <i>{master.role_title if master else 'Специалист'}</i>"
                ),
                reply_markup=admin_markup,
            )
        except Exception as e:
            logger.warning(f"Не удалось уведомить администратора салона: {e}")

    # Интерактивная форма заполнения профиля мастера
    form_text = (
        f"🎉 <b>Вы успешно подключены к салону «{salon_name}»!</b>\n\n"
        f"💇 <b>Анкета вашего профиля мастера:</b>\n"
        f"• <b>Имя:</b> {master.name} {master.last_name or ''}\n"
        f"• <b>Специализация:</b> {master.role_title}\n"
        f"• <b>Опыт работы:</b> {master.experience or 'Не указан'}\n"
        f"• <b>Telegram:</b> @{user.username if user.username else user.first_name} (ID: <code>{user.id}</code>)\n\n"
        f"💡 <i>Нажмите кнопку ниже, чтобы автоматически скопировать имя и аватарку из вашего Telegram или настроить услуги и опыт:</i>"
    )

    await callback.message.edit_text(
        text=form_text,
        reply_markup=get_master_setup_keyboard(master_id),
    )


@user_router.callback_query(F.data.startswith("msetup_tg:"))
async def handle_master_setup_from_tg(callback: CallbackQuery, bot: Bot):
    """Автоматическое заполнение профиля мастера данными из Telegram (имя + фото)."""
    master_id = int(callback.data.split(":")[1])
    user = callback.from_user

    from bot.database.base import async_session_maker
    from bot.database.models import Master
    from sqlalchemy import select

    avatar_url = None
    try:
        user_photos = await bot.get_user_profile_photos(user.id, limit=1)
        if user_photos.total_count > 0:
            file_id = user_photos.photos[0][-1].file_id
            file_info = await bot.get_file(file_id)
            if file_info.file_path:
                avatar_url = f"https://api.telegram.org/file/bot{bot.token}/{file_info.file_path}"
    except Exception as e:
        logger.warning(f"Не удалось загрузить фото профиля Telegram для {user.id}: {e}")

    async with async_session_maker() as session:
        res = await session.execute(select(Master).where(Master.id == master_id))
        master = res.scalar_one_or_none()
        if master:
            if user.first_name:
                master.name = user.first_name
            if user.last_name:
                master.last_name = user.last_name
            if avatar_url:
                master.avatar_url = avatar_url
            if user.username:
                master.telegram_handle = f"@{user.username}"
            await session.commit()
            await session.refresh(master)

            await callback.answer("✅ Данные и фото из Telegram успешно скопированы!")
            form_text = (
                f"✨ <b>Данные вашего профиля обновлены из Telegram!</b>\n\n"
                f"• <b>Имя:</b> {master.name} {master.last_name or ''}\n"
                f"• <b>Специализация:</b> {master.role_title}\n"
                f"• <b>Опыт:</b> {master.experience or 'Не указан'}\n"
                f"• <b>Фото:</b> Установлено из Telegram ✅\n\n"
                f"Теперь выберите оказываемые услуги и укажите опыт 👇"
            )
            await callback.message.edit_text(
                text=form_text,
                reply_markup=get_master_setup_keyboard(master_id),
            )
        else:
            await callback.answer("Мастер не найден")


@user_router.callback_query(F.data.startswith("msetup_back:"))
async def handle_master_setup_back(callback: CallbackQuery, master_id: Optional[int] = None):
    """Возврат к основной анкете мастера."""
    await callback.answer()
    if master_id is None:
        master_id = int(callback.data.split(":")[1])

    from bot.database.base import async_session_maker
    from bot.database.models import Master, Salon
    from sqlalchemy import select

    async with async_session_maker() as session:
        res = await session.execute(select(Master).where(Master.id == master_id))
        master = res.scalar_one_or_none()
        if not master:
            await callback.answer("Мастер не найден")
            return

        salon_name = "Салон"
        if master.salon_id:
            s_res = await session.execute(select(Salon).where(Salon.id == master.salon_id))
            salon = s_res.scalar_one_or_none()
            if salon:
                salon_name = salon.name

        form_text = (
            f"🏢 <b>Салон «{salon_name}»</b>\n\n"
            f"💇 <b>Анкета вашего профиля мастера:</b>\n"
            f"• <b>Имя:</b> {master.name} {master.last_name or ''}\n"
            f"• <b>Специализация:</b> {master.role_title}\n"
            f"• <b>Опыт работы:</b> {master.experience or 'Не указан'}\n"
            f"• <b>Telegram:</b> {master.telegram_handle or f'ID {master.telegram_id}'}\n\n"
            f"Выберите нужный пункт для настройки:"
        )
        await callback.message.edit_text(
            text=form_text,
            reply_markup=get_master_setup_keyboard(master_id),
        )


@user_router.callback_query(F.data.startswith("msetup_role:"))
async def handle_master_setup_role(callback: CallbackQuery):
    """Выбор специализации мастера кнопками."""
    await callback.answer()
    master_id = int(callback.data.split(":")[1])
    text = (
        "🏷 <b>Выберите вашу специализацию в салоне:</b>\n\n"
        "Она будет отображаться в карточке мастера и при записи клиентов."
    )
    await callback.message.edit_text(
        text=text,
        reply_markup=get_master_role_keyboard(master_id),
    )


@user_router.callback_query(F.data.startswith("mrole_set:"))
async def handle_master_role_set(callback: CallbackQuery):
    """Установка специализации мастера."""
    parts = callback.data.split(":", 2)
    master_id = int(parts[1])
    new_role = parts[2]

    from bot.database.base import async_session_maker
    from bot.database.models import Master
    from sqlalchemy import select

    async with async_session_maker() as session:
        res = await session.execute(select(Master).where(Master.id == master_id))
        master = res.scalar_one_or_none()
        if master:
            master.role_title = new_role
            await session.commit()
    
    await callback.answer(f"✓ Должность: {new_role}")
    # Возвращаемся в главное меню анкеты
    await handle_master_setup_back(callback, master_id=master_id)


@user_router.callback_query(F.data.startswith("msetup_exp:"))
async def handle_master_setup_exp(callback: CallbackQuery):
    """Выбор опыта работы мастера кнопками."""
    await callback.answer()
    master_id = int(callback.data.split(":")[1])
    text = (
        "⏳ <b>Укажите ваш стаж / опыт работы:</b>\n\n"
        "Клиенты чаще выбирают специалистов с подтвержденным опытом."
    )
    await callback.message.edit_text(
        text=text,
        reply_markup=get_master_exp_keyboard(master_id),
    )


@user_router.callback_query(F.data.startswith("mexp_set:"))
async def handle_master_exp_set(callback: CallbackQuery):
    """Установка опыта работы мастера."""
    parts = callback.data.split(":", 2)
    master_id = int(parts[1])
    new_exp = parts[2]

    from bot.database.base import async_session_maker
    from bot.database.models import Master
    from sqlalchemy import select

    async with async_session_maker() as session:
        res = await session.execute(select(Master).where(Master.id == master_id))
        master = res.scalar_one_or_none()
        if master:
            master.experience = new_exp
            await session.commit()
    
    await callback.answer(f"✓ Опыт: {new_exp}")
    await handle_master_setup_back(callback, master_id=master_id)


# Временный кэш выбранных услуг для мастера (master_id -> set of indices)
_master_selected_services_cache: dict[int, set[int]] = {}


@user_router.callback_query(F.data.startswith("msetup_svc:"))
async def handle_master_setup_services(callback: CallbackQuery):
    """Интерактивный список услуг салона с кнопками и галочками (мультиселект)."""
    await callback.answer()
    master_id = int(callback.data.split(":")[1])

    from bot.database.base import async_session_maker
    from bot.database.models import Master, Salon, Service
    from sqlalchemy import select
    import json

    services_list = []
    async with async_session_maker() as session:
        res = await session.execute(select(Master).where(Master.id == master_id))
        master = res.scalar_one_or_none()
        if master and master.salon_id:
            # Сначала проверяем таблицу services
            svc_res = await session.execute(select(Service).where(Service.salon_id == master.salon_id))
            db_svcs = svc_res.scalars().all()
            for s in db_svcs:
                services_list.append({"name": s.name, "price": s.price})
            
            # Если пусто, берем из salon.services_json
            if not services_list:
                s_res = await session.execute(select(Salon).where(Salon.id == master.salon_id))
                salon = s_res.scalar_one_or_none()
                if salon and salon.services_json:
                    try:
                        raw = json.loads(salon.services_json)
                        if isinstance(raw, list):
                            services_list = raw
                    except Exception:
                        pass

    if not services_list:
        services_list = [
            {"name": "Маникюр с покрытием гель-лак"},
            {"name": "Smart-педикюр эстетический"},
            {"name": "Окрашивание и коррекция бровей"},
            {"name": "Ламинирование ресниц"},
            {"name": "Стрижка + укладка"},
        ]

    # Инициализируем выбранные услуги
    if master_id not in _master_selected_services_cache:
        _master_selected_services_cache[master_id] = set(range(min(2, len(services_list))))

    selected = _master_selected_services_cache[master_id]

    text = (
        "💇 <b>Выберите услуги, которые вы выполняете:</b>\n\n"
        "Нажимайте на кнопки, чтобы отметить нужные услуги галочкой ✅. "
        "После выбора нажмите «💾 Подтвердить выбор услуг»."
    )
    await callback.message.edit_text(
        text=text,
        reply_markup=get_master_services_keyboard(master_id, services_list, list(selected)),
    )


@user_router.callback_query(F.data.startswith("msvc_tgl:"))
async def handle_master_svc_toggle(callback: CallbackQuery):
    """Переключение галочки для услуги."""
    parts = callback.data.split(":")
    master_id = int(parts[1])
    svc_idx = int(parts[2])

    if master_id not in _master_selected_services_cache:
        _master_selected_services_cache[master_id] = set()

    if svc_idx in _master_selected_services_cache[master_id]:
        _master_selected_services_cache[master_id].remove(svc_idx)
    else:
        _master_selected_services_cache[master_id].add(svc_idx)

    # Перерисовываем клавиатуру
    await handle_master_setup_services(callback)


@user_router.callback_query(F.data.startswith("msvc_all:"))
async def handle_master_svc_select_all(callback: CallbackQuery):
    """Выбрать все услуги."""
    master_id = int(callback.data.split(":")[1])
    _master_selected_services_cache[master_id] = set(range(10))
    await handle_master_setup_services(callback)


@user_router.callback_query(F.data.startswith("msvc_save:"))
async def handle_master_svc_save(callback: CallbackQuery):
    """Сохранение выбранных услуг в профиль мастера."""
    master_id = int(callback.data.split(":")[1])
    selected_indices = _master_selected_services_cache.get(master_id, set())

    from bot.database.base import async_session_maker
    from bot.database.models import Master, Salon, Service
    from sqlalchemy import select
    import json

    saved_names = []
    async with async_session_maker() as session:
        res = await session.execute(select(Master).where(Master.id == master_id))
        master = res.scalar_one_or_none()
        if master and master.salon_id:
            all_svcs = []
            svc_res = await session.execute(select(Service).where(Service.salon_id == master.salon_id))
            db_svcs = svc_res.scalars().all()
            for s in db_svcs:
                all_svcs.append(s.name)
            if not all_svcs:
                s_res = await session.execute(select(Salon).where(Salon.id == master.salon_id))
                salon = s_res.scalar_one_or_none()
                if salon and salon.services_json:
                    try:
                        raw = json.loads(salon.services_json)
                        all_svcs = [x.get("name", "") for x in raw if isinstance(x, dict)]
                    except Exception:
                        pass
            if not all_svcs:
                all_svcs = ["Маникюр", "Педикюр", "Брови", "Стрижка"]

            for idx in selected_indices:
                if idx < len(all_svcs):
                    saved_names.append(all_svcs[idx])

            master.services_json = json.dumps(saved_names, ensure_ascii=False)
            await session.commit()

    await callback.answer(f"✓ Выбрано услуг: {len(saved_names)}")
    await handle_master_setup_back(callback, master_id=master_id)


@user_router.callback_query(F.data.startswith("msetup_name:"))
async def handle_master_setup_name_prompt(callback: CallbackQuery):
    """Подсказка по ручному вводу имени."""
    await callback.answer()
    master_id = int(callback.data.split(":")[1])
    text = (
        "✏️ <b>Как вас зовут?</b>\n\n"
        "Отправьте в ответ текстовым сообщением ваше Имя и Фамилию (например, <i>Анастасия Смирнова</i>).\n"
        "Или нажмите кнопку «Использовать имя из Telegram» в анкете."
    )
    await callback.message.edit_text(
        text=text,
        reply_markup=get_master_setup_keyboard(master_id),
    )


@user_router.callback_query(F.data.startswith("msetup_photo:"))
async def handle_master_setup_photo_prompt(callback: CallbackQuery):
    """Подсказка по загрузке своего фото."""
    await callback.answer()
    master_id = int(callback.data.split(":")[1])
    text = (
        "📸 <b>Загрузка фотографии мастера:</b>\n\n"
        "Отправьте фотографию прямо в этот чат (как картинку), и бот моментально установит её в ваш профиль мастера!"
    )
    await callback.message.edit_text(
        text=text,
        reply_markup=get_master_setup_keyboard(master_id),
    )


@user_router.message(F.photo)
async def handle_master_photo_message(message: Message, bot: Bot):
    """Прием фотографии от мастера и установка её в качестве аватарки."""
    if not message.from_user:
        return
    
    user_id = message.from_user.id
    from bot.database.base import async_session_maker
    from bot.database.models import Master
    from sqlalchemy import select

    async with async_session_maker() as session:
        res = await session.execute(
            select(Master).where(Master.telegram_id == user_id).order_by(Master.id.desc())
        )
        master = res.scalars().first()
        if not master:
            return

        try:
            # Берем фото в наилучшем разрешении
            file_id = message.photo[-1].file_id
            file_info = await bot.get_file(file_id)
            if file_info.file_path:
                avatar_url = f"https://api.telegram.org/file/bot{bot.token}/{file_info.file_path}"
                master.avatar_url = avatar_url
                await session.commit()
                await message.reply(
                    f"✅ <b>Фото успешно установлено!</b>\n"
                    f"Ваш профиль мастера <b>{master.name}</b> обновлен 📸",
                    reply_markup=get_master_setup_keyboard(master.id)
                )
        except Exception as e:
            logger.error(f"Ошибка сохранения фото мастера {user_id}: {e}")
            await message.reply("Не удалось сохранить фото. Пожалуйста, попробуйте еще раз.")


@user_router.callback_query(F.data.startswith("msetup_done:"))
async def handle_master_setup_done(callback: CallbackQuery):
    """Завершение заполнения анкеты мастера."""
    await callback.answer("🎉 Профиль сохранён!")
    master_id = int(callback.data.split(":")[1])
    user = callback.from_user

    from bot.database.base import async_session_maker
    from bot.database.models import Master, Salon
    from sqlalchemy import select
    import json

    salon_name = "Салон"
    master_name = user.first_name or "Мастер"
    role_title = "Специалист"
    services_count = 0
    experience = "Не указан"

    async with async_session_maker() as session:
        res = await session.execute(select(Master).where(Master.id == master_id))
        master = res.scalar_one_or_none()
        if master:
            master_name = f"{master.name} {master.last_name or ''}".strip()
            role_title = master.role_title
            experience = master.experience or "3 года"
            if master.services_json:
                try:
                    services_count = len(json.loads(master.services_json))
                except Exception:
                    pass
            if master.salon_id:
                s_res = await session.execute(select(Salon).where(Salon.id == master.salon_id))
                salon = s_res.scalar_one_or_none()
                if salon:
                    salon_name = salon.name

    app_url = await get_user_app_url(user.id)
    pro_app_url = await get_user_app_url(user.id, is_pro_entry=True)

    done_text = (
        f"✅ <b>Профиль мастера успешно настроен и активирован!</b>\n\n"
        f"🏢 <b>Салон:</b> {salon_name}\n"
        f"💇 <b>Мастер:</b> {master_name}\n"
        f"🏷 <b>Специализация:</b> {role_title}\n"
        f"⏳ <b>Опыт:</b> {experience}\n"
        f"💅 <b>Активных услуг:</b> {services_count or 'Все услуги салона'}\n\n"
        f"Теперь клиенты могут записываться к вам через онлайн-расписание, а вам будут приходить мгновенные уведомления о бронированиях в этот чат!\n\n"
        f"Открывайте сервис в любой момент через синюю кнопку <b>«Меню»</b> внизу экрана слева!"
    )

    await callback.message.edit_text(
        text=done_text,
    )


@user_router.callback_query(F.data == "cancel_bind")
async def handle_cancel_bind(callback: CallbackQuery):
    """Отклонение приглашения."""
    await callback.answer("Приглашение отклонено")
    text = (
        "👌 Вы отклонили приглашение.\n\n"
        "Вы по-прежнему можете пользоваться сервисом «Окошко» для поиска и записи к лучшим мастерам города!"
    )
    await callback.message.edit_text(
        text=text,
    )

