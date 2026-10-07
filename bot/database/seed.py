import asyncio
import json
import logging
from sqlalchemy import select, delete

from bot.database.base import async_session_maker, init_db
from bot.database.models import Master, Salon

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Полный список 15 салонов с их мастерами и услугами
SEED_SALONS = [
    # 1. Beauty Studio (Москва)
    {
        "slug": "beauty",
        "name": "Beauty Studio",
        "salon_type": "Салон красоты",
        "region": "moscow",
        "region_name": "Москва · Тверской р-н",
        "address": "ул. Большая Садовая, 42 • м. Маяковская",
        "distance": "350 м",
        "rating": 4.9,
        "reviews_count": 148,
        "category_text": "Премиум маникюр, брови и эстетический уход",
        "price_from": "от 1 800 ₽",
        "latitude": 55.7675,
        "longitude": 37.6078,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuD68Q2lB-8_fzvF7A5OEHVHVhzif4gV6RJO3v1Pki6C3MDKAe0aVRpFaq2OhI2tIrB-199wxEmoCupVLmA6hNZB-2aghZ_lOnO1YyyoChZAtTcfdODO9ojl_oO6S_ZYBAgjLIx2n_S6TS09jqNtPujm77WTaf7Wy_NwiyDpJ5Qm3T1inuQxRLzxzvPJa64DlATLBAqU-N_vG49gtkadYgOYO1BBb74Voj3HfrL87g",
        "description": "Светлое премиум-пространство в центре Москвы. Стерильный инструмент в крафт-пакетах по СанПиН, заботливый сервис, напитки и ведущие мастера ногтевой эстетики.",
        "services": [
            {"id": "bs_s1", "name": "Маникюр с покрытием гель-лак Luxio", "desc": "Снятие, выравнивание, покрытие • 90 мин", "price": 2500, "duration": 90},
            {"id": "bs_s2", "name": "Архитектура и окрашивание бровей", "desc": "Хна или премиум-краситель Levissime • 60 мин", "price": 1800, "duration": 60},
            {"id": "bs_s3", "name": "Smart-педикюр эстетический", "desc": "Аппаратная обработка стопы + пальчики • 75 мин", "price": 2800, "duration": 75},
            {"id": "bs_s4", "name": "Ремонт / Дизайн френч", "desc": "Укрепление акрилом или пудрой • 20 мин", "price": 400, "duration": 20}
        ],
        "slots": ["14:00", "15:30", "17:00"],
        "masters": [
            {
                "id": "master_beauty_alina",
                "name": "Алина Романова",
                "role_title": "Топ-мастер аппаратного маникюра",
                "grade_badge": "PRO TOP",
                "rating": 5.0,
                "reviews_count": 156,
                "experience": "5 лет",
                "retention_rate": "98%",
                "bio": "Создаю эстетику на ваших руках. Стерильный инструмент по СанПиН в крафт-пакетах (вскрываю при вас), премиальные гели Luxio.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw",
                "slots": ["14:00", "16:30", "18:30"],
                "services": [
                    {"id": "ms1", "name": "Аппаратный маникюр + Luxio", "desc": "Снятие, выравнивание, покрытие • 90 мин", "price": 2500, "duration": 90},
                    {"id": "ms2", "name": "Smart-педикюр полный", "desc": "Обработка стоп, пальцев + гель • 75 мин", "price": 2800, "duration": 75},
                    {"id": "ms3", "name": "Ремонт / Дизайн френч", "desc": "Укрепление акрилом или пудрой • 20 мин", "price": 400, "duration": 20}
                ]
            },
            {
                "id": "master_beauty_daria",
                "name": "Дарья Соколова",
                "role_title": "Бровист & Ламимейкер",
                "grade_badge": "TOP BROW",
                "rating": 4.9,
                "reviews_count": 92,
                "experience": "4 года",
                "retention_rate": "96%",
                "bio": "Натуральные воздушные брови и выразительный взгляд без перещипывания.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAgp3bE_r8kPZ5o34gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
                "slots": ["11:00", "13:30", "16:00"],
                "services": [
                    {"id": "ds1", "name": "Архитектура и окрашивание бровей", "desc": "Хна или премиум-краситель Levissime • 60 мин", "price": 1800, "duration": 60},
                    {"id": "ds2", "name": "Ламинирование ресниц + Botox", "desc": "Глубокое питание и долговременный изгиб • 75 мин", "price": 2600, "duration": 75}
                ]
            },
            {
                "id": "master_beauty_kristina",
                "name": "Кристина Ли",
                "role_title": "Подолог & Мастер педикюра",
                "grade_badge": "EXPERT",
                "rating": 4.9,
                "reviews_count": 88,
                "experience": "6 лет",
                "retention_rate": "97%",
                "bio": "Здоровье и красота ваших стоп. Сертифицированный Smart-мастер.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA5bztruJ0qRQX2i_00XhPKFkueLK-zwXZZBiYgP4MxYHYz12xShkiIvWZITD3u2myphWGAI6e7PMgYZlMdM11v60dFyDkdX4_MGeHSeaKLfPmL2SNmIqdx9zmI2io0fLxvN3S2B_tBcraBnGUp9B6IJqWQscQlg5nzaKlIJ6mPlc2wihbgdI0iVhgZCoglo1gtjAIruesjytBMU9euIN5yyJZRa0C9hGV9XuEWQ",
                "slots": ["13:00", "17:00", "19:00"],
                "services": [
                    {"id": "kl1", "name": "Smart-педикюр эстетический", "desc": "Аппаратная обработка стопы + пальчики • 75 мин", "price": 2800, "duration": 75},
                    {"id": "kl2", "name": "Обработка проблемных зон стоп", "desc": "Медицинский уход за трещинами • 40 мин", "price": 1500, "duration": 40}
                ]
            }
        ]
    },

    # 2. Mono Studio (Москва)
    {
        "slug": "mono",
        "name": "Mono Studio",
        "salon_type": "Студия взгляда & бровей",
        "region": "moscow",
        "region_name": "Москва · Пресненский р-н",
        "address": "Тверской бульвар, 12 • м. Пушкинская",
        "distance": "620 м",
        "rating": 5.0,
        "reviews_count": 94,
        "category_text": "Архитектура бровей · Ресницы · Ламинирование",
        "price_from": "от 2 200 ₽",
        "latitude": 55.7698,
        "longitude": 37.5965,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw",
        "description": "Монобрендовая студия оформления взгляда. Авторские протоколы ламинирования ресниц и долговременной укладки бровей.",
        "services": [
            {"id": "ms_s1", "name": "Архитектура бровей + окрашивание", "desc": "Подбор формы по золотому сечению • 60 мин", "price": 2200, "duration": 60},
            {"id": "ms_s2", "name": "Ламинирование ресниц Novel", "desc": "Глубокое питание и изгиб • 75 мин", "price": 2900, "duration": 75},
            {"id": "ms_s3", "name": "Комплекс: Брови + Ресницы", "desc": "Все включено со скидкой • 110 мин", "price": 4500, "duration": 110}
        ],
        "slots": ["16:30", "18:00", "19:15"],
        "masters": [
            {
                "id": "master_mono_valeria",
                "name": "Валерия Новак",
                "role_title": "Ведущий мастер взгляда",
                "grade_badge": "ART MASTER",
                "rating": 5.0,
                "reviews_count": 94,
                "experience": "7 лет",
                "retention_rate": "99%",
                "bio": "Идеальные линии бровей и натуральный взгляд, подчеркивающий вашу природную красоту.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw",
                "slots": ["16:30", "18:00", "19:15"],
                "services": [
                    {"id": "vn1", "name": "Архитектура бровей + окрашивание", "desc": "Подбор формы по золотому сечению • 60 мин", "price": 2200, "duration": 60},
                    {"id": "vn2", "name": "Ламинирование ресниц Novel", "desc": "Глубокое питание и изгиб • 75 мин", "price": 2900, "duration": 75}
                ]
            }
        ]
    },

    # 3. Студия Алины Романовой (Москва)
    {
        "slug": "alina",
        "name": "Студия Алины Романовой",
        "salon_type": "Студия маникюра",
        "region": "moscow",
        "region_name": "Москва · Патриаршие пруды",
        "address": "Малая Бронная, 8 • м. Тверская",
        "distance": "280 м",
        "rating": 5.0,
        "reviews_count": 156,
        "category_text": "Аппаратный маникюр · Дизайн Luxio",
        "price_from": "от 2 500 ₽",
        "latitude": 55.7621,
        "longitude": 37.6110,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAgp3bE_r8kPZ5o34gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        "description": "Камерный салон ногтевой эстетики на Патриарших. Работаем на качественных материалах без сколов до 4 недель.",
        "services": [
            {"id": "al_s1", "name": "Маникюр Luxio полный цикл", "desc": "Безупречное выравнивание и покрытие • 90 мин", "price": 2500, "duration": 90},
            {"id": "al_s2", "name": "Японский эко-маникюр Masura", "desc": "Глянцевание минеральной пастой • 60 мин", "price": 2200, "duration": 60},
            {"id": "al_s3", "name": "Педикюр эстетика + гель", "desc": "Полный уход за пальчиками • 80 мин", "price": 3100, "duration": 80}
        ],
        "slots": ["14:00", "16:00", "18:30"],
        "masters": [
            {
                "id": "master_alina_romanova",
                "name": "Алина Романова",
                "role_title": "Основатель & Топ-мастер",
                "grade_badge": "FOUNDER",
                "rating": 5.0,
                "reviews_count": 156,
                "experience": "6 лет",
                "retention_rate": "99%",
                "bio": "Индивидуальный подход, ювелирная точность аппаратной обработки и эстетика минимализма.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw",
                "slots": ["14:00", "16:00", "18:30"],
                "services": [
                    {"id": "ar1", "name": "Маникюр Luxio полный цикл", "desc": "Безупречное выравнивание и покрытие • 90 мин", "price": 2500, "duration": 90},
                    {"id": "ar2", "name": "Японский эко-маникюр Masura", "desc": "Глянцевание минеральной пастой • 60 мин", "price": 2200, "duration": 60}
                ]
            }
        ]
    },

    # 4. Студия Кристины Ли (Москва)
    {
        "slug": "kristina",
        "name": "Студия Кристины Ли",
        "salon_type": "Подология & Мастер педикюра",
        "region": "moscow",
        "region_name": "Москва · Арбат",
        "address": "Большая Никитская, 22 • м. Арбатская",
        "distance": "490 м",
        "rating": 4.9,
        "reviews_count": 88,
        "category_text": "Smart-педикюр · Эстетика стоп",
        "price_from": "от 2 400 ₽",
        "latitude": 55.7600,
        "longitude": 37.6030,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA5bztruJ0qRQX2i_00XhPKFkueLK-zwXZZBiYgP4MxYHYz12xShkiIvWZITD3u2myphWGAI6e7PMgYZlMdM11v60dFyDkdX4_MGeHSeaKLfPmL2SNmIqdx9zmI2io0fLxvN3S2B_tBcraBnGUp9B6IJqWQscQlg5nzaKlIJ6mPlc2wihbgdI0iVhgZCoglo1gtjAIruesjytBMU9euIN5yyJZRa0C9hGV9XuEWQ",
        "description": "Специализированная студия подологии и эстетического педикюра. Деликатное решение любых проблем и шелковая гладкость стоп.",
        "services": [
            {"id": "kr_s1", "name": "Smart-педикюр эстетический", "desc": "Мембранная шлифовка стоп + гель-лак • 75 мин", "price": 2800, "duration": 75},
            {"id": "kr_s2", "name": "Комплекс: Педикюр + Экспресс-маникюр", "desc": "Одновременный уход в удобном кресле • 90 мин", "price": 4200, "duration": 90},
            {"id": "kr_s3", "name": "Медицинский подологический уход", "desc": "Обработка трещин и онихолизиса • 60 мин", "price": 2400, "duration": 60}
        ],
        "slots": ["13:00", "17:30", "19:00"],
        "masters": [
            {
                "id": "master_kristina_lee",
                "name": "Кристина Ли",
                "role_title": "Сертифицированный подолог",
                "grade_badge": "EXPERT",
                "rating": 4.9,
                "reviews_count": 88,
                "experience": "6 лет",
                "retention_rate": "97%",
                "bio": "Дипломированный специалист по здоровой стопе. Безболезненные техники и премиальная космецевтика.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA5bztruJ0qRQX2i_00XhPKFkueLK-zwXZZBiYgP4MxYHYz12xShkiIvWZITD3u2myphWGAI6e7PMgYZlMdM11v60dFyDkdX4_MGeHSeaKLfPmL2SNmIqdx9zmI2io0fLxvN3S2B_tBcraBnGUp9B6IJqWQscQlg5nzaKlIJ6mPlc2wihbgdI0iVhgZCoglo1gtjAIruesjytBMU9euIN5yyJZRa0C9hGV9XuEWQ",
                "slots": ["13:00", "17:30", "19:00"],
                "services": [
                    {"id": "kl_s1", "name": "Smart-педикюр эстетический", "desc": "Шлифовка смарт-дисками + гель • 75 мин", "price": 2800, "duration": 75},
                    {"id": "kl_s2", "name": "Медицинский подологический уход", "desc": "Лечебная обработка стоп • 60 мин", "price": 2400, "duration": 60}
                ]
            }
        ]
    },

    # 5. Glam Hair Bar (Москва)
    {
        "slug": "glam",
        "name": "Glam Hair Bar",
        "salon_type": "Салон стилистов & волос",
        "region": "moscow",
        "region_name": "Москва · Тверской р-н",
        "address": "Страстной бульвар, 6 • м. Чеховская",
        "distance": "510 м",
        "rating": 4.8,
        "reviews_count": 112,
        "category_text": "Стрижки · Airtouch · Укладки Dyson",
        "price_from": "от 2 800 ₽",
        "latitude": 55.7651,
        "longitude": 37.6092,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCRZg6wE3R84gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        "description": "Концептуальный салон красоты в центре. Трендовые техники сложного окрашивания, идеальные стрижки по форме лица и уходы Tokio Inkarami.",
        "services": [
            {"id": "gl_s1", "name": "Стрижка + фирменная укладка Dyson", "desc": "Мытье головы массажем и стайлинг • 60 мин", "price": 2800, "duration": 60},
            {"id": "gl_s2", "name": "Окрашивание Airtouch / Шатуш", "desc": "Плавный переход и мягкое отрастание • 180 мин", "price": 8500, "duration": 180},
            {"id": "gl_s3", "name": "Уход Tokio Inkarami", "desc": "Восстановление структуры волос • 75 мин", "price": 4900, "duration": 75}
        ],
        "slots": ["15:00", "17:30", "19:00"],
        "masters": [
            {
                "id": "master_glam_polina",
                "name": "Полина Смирнова",
                "role_title": "Топ-стилист колорист",
                "grade_badge": "TOP STYLIST",
                "rating": 4.9,
                "reviews_count": 112,
                "experience": "7 лет",
                "retention_rate": "97%",
                "bio": "Создаю роскошный блонд и стильные стрижки, которые легко укладывать дома.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw",
                "slots": ["15:00", "17:30", "19:00"],
                "services": [
                    {"id": "ps1", "name": "Стрижка + укладка Dyson", "desc": "Индивидуальная форма • 60 мин", "price": 2800, "duration": 60},
                    {"id": "ps2", "name": "Airtouch премиум", "desc": "Сложное окрашивание • 180 мин", "price": 8500, "duration": 180}
                ]
            }
        ]
    },

    # 6. Донская Эстетика (Ростов-на-Дону)
    {
        "slug": "rnd_don_beauty",
        "name": "Донская Эстетика",
        "salon_type": "Салон красоты & SPA",
        "region": "rostov",
        "region_name": "Ростов-на-Дону · Кировский р-н",
        "address": "Ростов-на-Дону, ул. Пушкинская, 115 • Центр",
        "distance": "Центр",
        "rating": 4.9,
        "reviews_count": 142,
        "category_text": "Премиум уход · Массаж · Стрижки",
        "price_from": "от 1 900 ₽",
        "latitude": 47.2272,
        "longitude": 39.7214,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuD68Q2lB-8_fzvF7A5OEHVHVhzif4gV6RJO3v1Pki6C3MDKAe0aVRpFaq2OhI2tIrB-199wxEmoCupVLmA6hNZB-2aghZ_lOnO1YyyoChZAtTcfdODO9ojl_oO6S_ZYBAgjLIx2n_S6TS09jqNtPujm77WTaf7Wy_NwiyDpJ5Qm3T1inuQxRLzxzvPJa64DlATLBAqU-N_vG49gtkadYgOYO1BBb74Voj3HfrL87g",
        "description": "Просторное бьюти-пространство на аллее Пушкинской. Комплексные программы ухода за телом, волосами и ногтями в 4 руки.",
        "services": [
            {"id": "de_s1", "name": "Маникюр + Педикюр в 4 руки", "desc": "Экономия времени, полный комфорт • 90 мин", "price": 4200, "duration": 90},
            {"id": "de_s2", "name": "Релакс-массаж всего тела", "desc": "Аромамасла и расслабление мышц • 60 мин", "price": 2800, "duration": 60},
            {"id": "de_s3", "name": "Маникюр с покрытием гель-лак", "desc": "Чистая аппаратная обработка • 75 мин", "price": 1900, "duration": 75}
        ],
        "slots": ["15:30", "17:00", "19:30"],
        "masters": [
            {
                "id": "master_rnd_anna",
                "name": "Анна Белова",
                "role_title": "Мастер ногтевого сервиса",
                "grade_badge": "PRO",
                "rating": 4.9,
                "reviews_count": 78,
                "experience": "5 лет",
                "retention_rate": "97%",
                "bio": "Быстрый и чистый маникюр без порезов. Большой выбор трендовых оттенков.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAgp3bE_r8kPZ5o34gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
                "slots": ["15:30", "17:00", "19:30"],
                "services": [
                    {"id": "ab1", "name": "Маникюр с покрытием гель-лак", "desc": "Аппаратная техника • 75 мин", "price": 1900, "duration": 75},
                    {"id": "ab2", "name": "Smart-педикюр эстетический", "desc": "Гладкость стоп • 70 мин", "price": 2300, "duration": 70}
                ]
            }
        ]
    },

    # 7. Loft Nails Rostov (Ростов-на-Дону)
    {
        "slug": "rnd_loft_nails",
        "name": "Loft Nails Rostov",
        "salon_type": "Студия маникюра & педикюра",
        "region": "rostov",
        "region_name": "Ростов-на-Дону · Ленинский р-н",
        "address": "Ростов-на-Дону, ул. Большая Садовая, 64",
        "distance": "Садовая",
        "rating": 5.0,
        "reviews_count": 98,
        "category_text": "Smart-педикюр · Гель-лак Luxio",
        "price_from": "от 1 600 ₽",
        "latitude": 47.2215,
        "longitude": 39.7138,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAgp3bE_r8kPZ5o34gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        "description": "Стильная студия в стиле лофт в сердце Ростова. Профессиональное оборудование, удобные реклайнеры для педикюра и приятные цены.",
        "services": [
            {"id": "ln_s1", "name": "Аппаратный маникюр + Luxio", "desc": "Выравнивание пластины и покрытие • 80 мин", "price": 1800, "duration": 80},
            {"id": "ln_s2", "name": "Smart-педикюр в кресле-реклайнере", "desc": "Максимальный комфорт спины • 75 мин", "price": 2200, "duration": 75},
            {"id": "ln_s3", "name": "Снятие + гигиенический маникюр", "desc": "Ухоженные руки без покрытия • 45 мин", "price": 1200, "duration": 45}
        ],
        "slots": ["14:30", "16:30", "18:00"],
        "masters": [
            {
                "id": "master_loft_elena",
                "name": "Елена Морозова",
                "role_title": "Топ-мастер ногтевого сервиса",
                "grade_badge": "TOP",
                "rating": 5.0,
                "reviews_count": 98,
                "experience": "6 лет",
                "retention_rate": "98%",
                "bio": "Идеальный френч и укрепление тонких ногтей без сколов.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw",
                "slots": ["14:30", "16:30", "18:00"],
                "services": [
                    {"id": "em1", "name": "Аппаратный маникюр + Luxio", "desc": "Выравнивание и цвет • 80 мин", "price": 1800, "duration": 80},
                    {"id": "em2", "name": "Smart-педикюр", "desc": "Полный уход • 75 мин", "price": 2200, "duration": 75}
                ]
            }
        ]
    },

    # 8. Brow Bar Садовая (Ростов-на-Дону)
    {
        "slug": "rnd_brow_bar",
        "name": "Brow Bar Садовая",
        "salon_type": "Студия бровей и взгляда",
        "region": "rostov",
        "region_name": "Ростов-на-Дону · Кировский р-н",
        "address": "Ростов-на-Дону, пр. Ворошиловский, 46",
        "distance": "Ворошиловский",
        "rating": 4.8,
        "reviews_count": 76,
        "category_text": "Ламинирование · Наращивание ресниц",
        "price_from": "от 1 500 ₽",
        "latitude": 47.2251,
        "longitude": 39.7189,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw",
        "description": "Специализированный броу-бар на Ворошиловском проспекте. Коррекция пинцетом и воском, окрашивание хной и краской, экспресс-укладки.",
        "services": [
            {"id": "bb_s1", "name": "Моделирование и окрашивание бровей", "desc": "Идеальная форма под тип лица • 45 мин", "price": 1500, "duration": 45},
            {"id": "bb_s2", "name": "Ламинирование бровей с уходом", "desc": "Укладка непослушных волосков • 60 мин", "price": 2200, "duration": 60},
            {"id": "bb_s3", "name": "Наращивание ресниц Классика / 2D", "desc": "Натуральный выразительный объем • 120 мин", "price": 2500, "duration": 120}
        ],
        "slots": ["16:00", "17:30", "19:00"],
        "masters": [
            {
                "id": "master_brow_victoria",
                "name": "Виктория Ким",
                "role_title": "Топ-бровист & Лешмейкер",
                "grade_badge": "PRO BROW",
                "rating": 4.9,
                "reviews_count": 76,
                "experience": "4 года",
                "retention_rate": "95%",
                "bio": "Бережное отношение к бровям, естественная форма и гармоничный цвет.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA5bztruJ0qRQX2i_00XhPKFkueLK-zwXZZBiYgP4MxYHYz12xShkiIvWZITD3u2myphWGAI6e7PMgYZlMdM11v60dFyDkdX4_MGeHSeaKLfPmL2SNmIqdx9zmI2io0fLxvN3S2B_tBcraBnGUp9B6IJqWQscQlg5nzaKlIJ6mPlc2wihbgdI0iVhgZCoglo1gtjAIruesjytBMU9euIN5yyJZRa0C9hGV9XuEWQ",
                "slots": ["16:00", "17:30", "19:00"],
                "services": [
                    {"id": "vk1", "name": "Моделирование и окрашивание бровей", "desc": "Пинцет / воск • 45 мин", "price": 1500, "duration": 45},
                    {"id": "vk2", "name": "Ламинирование бровей", "desc": "Долговременная фиксация • 60 мин", "price": 2200, "duration": 60}
                ]
            }
        ]
    },

    # 9. Style Club Западный (Ростов-на-Дону)
    {
        "slug": "rnd_west_style",
        "name": "Style Club Западный",
        "salon_type": "Семейный салон красоты",
        "region": "rostov",
        "region_name": "Ростов-на-Дону · Советский р-н",
        "address": "Ростов-на-Дону, пр. Коммунистический, 32",
        "distance": "Западный",
        "rating": 4.9,
        "reviews_count": 110,
        "category_text": "Стильные стрижки · Окрашивание · Уход",
        "price_from": "от 1 700 ₽",
        "latitude": 47.2085,
        "longitude": 39.6382,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCRZg6wE3R84gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        "description": "Уютный салон для всей семьи в Западном жилом массиве. Качественные стрижки, бережное тонирование волос и маникюр.",
        "services": [
            {"id": "sc_s1", "name": "Женская модельная стрижка + уход", "desc": "Индивидуальный силуэт и сушка феном • 60 мин", "price": 1700, "duration": 60},
            {"id": "sc_s2", "name": "Сложное тонирование / мелирование", "desc": "Красители L'Oreal Professionnel • 120 мин", "price": 4200, "duration": 120},
            {"id": "sc_s3", "name": "Комбинированный маникюр + гель", "desc": "Стойкое покрытие до 3 недель • 75 мин", "price": 1600, "duration": 75}
        ],
        "slots": ["13:00", "15:00", "18:30"],
        "masters": [
            {
                "id": "master_style_olga",
                "name": "Ольга Васильева",
                "role_title": "Парикмахер-стилист универсал",
                "grade_badge": "PRO",
                "rating": 4.9,
                "reviews_count": 110,
                "experience": "8 лет",
                "retention_rate": "96%",
                "bio": "Люблю создавать легкие и стильные формы, которые не требуют долгой укладки.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAgp3bE_r8kPZ5o34gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
                "slots": ["13:00", "15:00", "18:30"],
                "services": [
                    {"id": "ov1", "name": "Женская модельная стрижка", "desc": "Стрижка + легкая укладка • 60 мин", "price": 1700, "duration": 60},
                    {"id": "ov2", "name": "Сложное тонирование", "desc": "Освежение оттенка • 120 мин", "price": 4200, "duration": 120}
                ]
            }
        ]
    },

    # 10. ПодоЦентр СЕВЕР (Ростов-на-Дону)
    {
        "slug": "rnd_north_podolog",
        "name": "ПодоЦентр СЕВЕР",
        "salon_type": "Центр подологии & ухода",
        "region": "rostov",
        "region_name": "Ростов-на-Дону · Ворошиловский р-н",
        "address": "Ростов-на-Дону, пр. Космонавтов, 14/15",
        "distance": "СЖМ",
        "rating": 5.0,
        "reviews_count": 84,
        "category_text": "Медицинский педикюр · Вросшие ногти",
        "price_from": "от 2 100 ₽",
        "latitude": 47.2831,
        "longitude": 39.7126,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA5bztruJ0qRQX2i_00XhPKFkueLK-zwXZZBiYgP4MxYHYz12xShkiIvWZITD3u2myphWGAI6e7PMgYZlMdM11v60dFyDkdX4_MGeHSeaKLfPmL2SNmIqdx9zmI2io0fLxvN3S2B_tBcraBnGUp9B6IJqWQscQlg5nzaKlIJ6mPlc2wihbgdI0iVhgZCoglo1gtjAIruesjytBMU9euIN5yyJZRa0C9hGV9XuEWQ",
        "description": "Профильный центр здоровья стоп на Северном. Безболезненное устранение мозолей, трещин, установка титановой нити и гигиена стоп.",
        "services": [
            {"id": "pc_s1", "name": "Медицинский аппаратный педикюр", "desc": "Полная подологическая обработка стопы • 75 мин", "price": 2500, "duration": 75},
            {"id": "pc_s2", "name": "Установка коррекционной системы (нить)", "desc": "Коррекция формы ногтевой пластины • 40 мин", "price": 3000, "duration": 40},
            {"id": "pc_s3", "name": "Гигиенический педикюр стоп и пальцев", "desc": "Профилактический уход • 60 мин", "price": 2100, "duration": 60}
        ],
        "slots": ["17:00", "18:30"],
        "masters": [
            {
                "id": "master_podolog_svetlana",
                "name": "Светлана Игнатова",
                "role_title": "Ведущий подолог центра",
                "grade_badge": "MED EXPERT",
                "rating": 5.0,
                "reviews_count": 84,
                "experience": "9 лет",
                "retention_rate": "99%",
                "bio": "Медицинское образование, стерильность по высшим стандартам и бережное восстановление стоп.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA5bztruJ0qRQX2i_00XhPKFkueLK-zwXZZBiYgP4MxYHYz12xShkiIvWZITD3u2myphWGAI6e7PMgYZlMdM11v60dFyDkdX4_MGeHSeaKLfPmL2SNmIqdx9zmI2io0fLxvN3S2B_tBcraBnGUp9B6IJqWQscQlg5nzaKlIJ6mPlc2wihbgdI0iVhgZCoglo1gtjAIruesjytBMU9euIN5yyJZRa0C9hGV9XuEWQ",
                "slots": ["17:00", "18:30"],
                "services": [
                    {"id": "si1", "name": "Медицинский аппаратный педикюр", "desc": "Подологическая обработка • 75 мин", "price": 2500, "duration": 75},
                    {"id": "si2", "name": "Коррекция вросшего ногтя", "desc": "Установка нити • 40 мин", "price": 3000, "duration": 40}
                ]
            }
        ]
    },

    # 11. Ривьера Beauty (Таганрог)
    {
        "slug": "taganrog_riviera",
        "name": "Ривьера Beauty",
        "salon_type": "Салон красоты у моря",
        "region": "rostov",
        "region_name": "Таганрог · Приморский р-н",
        "address": "Таганрог, ул. Петровская, 88",
        "distance": "Таганрог",
        "rating": 4.8,
        "reviews_count": 65,
        "category_text": "SPA-ритуалы · Сложное окрашивание",
        "price_from": "от 1 600 ₽",
        "latitude": 47.2144,
        "longitude": 38.9285,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuD68Q2lB-8_fzvF7A5OEHVHVhzif4gV6RJO3v1Pki6C3MDKAe0aVRpFaq2OhI2tIrB-199wxEmoCupVLmA6hNZB-2aghZ_lOnO1YyyoChZAtTcfdODO9ojl_oO6S_ZYBAgjLIx2n_S6TS09jqNtPujm77WTaf7Wy_NwiyDpJ5Qm3T1inuQxRLzxzvPJa64DlATLBAqU-N_vG49gtkadYgOYO1BBb74Voj3HfrL87g",
        "description": "Приморский салон с расслабляющей атмосферой в исторической части Таганрога. Комплексные спа-программы, массаж и стильные образы.",
        "services": [
            {"id": "rv_s1", "name": "СПА-маникюр с маской и массажем", "desc": "Глубокое питание кожи рук • 75 мин", "price": 1800, "duration": 75},
            {"id": "rv_s2", "name": "Окрашивание волос в один тон", "desc": "Глянец и сияние Matrix • 90 мин", "price": 3200, "duration": 90},
            {"id": "rv_s3", "name": "SPA педикюр с морской солью", "desc": "Мягкий пилинг и уход • 70 мин", "price": 2200, "duration": 70}
        ],
        "slots": ["16:30", "18:00"],
        "masters": [
            {
                "id": "master_riviera_marina",
                "name": "Марина Ковалева",
                "role_title": "SPA-эстетист и мастер маникюра",
                "grade_badge": "PRO",
                "rating": 4.8,
                "reviews_count": 65,
                "experience": "5 лет",
                "retention_rate": "96%",
                "bio": "Создаю максимальный релакс во время бьюти-процедур. Ваши руки будут бархатными.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw",
                "slots": ["16:30", "18:00"],
                "services": [
                    {"id": "mk1", "name": "СПА-маникюр с маской", "desc": "Питание и уход • 75 мин", "price": 1800, "duration": 75},
                    {"id": "mk2", "name": "SPA педикюр", "desc": "Морские ритуалы • 70 мин", "price": 2200, "duration": 70}
                ]
            }
        ]
    },

    # 12. Mon Amour Батайск (Батайск)
    {
        "slug": "bataysk_glam",
        "name": "Mon Amour Батайск",
        "salon_type": "Студия красоты и бровей",
        "region": "rostov",
        "region_name": "Батайск · Центр",
        "address": "Батайск, ул. Кирова, 18",
        "distance": "Батайск",
        "rating": 4.9,
        "reviews_count": 52,
        "category_text": "Маникюр гель · Оформление бровей",
        "price_from": "от 1 400 ₽",
        "latitude": 47.1398,
        "longitude": 39.7512,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw",
        "description": "Уютная камерная студия в центре Батайска. Чистый аккуратный маникюр, быстрый сервис и вкусный кофе.",
        "services": [
            {"id": "ma_s1", "name": "Маникюр с гель-лаком под кутикулу", "desc": "Выравнивание базой и топ с блеском • 80 мин", "price": 1600, "duration": 80},
            {"id": "ma_s2", "name": "Оформление бровей хной BrowXenna", "desc": "Стойкий оттенок до 4 недель • 45 мин", "price": 1400, "duration": 45},
            {"id": "ma_s3", "name": "Экспресс-педикюр (пальчики)", "desc": "Обработка и гель-лак • 50 мин", "price": 1700, "duration": 50}
        ],
        "slots": ["14:00", "16:00", "17:30"],
        "masters": [
            {
                "id": "master_monamour_yana",
                "name": "Яна Лебедева",
                "role_title": "Мастер ногтевого сервиса и бровей",
                "grade_badge": "TOP",
                "rating": 4.9,
                "reviews_count": 52,
                "experience": "4 года",
                "retention_rate": "97%",
                "bio": "Люблю тонкое и прочное покрытие без эффекта пирожков на ногтях.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAgp3bE_r8kPZ5o34gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
                "slots": ["14:00", "16:00", "17:30"],
                "services": [
                    {"id": "yl1", "name": "Маникюр с гель-лаком", "desc": "Тонкое и стойкое • 80 мин", "price": 1600, "duration": 80},
                    {"id": "yl2", "name": "Оформление бровей хной", "desc": "Стойкий контур • 45 мин", "price": 1400, "duration": 45}
                ]
            }
        ]
    },

    # 13. Невский Этюд (Санкт-Петербург)
    {
        "slug": "spb_nevsky_glam",
        "name": "Невский Этюд",
        "salon_type": "Премиум салон красоты",
        "region": "spb",
        "region_name": "Санкт-Петербург · Центральный р-н",
        "address": "Санкт-Петербург, Невский проспект, 54 • м. Гостиный двор",
        "distance": "м. Гостиный двор",
        "rating": 5.0,
        "reviews_count": 168,
        "category_text": "Airtouch · Японский маникюр · Брови",
        "price_from": "от 2 400 ₽",
        "latitude": 59.9342,
        "longitude": 30.3364,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuD68Q2lB-8_fzvF7A5OEHVHVhzif4gV6RJO3v1Pki6C3MDKAe0aVRpFaq2OhI2tIrB-199wxEmoCupVLmA6hNZB-2aghZ_lOnO1YyyoChZAtTcfdODO9ojl_oO6S_ZYBAgjLIx2n_S6TS09jqNtPujm77WTaf7Wy_NwiyDpJ5Qm3T1inuQxRLzxzvPJa64DlATLBAqU-N_vG49gtkadYgOYO1BBb74Voj3HfrL87g",
        "description": "Исторический центр Петербурга с видом на Невский. Высочайший уровень сервиса, сложные окрашивания, кофе и игристое.",
        "services": [
            {"id": "spb_s1", "name": "Сложное окрашивание Airtouch / Шатуш", "desc": "Премиум красители Wella & Davines • 180 мин", "price": 7500, "duration": 180},
            {"id": "spb_s2", "name": "Японский эко-маникюр P.Shine", "desc": "Восстановление ногтевой пластины • 60 мин", "price": 2400, "duration": 60},
            {"id": "spb_s3", "name": "Smart-педикюр SPA с парафином", "desc": "Смягчающие ванночки и гладкость • 80 мин", "price": 3200, "duration": 80}
        ],
        "slots": ["15:00", "17:00", "19:00"],
        "masters": [
            {
                "id": "master_spb_maria",
                "name": "Мария Воронцова",
                "role_title": "Топ-стилист колорист",
                "grade_badge": "ART DIRECTOR",
                "rating": 5.0,
                "reviews_count": 118,
                "experience": "8 лет",
                "retention_rate": "98%",
                "bio": "Эксперт по бережному осветлению и сияющему блонду. Сохраняю качество волос.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw",
                "slots": ["15:00", "17:00", "19:00"],
                "services": [
                    {"id": "mv1", "name": "Сложное окрашивание Airtouch", "desc": "Бережное осветление • 180 мин", "price": 7500, "duration": 180},
                    {"id": "mv2", "name": "Стрижка + уход Davines", "desc": "Форма и глубокое питание • 75 мин", "price": 3500, "duration": 75}
                ]
            }
        ]
    },

    # 14. Петроградка Nails & Care (Санкт-Петербург)
    {
        "slug": "spb_petro_nails",
        "name": "Петроградка Nails & Care",
        "salon_type": "Студия эстетики ногтей",
        "region": "spb",
        "region_name": "Санкт-Петербург · Петроградский р-н",
        "address": "Санкт-Петербург, Большой пр. П.С., 38 • м. Петроградская",
        "distance": "м. Петроградская",
        "rating": 4.9,
        "reviews_count": 124,
        "category_text": "Аппаратный маникюр · Дизайн · Педикюр",
        "price_from": "от 2 200 ₽",
        "latitude": 59.9610,
        "longitude": 30.3060,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAgp3bE_r8kPZ5o34gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        "description": "Эстетичное пространство на Петроградской стороне. Тонкое покрытие гелем, нюдовая палитра и идеальный чистый срез кутикулы.",
        "services": [
            {"id": "pn_s1", "name": "Аппаратный маникюр + Luxio Нюд", "desc": "Снятие, идеальная форма и покрытие • 85 мин", "price": 2400, "duration": 85},
            {"id": "pn_s2", "name": "Smart-педикюр эстетика", "desc": "Мягкие пяточки без лезвий • 70 мин", "price": 2700, "duration": 70},
            {"id": "pn_s3", "name": "Укрепление гелем / полигелем", "desc": "Для ломких ногтей любой длины • 30 мин", "price": 600, "duration": 30}
        ],
        "slots": ["14:00", "16:00", "18:30"],
        "masters": [
            {
                "id": "master_petro_ksenia",
                "name": "Ксения Орлова",
                "role_title": "Топ-мастер ногтевой эстетики",
                "grade_badge": "PRO",
                "rating": 4.9,
                "reviews_count": 124,
                "experience": "5 лет",
                "retention_rate": "97%",
                "bio": "Мастер нюда и идеальных бликов. Носибельность покрытия от 3.5 недель.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAgp3bE_r8kPZ5o34gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
                "slots": ["14:00", "16:00", "18:30"],
                "services": [
                    {"id": "ko1", "name": "Аппаратный маникюр + Luxio Нюд", "desc": "Безупречные блики • 85 мин", "price": 2400, "duration": 85},
                    {"id": "ko2", "name": "Smart-педикюр эстетика", "desc": "Гладкая стопа • 70 мин", "price": 2700, "duration": 70}
                ]
            }
        ]
    },

    # 15. Василеостровский SPA Lounge (Санкт-Петербург)
    {
        "slug": "spb_vasilievsky_spa",
        "name": "Василеостровский SPA Lounge",
        "salon_type": "Массаж & SPA студия",
        "region": "spb",
        "region_name": "Санкт-Петербург · Василеостровский р-н",
        "address": "Санкт-Петербург, 7-я линия В.О., 26 • м. Василеостровская",
        "distance": "м. Василеостровская",
        "rating": 4.9,
        "reviews_count": 89,
        "category_text": "Антистресс массаж · Foot SPA · Уход",
        "price_from": "от 2 600 ₽",
        "latitude": 59.9423,
        "longitude": 30.2785,
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCRZg6wE3R84gXyIuQy_jS2M2nIeD2Y_E29-JkW_w3b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        "description": "Оазис тишины и восстановления на Васильевском острове. Натуральные масла, приглушенный свет, ароматерапия и авторские спа-ритуалы.",
        "services": [
            {"id": "vo_s1", "name": "Антистресс массаж спины и шейно-воротниковой зоны", "desc": "Снятие напряжения и зажимов • 45 мин", "price": 2600, "duration": 45},
            {"id": "vo_s2", "name": "Foot SPA ритуал + массаж стоп", "desc": "Теплая ванночка с травами и массаж • 60 мин", "price": 2900, "duration": 60},
            {"id": "vo_s3", "name": "Общий арома-массаж всего тела", "desc": "Натуральные тайские масла • 90 мин", "price": 4200, "duration": 90}
        ],
        "slots": ["16:30", "18:00", "19:30"],
        "masters": [
            {
                "id": "master_vasil_artyom",
                "name": "Артем Семенов",
                "role_title": "Топ SPA-терапевт & Массажист",
                "grade_badge": "SPA MASTER",
                "rating": 5.0,
                "reviews_count": 89,
                "experience": "8 лет",
                "retention_rate": "98%",
                "bio": "Чуткие руки, глубокая проработка зажимов и бережное снятие стресса мегаполиса.",
                "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw",
                "slots": ["16:30", "18:00", "19:30"],
                "services": [
                    {"id": "as1", "name": "Антистресс массаж спины и ШВЗ", "desc": "Снятие зажимов • 45 мин", "price": 2600, "duration": 45},
                    {"id": "as2", "name": "Foot SPA ритуал + массаж стоп", "desc": "Травяные ванночки • 60 мин", "price": 2900, "duration": 60}
                ]
            }
        ]
    }
]

async def seed_data():
    await init_db()
    async with async_session_maker() as session:
        for salon_data in SEED_SALONS:
            slug = salon_data["slug"]
            res = await session.execute(select(Salon).where(Salon.slug == slug))
            existing = res.scalar_one_or_none()
            if not existing:
                s = Salon(
                    slug=slug,
                    name=salon_data["name"],
                    salon_type=salon_data["salon_type"],
                    region=salon_data["region"],
                    region_name=salon_data["region_name"],
                    address=salon_data["address"],
                    distance=salon_data["distance"],
                    rating=salon_data["rating"],
                    reviews_count=salon_data["reviews_count"],
                    category_text=salon_data["category_text"],
                    price_from=salon_data["price_from"],
                    latitude=salon_data["latitude"],
                    longitude=salon_data["longitude"],
                    image_url=salon_data["image_url"],
                    description=salon_data.get("description", ""),
                    services_json=json.dumps(salon_data.get("services", []), ensure_ascii=False),
                    slots_json=json.dumps(salon_data.get("slots", []), ensure_ascii=False)
                )
                session.add(s)
                await session.flush()
                logger.info(f"Добавлен салон: {s.name} (ID {s.id})")

                for m_data in salon_data.get("masters", []):
                    m = Master(
                        salon_id=s.id,
                        name=m_data["name"],
                        role_title=m_data["role_title"],
                        grade_badge=m_data.get("grade_badge", "PRO"),
                        rating=m_data.get("rating", 5.0),
                        reviews_count=m_data.get("reviews_count", 50),
                        experience=m_data.get("experience", "5 лет"),
                        retention_rate=m_data.get("retention_rate", "98%"),
                        bio=m_data.get("bio", ""),
                        avatar_url=m_data["avatar_url"],
                        slots_json=json.dumps(m_data.get("slots", []), ensure_ascii=False),
                        services_json=json.dumps(m_data.get("services", []), ensure_ascii=False)
                    )
                    session.add(m)
                    logger.info(f"Добавлен мастер: {m.name} для {s.name}")
            else:
                # Обновим поля салона и мастеров при повторном запуске
                existing.name = salon_data["name"]
                existing.salon_type = salon_data["salon_type"]
                existing.region = salon_data["region"]
                existing.region_name = salon_data["region_name"]
                existing.address = salon_data["address"]
                existing.distance = salon_data["distance"]
                existing.rating = salon_data["rating"]
                existing.reviews_count = salon_data["reviews_count"]
                existing.category_text = salon_data["category_text"]
                existing.price_from = salon_data["price_from"]
                existing.latitude = salon_data["latitude"]
                existing.longitude = salon_data["longitude"]
                existing.image_url = salon_data["image_url"]
                existing.description = salon_data.get("description", "")
                existing.services_json = json.dumps(salon_data.get("services", []), ensure_ascii=False)
                existing.slots_json = json.dumps(salon_data.get("slots", []), ensure_ascii=False)

                # Удалим и пересоздадим мастеров для актуальности данных
                await session.execute(delete(Master).where(Master.salon_id == existing.id))
                for m_data in salon_data.get("masters", []):
                    m = Master(
                        salon_id=existing.id,
                        name=m_data["name"],
                        role_title=m_data["role_title"],
                        grade_badge=m_data.get("grade_badge", "PRO"),
                        rating=m_data.get("rating", 5.0),
                        reviews_count=m_data.get("reviews_count", 50),
                        experience=m_data.get("experience", "5 лет"),
                        retention_rate=m_data.get("retention_rate", "98%"),
                        bio=m_data.get("bio", ""),
                        avatar_url=m_data["avatar_url"],
                        slots_json=json.dumps(m_data.get("slots", []), ensure_ascii=False),
                        services_json=json.dumps(m_data.get("services", []), ensure_ascii=False)
                    )
                    session.add(m)

        await session.commit()
    logger.info("✅ База данных успешно заполнена всеми 15 салонами и мастерами!")

if __name__ == "__main__":
    asyncio.run(seed_data())
