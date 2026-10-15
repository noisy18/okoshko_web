import asyncio
from bot.database.base import async_session_maker
from bot.database.models import Salon, User, Master
from sqlalchemy import select

async def main():
    async with async_session_maker() as s:
        salons = (await s.execute(select(Salon))).scalars().all()
        print("\n=== САЛОНЫ И АДМИНИСТРАТОРЫ ===")
        for sal in salons:
            print(f"ID: {sal.id} | Slug: {sal.slug} | Name: '{sal.name}' | Owner ID: {sal.owner_id} | Admin ID: {sal.admin_id} | Admin Tag: {sal.admin_tag}")

        users = (await s.execute(select(User))).scalars().all()
        print("\n=== ВСЕ ПОЛЬЗОВАТЕЛИ ===")
        for u in users:
            print(f"User TG: {u.telegram_id} | Username: @{u.username} | Name: {u.first_name} | Role: {u.role} | Salon ID: {u.salon_id} | PRO: {u.is_pro}")

        masters = (await s.execute(select(Master))).scalars().all()
        print("\n=== МАСТЕРА С ПРИВЯЗКАМИ ===")
        for m in masters:
            print(f"Master: {m.name} {m.last_name} | TG ID: {m.telegram_id} | TG Handle: {m.telegram_handle} | Salon ID: {m.salon_id}")

if __name__ == "__main__":
    asyncio.run(main())
