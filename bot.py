"""
Okoshko Telegram Bot runner.
Модульная структура проекта находится в папке /bot.
"""
import asyncio
from bot.main import main

if __name__ == "__main__":
    asyncio.run(main())
