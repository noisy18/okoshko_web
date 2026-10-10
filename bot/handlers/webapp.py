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
                reply_markup=get_inline_keyboard(),
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
                reply_markup=get_inline_keyboard(),
            )
            return

    except Exception as e:
        logger.error(f"Ошибка парсинга WebApp данных: {e}")

    await message.answer(
        f"✅ Данные из приложения получены:\n<code>{raw_data}</code>",
        reply_markup=get_inline_keyboard(),
    )
