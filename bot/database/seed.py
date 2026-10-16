import asyncio
import logging
from sqlalchemy import select

from bot.database.base import async_session_maker, init_db
from bot.database.models import City, Master, Salon, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Полный список поддерживаемых городов
SEED_CITIES = [
    {"slug": "all", "name": "Все регионы России", "short_name": "Все", "icon": "🗺️", "sub_title": "Вся география сервиса", "latitude": 55.7558, "longitude": 37.6173, "zoom": 6, "order_num": 1},
    {"slug": "moscow", "name": "Москва", "short_name": "Москва", "icon": "🏙️", "sub_title": "Москва и Московская область", "latitude": 55.7650, "longitude": 37.6050, "zoom": 13, "order_num": 2},
    {"slug": "spb", "name": "Санкт-Петербург", "short_name": "СПб", "icon": "🏛️", "sub_title": "Санкт-Петербург и ЛО", "latitude": 59.9340, "longitude": 30.3350, "zoom": 13, "order_num": 3},
    {"slug": "kazan", "name": "Казань", "short_name": "Казань", "icon": "🕌", "sub_title": "Республика Татарстан", "latitude": 55.7887, "longitude": 49.1221, "zoom": 12, "order_num": 4},
    {"slug": "samara", "name": "Самара", "short_name": "Самара", "icon": "⛵", "sub_title": "Самарская область", "latitude": 53.1959, "longitude": 50.1002, "zoom": 12, "order_num": 5},
    {"slug": "rostov", "name": "Ростов-на-Дону", "short_name": "Ростов", "icon": "🌾", "sub_title": "Ростовская область", "latitude": 47.2280, "longitude": 39.7150, "zoom": 12, "order_num": 6},
    {"slug": "krasnodar", "name": "Краснодар", "short_name": "Краснодар", "icon": "☀️", "sub_title": "Краснодарский край", "latitude": 45.0355, "longitude": 38.9753, "zoom": 12, "order_num": 7},
    {"slug": "voronezh", "name": "Воронеж", "short_name": "Воронеж", "icon": "🌳", "sub_title": "Воронежская область", "latitude": 51.6755, "longitude": 39.2089, "zoom": 12, "order_num": 8},
    {"slug": "volgograd", "name": "Волгоград", "short_name": "Волгоград", "icon": "⚓", "sub_title": "Волгоградская область", "latitude": 48.7071, "longitude": 44.5169, "zoom": 12, "order_num": 9},
    {"slug": "sochi", "name": "Сочи", "short_name": "Сочи", "icon": "🌴", "sub_title": "Курортный район и Сириус", "latitude": 43.6028, "longitude": 39.7342, "zoom": 12, "order_num": 10},
    {"slug": "stavropol", "name": "Ставрополь", "short_name": "Ставрополь", "icon": "⛰️", "sub_title": "Ставропольский край", "latitude": 45.0445, "longitude": 41.9691, "zoom": 12, "order_num": 11},
    {"slug": "anapa", "name": "Анапа", "short_name": "Анапа", "icon": "🏖️", "sub_title": "Черноморское побережье", "latitude": 44.8948, "longitude": 37.3163, "zoom": 13, "order_num": 12},
    {"slug": "tuapse", "name": "Туапсе", "short_name": "Туапсе", "icon": "🚢", "sub_title": "Туапсинский район", "latitude": 44.0975, "longitude": 39.0760, "zoom": 13, "order_num": 13},
    {"slug": "novorossiysk", "name": "Новороссийск", "short_name": "Новороссийск", "icon": "🌊", "sub_title": "Цемесская бухта", "latitude": 44.7239, "longitude": 37.7687, "zoom": 12, "order_num": 14},
]

async def seed_data():
    """Заполняет города и создает чистый начальный салон для создателя (без фейковых заглушек)"""
    await init_db()
    async with async_session_maker() as session:
        # 1. Заполняем города
        for city_data in SEED_CITIES:
            c_res = await session.execute(select(City).where(City.slug == city_data["slug"]))
            c_existing = c_res.scalar_one_or_none()
            if not c_existing:
                city = City(
                    slug=city_data["slug"],
                    name=city_data["name"],
                    short_name=city_data["short_name"],
                    icon=city_data["icon"],
                    sub_title=city_data["sub_title"],
                    latitude=city_data["latitude"],
                    longitude=city_data["longitude"],
                    zoom=city_data["zoom"],
                    order_num=city_data["order_num"],
                    is_active=True
                )
                session.add(city)
            else:
                c_existing.name = city_data["name"]
                c_existing.short_name = city_data["short_name"]
                c_existing.icon = city_data["icon"]
                c_existing.sub_title = city_data["sub_title"]
                c_existing.latitude = city_data["latitude"]
                c_existing.longitude = city_data["longitude"]
                c_existing.zoom = city_data["zoom"]
                c_existing.order_num = city_data["order_num"]

        # 2. Создаем чистый салон ID 1 для владельца (без статики и выдуманных данных)
        bs_res = await session.execute(select(Salon).where(Salon.id == 1))
        bs_salon = bs_res.scalar_one_or_none()
        if not bs_salon:
            bs_salon = Salon(
                id=1,
                name="",
                slug="salon",
                salon_type="Салон красоты",
                region="moscow",
                region_name="Москва",
                address="",
                phone="",
                rating=5.0,
                reviews_count=0,
                latitude=55.7558,
                longitude=37.6173,
                owner_id=1205557089,
                admin_id=None,
                admin_tag=None,
                image_url="",
            )
            session.add(bs_salon)
        else:
            bs_salon.owner_id = 1205557089
            bs_salon.slug = "salon"

        # 3. Создаем владельца 1205557089
        u_res = await session.execute(select(User).where(User.telegram_id == 1205557089))
        owner_user = u_res.scalar_one_or_none()
        if not owner_user:
            owner_user = User(
                telegram_id=1205557089,
                username="maximtepin",
                first_name="Максим",
                is_pro=True,
                role="owner",
                salon_id=1,
            )
            session.add(owner_user)
        else:
            owner_user.is_pro = True
            owner_user.role = "owner"
            owner_user.salon_id = 1

        await session.commit()
    logger.info("✅ База данных успешно инициализирована: города и чистый салон владельца.")

if __name__ == "__main__":
    asyncio.run(seed_data())
