import logging
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from bot.config import DATABASE_URL

logger = logging.getLogger(__name__)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Создание всех таблиц в БД, если они еще не созданы, и проверка миграций колонок"""
    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            # Миграции новых колонок для привязки администраторов и мастеров
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS admin_id BIGINT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS admin_tag VARCHAR(128);"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'client';"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS salon_id INTEGER;"))
        logger.info("✅ База данных PostgreSQL успешно инициализирована.")
    except Exception as e:
        logger.error(f"❌ Ошибка подключения к базе данных PostgreSQL: {e}")
