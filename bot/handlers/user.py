import logging
from aiogram import Bot, F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, MenuButtonWebApp, Message, WebAppInfo

from bot.config import MINI_APP_URL
from bot.keyboards import get_inline_keyboard, get_reply_keyboard

logger = logging.getLogger(__name__)
user_router = Router(name="user_router")


@user_router.message(CommandStart())
async def handle_start(message: Message, bot: Bot):
    """Обработчик команды /start."""
    user_name = message.from_user.first_name if message.from_user else "друг"

    # Устанавливаем кнопку меню в левом нижнем углу чата (Menu Button)
    try:
        await bot.set_chat_menu_button(
            chat_id=message.chat.id,
            menu_button=MenuButtonWebApp(
                text="💅 Окошко",
                web_app=WebAppInfo(url=MINI_APP_URL),
            ),
        )
    except Exception as e:
        logger.warning(f"Не удалось установить MenuButton для чата {message.chat.id}: {e}")

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
        reply_markup=get_inline_keyboard(),
    )

    await message.answer(
        text="💡 Вы также можете открыть сервис в любой момент кнопкой внизу чата ⬇️",
        reply_markup=get_reply_keyboard(),
    )


@user_router.message(Command("help"))
@user_router.message(F.text == "💬 Помощь")
async def handle_help(message: Message):
    """Справка и список возможностей."""
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
        reply_markup=get_inline_keyboard(),
    )


@user_router.message(Command("app"))
async def handle_app_command(message: Message):
    """Быстрый запуск Mini App."""
    await message.answer(
        text="💅 Запустите приложение <b>«Окошко»</b> по кнопке ниже:",
        reply_markup=get_inline_keyboard(),
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
        await event.message.answer(
            text=about_text,
            reply_markup=get_inline_keyboard(),
        )
    else:
        await event.answer(
            text=about_text,
            reply_markup=get_inline_keyboard(),
        )


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
        "Откройте приложение, чтобы просмотреть записи 👇"
    )
    await callback.message.answer(
        text=text,
        reply_markup=get_inline_keyboard(),
    )
