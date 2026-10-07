import logging
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.base import async_session_maker
from bot.database.models import Booking, User

logger = logging.getLogger(__name__)


async def get_or_create_user(
    telegram_id: int,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
) -> User:
    """Получает пользователя из БД или регистрирует нового, если его нет"""
    async with async_session_maker() as session:
        result = await session.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                telegram_id=telegram_id,
                username=username,
                first_name=first_name,
                last_name=last_name,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            logger.info(f"Зарегистрирован новый пользователь: ID {telegram_id} (@{username})")
        else:
            # Обновляем профиль при изменениях
            changed = False
            if user.username != username:
                user.username = username
                changed = True
            if user.first_name != first_name:
                user.first_name = first_name
                changed = True
            if user.last_name != last_name:
                user.last_name = last_name
                changed = True
            if changed:
                await session.commit()
                await session.refresh(user)

        return user


async def create_booking(
    user_id: int,
    salon: str,
    master: str,
    booking_date: str,
    booking_time: str,
    services: str,
    total_price: float,
) -> Booking:
    """Сохраняет новую запись клиента в БД"""
    async with async_session_maker() as session:
        booking = Booking(
            user_id=user_id,
            salon=salon,
            master=master,
            booking_date=booking_date,
            booking_time=booking_time,
            services=services,
            total_price=total_price,
            status="confirmed",
        )
        session.add(booking)
        await session.commit()
        await session.refresh(booking)
        logger.info(f"Сохранена бронь #{booking.id} для пользователя {user_id}")
        return booking


async def get_user_bookings(user_id: int) -> List[Booking]:
    """Возвращает список всех записей пользователя"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Booking).where(Booking.user_id == user_id).order_by(Booking.id.desc())
        )
        return list(result.scalars().all())
