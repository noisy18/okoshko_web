from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
)
from bot.config import MINI_APP_URL


def get_inline_keyboard() -> InlineKeyboardMarkup:
    """Инлайн-клавиатура с кнопкой запуска Mini App."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💅 Открыть «Окошко»",
                    web_app=WebAppInfo(url=MINI_APP_URL),
                )
            ],
            [
                InlineKeyboardButton(
                    text="ℹ️ О сервисе",
                    callback_data="about_service",
                ),
                InlineKeyboardButton(
                    text="📅 Мои записи",
                    callback_data="my_bookings",
                ),
            ],
        ]
    )


def get_reply_keyboard() -> ReplyKeyboardMarkup:
    """Постоянная нижняя клавиатура с кнопкой быстрого вызова Mini App."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text="✨ Записаться онлайн",
                    web_app=WebAppInfo(url=MINI_APP_URL),
                )
            ],
            [
                KeyboardButton(text="ℹ️ О сервисе"),
                KeyboardButton(text="💬 Помощь"),
            ],
        ],
        resize_keyboard=True,
        is_persistent=True,
    )
