from datetime import datetime
import logging
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.base import async_session_maker
from bot.database.models import Booking, City, Review, Salon, User, BusinessApplication, Master

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


async def has_user_reviewed_salon(user_id: int, salon_id: int) -> bool:
    """Проверяет, оставлял ли пользователь отзыв об этом салоне"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Review).where(Review.user_id == user_id, Review.salon_id == salon_id)
        )
        return result.scalar_one_or_none() is not None


async def add_salon_review(
    user_id: int,
    salon_id: int,
    user_name: str,
    service_name: str,
    rating: int,
    text: str,
    user_registered_at: Optional[datetime] = None,
) -> Optional[Review]:
    """
    Добавляет отзыв о салоне с ограничением: 1 отзыв на пользователя для салона.
    Пересчитывает средний рейтинг салона и количество отзывов.
    """
    async with async_session_maker() as session:
        # Проверяем, оставлял ли уже отзыв
        existing = await session.execute(
            select(Review).where(Review.user_id == user_id, Review.salon_id == salon_id)
        )
        if existing.scalar_one_or_none():
            logger.warning(f"Пользователь {user_id} уже оставил отзыв для салона {salon_id}")
            return None

        review = Review(
            salon_id=salon_id,
            user_id=user_id,
            user_name=user_name,
            service_name=service_name,
            rating=rating,
            text=text,
            user_registered_at=user_registered_at or datetime.utcnow(),
        )
        session.add(review)
        await session.flush()

        # Пересчитываем среднее арифметическое рейтинга салона
        salon_res = await session.execute(select(Salon).where(Salon.id == salon_id))
        salon = salon_res.scalar_one_or_none()
        if salon:
            revs_res = await session.execute(select(Review).where(Review.salon_id == salon_id))
            all_reviews = revs_res.scalars().all()
            if all_reviews:
                avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
                salon.rating = round(avg_rating, 1)
                salon.reviews_count = len(all_reviews)

        await session.commit()
        await session.refresh(review)
        logger.info(f"Добавлен отзыв #{review.id} для салона {salon_id} от пользователя {user_id}")
        return review


async def get_salon_reviews(salon_id: int) -> List[Review]:
    """Возвращает список всех отзывов салона"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Review).where(Review.salon_id == salon_id).order_by(Review.id.desc())
        )
        return list(result.scalars().all())


async def get_active_cities() -> List[City]:
    """Возвращает список всех активных городов из БД, отсортированных по порядку"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(City).where(City.is_active == True).order_by(City.order_num.asc(), City.id.asc())
        )
        return list(result.scalars().all())


async def create_business_application(
    name: str,
    contact: str,
    biz_type: str = "salon",
    category: str = "Салон красоты",
    address: Optional[str] = None,
    user_id: Optional[int] = None,
) -> BusinessApplication:
    """Сохраняет новую заявку на подключение Бизнес / PRO аккаунта в БД"""
    async with async_session_maker() as session:
        app = BusinessApplication(
            user_id=user_id,
            biz_type=biz_type,
            name=name,
            category=category,
            address=address,
            contact=contact,
            status="pending",
        )
        session.add(app)
        await session.commit()
        await session.refresh(app)
        logger.info(f"Создана заявка на PRO аккаунт #{app.id} от '{name}' ({contact})")
        return app


async def get_salon_by_slug_or_name(slug_or_name: str) -> Optional[Salon]:
    """Поиск салона по slug или названию (регистронезависимо)"""
    async with async_session_maker() as session:
        clean_slug = slug_or_name.strip().lower()
        res = await session.execute(
            select(Salon).where(
                (Salon.slug == clean_slug) |
                (Salon.slug.ilike(f"%{clean_slug}%")) |
                (Salon.name.ilike(f"%{clean_slug}%"))
            )
        )
        salon = res.scalars().first()
        if not salon:
            # Попробуем также заменить дефисы на пробелы
            name_alt = clean_slug.replace("-", " ")
            res = await session.execute(
                select(Salon).where(Salon.name.ilike(f"%{name_alt}%"))
            )
            salon = res.scalars().first()
        return salon


async def bind_user_as_admin(
    telegram_id: int,
    salon_id: int,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
) -> Optional[Salon]:
    """Привязывает пользователя как Администратора к салону"""
    async with async_session_maker() as session:
        # Обновляем салон
        salon_res = await session.execute(select(Salon).where(Salon.id == salon_id))
        salon = salon_res.scalar_one_or_none()
        if not salon:
            return None

        admin_handle = f"@{username}" if username else (first_name or "Администратор")
        salon.admin_id = telegram_id
        salon.admin_tag = admin_handle

        # Обновляем пользователя в таблице users
        user_res = await session.execute(select(User).where(User.telegram_id == telegram_id))
        user = user_res.scalar_one_or_none()
        if not user:
            user = User(
                telegram_id=telegram_id,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_pro=True,
                role="admin",
                salon_id=salon.id,
            )
            session.add(user)
        else:
            user.is_pro = True
            user.role = "admin"
            user.salon_id = salon.id
            if username:
                user.username = username
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name

        await session.commit()
        await session.refresh(salon)
        logger.info(f"Пользователь {telegram_id} ({admin_handle}) успешно привязан как администратор к салону '{salon.name}' (ID: {salon.id})")
        return salon


async def bind_user_as_master(
    telegram_id: int,
    salon_id: int,
    master_hint_name: Optional[str] = None,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
) -> tuple[Optional[Salon], Optional[Master]]:
    """Привязывает пользователя как Мастера к салону и конкретному профилю мастера (если есть совпадение)"""
    async with async_session_maker() as session:
        salon_res = await session.execute(select(Salon).where(Salon.id == salon_id))
        salon = salon_res.scalar_one_or_none()
        if not salon:
            return None, None

        # Ищем мастера в этом салоне
        master: Optional[Master] = None
        masters_res = await session.execute(select(Master).where(Master.salon_id == salon_id))
        masters = list(masters_res.scalars().all())

        if master_hint_name and master_hint_name.lower() not in ("spec", "master", ""):
            for m in masters:
                if master_hint_name.lower() in m.name.lower():
                    master = m
                    break

        if not master and first_name:
            for m in masters:
                if first_name.lower() in m.name.lower():
                    master = m
                    break

        # Если не найден подходящий, берем первого свободного без telegram_id или создаем нового
        if not master and masters:
            for m in masters:
                if not m.telegram_id:
                    master = m
                    break

        # Если все равно не нашли — создаем новую запись мастера для этого салона
        tg_handle = f"@{username}" if username else None
        m_name = first_name or (master_hint_name if master_hint_name and master_hint_name != "spec" else "Мастер")
        m_lastname = last_name or ""

        if master:
            master.telegram_id = telegram_id
            master.telegram_handle = tg_handle
        else:
            master = Master(
                salon_id=salon.id,
                name=m_name,
                last_name=m_lastname,
                telegram_handle=tg_handle,
                telegram_id=telegram_id,
                role_title="Специалист салона",
                avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
            )
            session.add(master)

        # Обновляем / создаем пользователя
        user_res = await session.execute(select(User).where(User.telegram_id == telegram_id))
        user = user_res.scalar_one_or_none()
        if not user:
            user = User(
                telegram_id=telegram_id,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_pro=True,
                role="master",
                salon_id=salon.id,
            )
            session.add(user)
        else:
            user.is_pro = True
            user.role = "master"
            user.salon_id = salon.id
            if username:
                user.username = username
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name

        await session.commit()
        await session.refresh(salon)
        await session.refresh(master)
        logger.info(f"Пользователь {telegram_id} успешно привязан как мастер '{master.name}' в салон '{salon.name}' (ID: {salon.id})")
        return salon, master




