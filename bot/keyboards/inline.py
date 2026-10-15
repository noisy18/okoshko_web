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


def get_master_setup_keyboard(master_id: int) -> InlineKeyboardMarkup:
    """Клавиатура интерактивного заполнения профиля мастера прямо в боте"""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="⚡ Использовать имя и фото из Telegram",
                    callback_data=f"msetup_tg:{master_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="💇 Выбрать услуги салона",
                    callback_data=f"msetup_svc:{master_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="⏳ Опыт работы",
                    callback_data=f"msetup_exp:{master_id}",
                ),
                InlineKeyboardButton(
                    text="🏷 Должность / Роль",
                    callback_data=f"msetup_role:{master_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="✏️ Изменить имя",
                    callback_data=f"msetup_name:{master_id}",
                ),
                InlineKeyboardButton(
                    text="📸 Свое фото",
                    callback_data=f"msetup_photo:{master_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="✅ Готово! Сохранить и завершить",
                    callback_data=f"msetup_done:{master_id}",
                )
            ]
        ]
    )


def get_master_services_keyboard(master_id: int, services: list, selected_indices: list) -> InlineKeyboardMarkup:
    """Клавиатура выбора услуг с мультиселектом (галочками)"""
    keyboard = []
    for idx, s in enumerate(services):
        s_name = s.get("name", f"Услуга #{idx+1}") if isinstance(s, dict) else str(s)
        # Укорачиваем название, если слишком длинное для кнопки
        if len(s_name) > 28:
            s_name = s_name[:26] + ".."
        is_selected = idx in selected_indices
        mark = "✅ " if is_selected else "▫️ "
        keyboard.append([
            InlineKeyboardButton(
                text=f"{mark}{s_name}",
                callback_data=f"msvc_tgl:{master_id}:{idx}",
            )
        ])
    
    keyboard.append([
        InlineKeyboardButton(
            text="✨ Выбрать все услуги",
            callback_data=f"msvc_all:{master_id}",
        )
    ])
    keyboard.append([
        InlineKeyboardButton(
            text="💾 Подтвердить выбор услуг",
            callback_data=f"msvc_save:{master_id}",
        )
    ])
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_master_exp_keyboard(master_id: int) -> InlineKeyboardMarkup:
    """Клавиатура быстрого выбора стажа / опыта работы"""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="До 1 года", callback_data=f"mexp_set:{master_id}:До 1 года"),
                InlineKeyboardButton(text="1–2 года", callback_data=f"mexp_set:{master_id}:1-2 года"),
            ],
            [
                InlineKeyboardButton(text="3–5 лет", callback_data=f"mexp_set:{master_id}:3-5 лет"),
                InlineKeyboardButton(text="Более 5 лет", callback_data=f"mexp_set:{master_id}:Более 5 лет"),
            ],
            [
                InlineKeyboardButton(text="Топ-мастер (7+ лет)", callback_data=f"mexp_set:{master_id}:Топ-мастер (7+ лет)"),
            ],
            [
                InlineKeyboardButton(text="⬅️ Назад в анкету", callback_data=f"msetup_back:{master_id}"),
            ]
        ]
    )


def get_master_role_keyboard(master_id: int) -> InlineKeyboardMarkup:
    """Клавиатура быстрого выбора специализации мастера"""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="💅 Мастер ногтевого сервиса", callback_data=f"mrole_set:{master_id}:Мастер ногтевого сервиса"),
            ],
            [
                InlineKeyboardButton(text="👁 Бровист & Ламимейкер", callback_data=f"mrole_set:{master_id}:Бровист & Ламимейкер"),
            ],
            [
                InlineKeyboardButton(text="💇 Парикмахер-стилист", callback_data=f"mrole_set:{master_id}:Парикмахер-стилист"),
            ],
            [
                InlineKeyboardButton(text="🦶 Подолог & Мастер педикюра", callback_data=f"mrole_set:{master_id}:Подолог & Мастер педикюра"),
            ],
            [
                InlineKeyboardButton(text="✨ Топ-мастер салона", callback_data=f"mrole_set:{master_id}:Топ-мастер салона"),
            ],
            [
                InlineKeyboardButton(text="⬅️ Назад в анкету", callback_data=f"msetup_back:{master_id}"),
            ]
        ]
    )

