from typing import Optional
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
)
from bot.config import MINI_APP_URL


def get_inline_keyboard(app_url: str = MINI_APP_URL, pro_app_url: Optional[str] = None) -> InlineKeyboardMarkup:
    """Инлайн-клавиатура с кнопкой запуска Mini App и входом в бизнес-аккаунт."""
    biz_url = pro_app_url or (f"{app_url}&pro_entry=1" if "?" in app_url else f"{app_url}?pro_entry=1")
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💅 Открыть «Окошко»",
                    web_app=WebAppInfo(url=app_url),
                )
            ],
            [
                InlineKeyboardButton(
                    text="💼 Войти в бизнес-аккаунт",
                    web_app=WebAppInfo(url=biz_url),
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


def get_reply_keyboard(app_url: str = MINI_APP_URL, pro_app_url: Optional[str] = None) -> ReplyKeyboardMarkup:
    """Постоянная нижняя клавиатура с кнопкой быстрого вызова Mini App и бизнес-кабинета."""
    biz_url = pro_app_url or (f"{app_url}&pro_entry=1" if "?" in app_url else f"{app_url}?pro_entry=1")
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text="✨ Записаться онлайн",
                    web_app=WebAppInfo(url=app_url),
                )
            ],
            [
                KeyboardButton(
                    text="💼 Бизнес-кабинет",
                    web_app=WebAppInfo(url=biz_url),
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


def get_admin_invite_keyboard(salon_id: int) -> InlineKeyboardMarkup:
    """Клавиатура для подтверждения роли Администратора салона"""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💼 Стать администратором",
                    callback_data=f"confirm_bind_admin:{salon_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="❌ Отклонить",
                    callback_data="cancel_bind",
                )
            ]
        ]
    )


def get_master_invite_keyboard(salon_id: int, master_hint: str = "") -> InlineKeyboardMarkup:
    """Клавиатура для подтверждения роли Мастера салона"""
    cb_data = f"confirm_bind_master:{salon_id}:{master_hint}" if master_hint else f"confirm_bind_master:{salon_id}:"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💇 Стать мастером",
                    callback_data=cb_data,
                )
            ],
            [
                InlineKeyboardButton(
                    text="❌ Отклонить",
                    callback_data="cancel_bind",
                )
            ]
        ]
    )


def get_role_choice_keyboard(salon_id: int, master_hint: str = "") -> InlineKeyboardMarkup:
    """Клавиатура выбора роли: Стать администратором или Стать мастером"""
    master_cb = f"confirm_bind_master:{salon_id}:{master_hint}" if master_hint else f"confirm_bind_master:{salon_id}:"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💼 Стать администратором",
                    callback_data=f"confirm_bind_admin:{salon_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="💇 Стать мастером",
                    callback_data=master_cb,
                )
            ],
            [
                InlineKeyboardButton(
                    text="❌ Отклонить",
                    callback_data="cancel_bind",
                )
            ]
        ]
    )

