import json
import logging
from aiogram import F, Router
from aiogram.types import Message

from bot.database import create_booking, get_or_create_user
from bot.keyboards import get_inline_keyboard

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

            await message.answer(
                text=response,
                reply_markup=get_inline_keyboard(),
            )
            return

    except Exception as e:
        logger.error(f"Ошибка парсинга WebApp данных: {e}")

    await message.answer(
        f"✅ Данные из приложения получены:\n<code>{raw_data}</code>",
        reply_markup=get_inline_keyboard(),
    )
