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
    get_inline_keyboard,
    get_reply_keyboard,
    get_admin_invite_keyboard,
    get_master_invite_keyboard,
    get_role_choice_keyboard,
)

logger = logging.getLogger(__name__)
user_router = Router(name="user_router")


@user_router.message(CommandStart())
async def handle_start(message: Message, bot: Bot, command: Optional[CommandStart] = None):
    """Обработчик команды /start с поддержкой deep-link приглашений администраторов и мастеров."""
    user_name = message.from_user.first_name if message.from_user else "друг"
    start_arg = ""

    # Извлечение deep-link аргумента
    if message.text and " " in message.text:
        start_arg = message.text.split(maxsplit=1)[1].strip()

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

        if start_arg.startswith("bind_admin_"):
            salon_slug = start_arg.replace("bind_admin_", "", 1)
            salon = await get_salon_by_slug_or_name(salon_slug)
            salon_name = salon.name if salon else salon_slug.replace("-", " ").title()
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
                reply_markup=get_role_choice_keyboard(salon_id),
            )
            return

        elif start_arg.startswith("bind_master_"):
            parts = start_arg.replace("bind_master_", "", 1).split("_", 1)
            salon_slug = parts[0]
            master_hint = parts[1] if len(parts) > 1 else ""

            salon = await get_salon_by_slug_or_name(salon_slug)
            salon_name = salon.name if salon else salon_slug.replace("-", " ").title()
            salon_id = salon.id if salon else 1

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
                reply_markup=get_role_choice_keyboard(salon_id, master_hint),
            )
            return

        elif start_arg.startswith("invite_") or start_arg.startswith("bind_"):
            raw_slug = start_arg.replace("invite_", "", 1).replace("bind_", "", 1)
            salon = await get_salon_by_slug_or_name(raw_slug)
            salon_name = salon.name if salon else raw_slug.replace("-", " ").title()
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

    # Обычное приветственное сообщение для клиентов
    welcome_text = (
        f"Привет, <b>{user_name}</b>! 👋✨\n\n"
        f"Добро пожаловать в <b>«Окошко»</b> — сервис быстрой записи "
        f"в лучшие салоны красоты и к проверенным мастерам вашего города.\n\n"
        f"🗺 <b>Реальная интерактивная карта:</b> находите свободные слоты рядом с вами\n"
        f"✨ <b>Топ-мастера:</b> реальные портфолио, отзывы и прайс-листы\n"
        f"💅 <b>Запись в 2 клика:</b> без звонков, ожидания и переписок\n"
        f"👤 <b>Telegram-профиль:</b> ваши данные автоматически синхронизированы\n\n"
        f"👇 Нажмите <b>«Открыть Окошко»</b>, чтобы выбрать услугу и время:"
    )

    await message.answer(
        text=welcome_text,
        reply_markup=get_inline_keyboard(app_url),
    )

    await message.answer(
        text="💡 Вы также можете открыть сервис в любой момент кнопкой внизу чата ⬇️",
        reply_markup=get_reply_keyboard(app_url),
    )


async def get_user_app_url(telegram_id: Optional[int]) -> str:
    """Генерирует ссылку на WebApp с параметрами даты регистрации, PRO статуса, роли и администратора салона из БД"""
    if not telegram_id:
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

                # Ищем салон пользователя или салон, где он создатель / администратор
                salon_res = await session.execute(
                    select(Salon).where((Salon.admin_id == telegram_id) | (Salon.id == user.salon_id if user.salon_id else False))
                )
                user_salon = salon_res.scalar_one_or_none()

                # Если салон по привязке не найден, проверим главный салон Beauty Studio (id 1)
                if not user_salon and (user.is_pro or user.role == "admin"):
                    bs_res = await session.execute(select(Salon).where(Salon.id == 1))
                    user_salon = bs_res.scalar_one_or_none()

                if user_salon and user_salon.admin_tag:
                    import urllib.parse
                    params.append(f"admin_tag={urllib.parse.quote(user_salon.admin_tag)}")

                if params:
                    delimiter = "&" if "?" in MINI_APP_URL else "?"
                    return f"{MINI_APP_URL}{delimiter}{'&'.join(params)}"
    except Exception as e:
        logger.warning(f"Ошибка получения параметров пользователя для {telegram_id}: {e}")
    return MINI_APP_URL



@user_router.message(Command("help"))
@user_router.message(F.text == "💬 Помощь")
async def handle_help(message: Message):
    """Справка и список возможностей."""
    app_url = await get_user_app_url(message.from_user.id if message.from_user else None)
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
        reply_markup=get_inline_keyboard(app_url),
    )


@user_router.message(Command("app"))
async def handle_app_command(message: Message):
    """Быстрый запуск Mini App."""
    app_url = await get_user_app_url(message.from_user.id if message.from_user else None)
    await message.answer(
        text="💅 Запустите приложение <b>«Окошко»</b> по кнопке ниже:",
        reply_markup=get_inline_keyboard(app_url),
    )


@user_router.callback_query(F.data == "about_service")
@user_router.message(F.text == "ℹ️ О сервисе")
async def handle_about(event: Message | CallbackQuery):
    """Информация о сервисе «Окошко»."""
    user_id = event.from_user.id if event.from_user else None
    app_url = await get_user_app_url(user_id)
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
        await event.message.answer(
            text=about_text,
            reply_markup=get_inline_keyboard(app_url),
        )
    else:
        await event.answer(
            text=about_text,
            reply_markup=get_inline_keyboard(app_url),
        )


@user_router.callback_query(F.data == "my_bookings")
async def handle_my_bookings(callback: CallbackQuery):
    """Переход в раздел записей."""
    await callback.answer()
    user_id = callback.from_user.id if callback.from_user else None
    app_url = await get_user_app_url(user_id)
    text = (
        "📅 <b>Управление вашими записями</b>\n\n"
        "Все активные и прошедшие визиты хранятся во вкладке <b>«Записи»</b> "
        "внутри приложения.\n\n"
        "Там вы можете:\n"
        "• Посмотреть точный адрес и построить маршрут на Яндекс.Картах\n"
        "• Перенести запись на другое свободное время\n"
        "• Отменить визит или связаться с мастером в Telegram\n\n"
        "Откройте приложение, чтобы просмотреть записи 👇"
    )
    await callback.message.answer(
        text=text,
        reply_markup=get_inline_keyboard(app_url),
    )


@user_router.callback_query(F.data.startswith("confirm_bind_admin:"))
async def handle_confirm_bind_admin(callback: CallbackQuery, bot: Bot):
    """Подтверждение привязки пользователя в качестве Администратора салона."""
    await callback.answer()
    salon_id_raw = callback.data.split(":")[1]
    salon_id = int(salon_id_raw) if salon_id_raw.isdigit() else 1
    user = callback.from_user

    salon = await bind_user_as_admin(
        telegram_id=user.id,
        salon_id=salon_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
    )

    salon_name = salon.name if salon else "вашему салону"
    app_url = await get_user_app_url(user.id)

    # Обновляем кнопку меню чата для администратора
    try:
        await bot.set_chat_menu_button(
            chat_id=callback.message.chat.id,
            menu_button=MenuButtonWebApp(
                text="💅 Окошко PRO",
                web_app=WebAppInfo(url=app_url),
            ),
        )
    except Exception as e:
        logger.warning(f"Не удалось обновить MenuButton для {callback.message.chat.id}: {e}")

    success_text = (
        f"🎉 <b>Поздравляем! Вы успешно привязаны как Администратор!</b>\n\n"
        f"🏢 <b>Салон:</b> {salon_name}\n"
        f"👤 <b>Telegram:</b> @{user.username if user.username else user.first_name} (ID: <code>{user.id}</code>)\n"
        f"⚡ <b>Статус:</b> PRO Партнёр активирован\n\n"
        f"Теперь вам доступны:\n"
        f"• Кабинет управления салоном и записями клиентов\n"
        f"• Настройка услуг, прайса и графиков работы мастеров\n"
        f"• Оповещения обо всех бронированиях в режиме реального времени\n\n"
        f"Нажмите кнопку ниже, чтобы открыть кабинет управления 👇"
    )

    await callback.message.edit_text(
        text=success_text,
        reply_markup=get_inline_keyboard(app_url),
    )


@user_router.callback_query(F.data.startswith("confirm_bind_master:"))
async def handle_confirm_bind_master(callback: CallbackQuery, bot: Bot):
    """Подтверждение привязки пользователя в качестве Мастера салона."""
    await callback.answer()
    parts = callback.data.split(":")
    salon_id_raw = parts[1] if len(parts) > 1 else "1"
    master_hint = parts[2] if len(parts) > 2 else ""
    salon_id = int(salon_id_raw) if salon_id_raw.isdigit() else 1
    user = callback.from_user

    salon, master = await bind_user_as_master(
        telegram_id=user.id,
        salon_id=salon_id,
        master_hint_name=master_hint,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
    )

    salon_name = salon.name if salon else "вашему салону"
    master_name = master.name if master else (user.first_name or "Мастер")
    app_url = await get_user_app_url(user.id)

    # Обновляем кнопку меню чата для мастера
    try:
        await bot.set_chat_menu_button(
            chat_id=callback.message.chat.id,
            menu_button=MenuButtonWebApp(
                text="💅 Окошко Мастер",
                web_app=WebAppInfo(url=app_url),
            ),
        )
    except Exception as e:
        logger.warning(f"Не удалось обновить MenuButton для {callback.message.chat.id}: {e}")

    success_text = (
        f"✨ <b>Добро пожаловать в команду, {master_name}!</b>\n\n"
        f"🏢 <b>Салон:</b> {salon_name}\n"
        f"💇 <b>Профиль мастера:</b> {master_name} {master.last_name or ''}\n"
        f"👤 <b>Telegram:</b> @{user.username if user.username else user.first_name} (ID: <code>{user.id}</code>)\n\n"
        f"Ваш аккаунт успешно привязан. Теперь вы будете получать уведомления "
        f"о записях клиентов прямо в этот чат, а ваши свободные окна будут отображаться в приложении!\n\n"
        f"Откройте сервис, чтобы посмотреть расписание 👇"
    )

    await callback.message.edit_text(
        text=success_text,
        reply_markup=get_inline_keyboard(app_url),
    )


@user_router.callback_query(F.data == "cancel_bind")
async def handle_cancel_bind(callback: CallbackQuery):
    """Отклонение приглашения."""
    await callback.answer("Приглашение отклонено")
    app_url = await get_user_app_url(callback.from_user.id if callback.from_user else None)
    text = (
        "👌 Вы отклонили приглашение.\n\n"
        "Вы по-прежнему можете пользоваться сервисом «Окошко» для поиска и записи к лучшим мастерам города!"
    )
    await callback.message.edit_text(
        text=text,
        reply_markup=get_inline_keyboard(app_url),
    )

