import asyncio
import logging
from sqlalchemy import text
from bot.database.base import engine, init_db
from bot.database.seed import seed_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clear_db")

async def clear_database():
    logger.info("Начинается полная очистка базы данных...")
    await init_db()
    async with engine.begin() as conn:
        # Очищаем все таблицы с каскадным сбросом связей и последовательностей
        tables = [
            "bookings",
            "reviews",
            "business_applications",
            "business_statistics",
            "services",
            "masters",
            "salons",
            "users",
            "cities"
        ]
        for table in tables:
            try:
                await conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;"))
                logger.info(f"Таблица '{table}' очищена.")
            except Exception as e:
                logger.warning(f"Не удалось выполнить TRUNCATE для {table}: {e}")
                try:
                    await conn.execute(text(f"DELETE FROM {table};"))
                    logger.info(f"Таблица '{table}' очищена через DELETE.")
                except Exception as de:
                    logger.error(f"Ошибка очистки {table}: {de}")

    logger.info("База данных полностью очищена!")
    logger.info("Заполнение эталонными каталогами (города и салоны)...")
    await seed_data()
    logger.info("✅ База данных успешно сброшена и переинициализирована!")

if __name__ == "__main__":
    asyncio.run(clear_database())
