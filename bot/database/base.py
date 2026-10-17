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
            # Миграции колонок salons
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS logo_url TEXT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS cover_image_url TEXT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS description TEXT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS services_json TEXT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS slots_json TEXT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS owner_id BIGINT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS admin_id BIGINT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS admin_tag VARCHAR(128);"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS phone VARCHAR(32);"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS filter_tags_json TEXT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS search_keywords_json TEXT;"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS photos_json TEXT DEFAULT '[]';"))
            await conn.execute(text("ALTER TABLE salons ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE salons ALTER COLUMN salon_type DROP NOT NULL;"))
            # Миграции колонок masters
            await conn.execute(text("ALTER TABLE masters ADD COLUMN IF NOT EXISTS last_name VARCHAR(128);"))
            await conn.execute(text("ALTER TABLE masters ADD COLUMN IF NOT EXISTS telegram_handle VARCHAR(128);"))
            await conn.execute(text("ALTER TABLE masters ADD COLUMN IF NOT EXISTS telegram_id BIGINT;"))
            await conn.execute(text("ALTER TABLE masters ADD COLUMN IF NOT EXISTS grade_badge VARCHAR(64) DEFAULT 'PRO';"))
            await conn.execute(text("ALTER TABLE masters ALTER COLUMN grade_badge DROP NOT NULL;"))
            await conn.execute(text("ALTER TABLE masters ADD COLUMN IF NOT EXISTS retention_rate VARCHAR(32) DEFAULT '98%';"))
            await conn.execute(text("ALTER TABLE masters ADD COLUMN IF NOT EXISTS portfolio_photos_json TEXT;"))
            await conn.execute(text("ALTER TABLE masters ADD COLUMN IF NOT EXISTS slots_json TEXT;"))
            await conn.execute(text("ALTER TABLE masters ADD COLUMN IF NOT EXISTS services_json TEXT;"))
            # Миграции колонок users
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'client';"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS salon_id INTEGER;"))
        logger.info("✅ База данных PostgreSQL успешно инициализирована.")
    except Exception as e:
        logger.error(f"❌ Ошибка подключения к базе данных PostgreSQL: {e}")
