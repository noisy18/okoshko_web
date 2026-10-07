import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import MenuButtonWebApp, WebAppInfo

from bot.config import BOT_TOKEN, MINI_APP_URL
from bot.handlers import main_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s",
)
logger = logging.getLogger("okoshko_bot")


async def main():
    """Точка входа запуска бота."""
    if not BOT_TOKEN or BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("\n" + "=" * 65)
        print("❌ ОШИБКА: Токен бота не найден или не настроен!")
        print("=" * 65)
        print("Как настроить токен:")
        print("1. Откройте в Telegram бота @BotFather (https://t.me/BotFather)")
        print("2. Отправьте команду /newbot и следуйте инструкциям")
        print("3. Скопируйте полученный токен вида: 1234567890:ABCdef...")
        print("4. Откройте файл .env в корне проекта и вставьте токен:")
        print("   BOT_TOKEN=ваш_токен_здесь")
        print("=" * 65 + "\n")
        sys.exit(1)

    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.include_router(main_router)

    # Настраиваем глобальную кнопку Mini App по умолчанию
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="💅 Окошко",
                web_app=WebAppInfo(url=MINI_APP_URL),
            )
        )
        logger.info(f"Глобальная кнопка меню настроена на URL: {MINI_APP_URL}")
    except Exception as e:
        logger.warning(f"Не удалось настроить глобальную MenuButton: {e}")

    bot_info = await bot.get_me()
    print("\n" + "=" * 55)
    print(f"🚀 Бот «Окошко» успешно запущен!")
    print(f"🤖 Имя: @{bot_info.username} ({bot_info.first_name})")
    print(f"🔗 Ссылка на Mini App: {MINI_APP_URL}")
    print("=" * 55 + "\n")

    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Бот остановлен.")
