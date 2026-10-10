import io
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Настройка UTF-8 для корректного вывода эмодзи в консоли Windows
if sys.platform == "win32":
    try:
        if sys.stdout and hasattr(sys.stdout, "buffer"):
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        if sys.stderr and hasattr(sys.stderr, "buffer"):
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

# Путь к корневому файлу .env
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE)
else:
    load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://noisy18.github.io/okoshko_web/").strip()
# Группа/чат для заявок на подключение PRO бизнес-аккаунтов
BUSINESS_GROUP_ID = int(os.getenv("BUSINESS_GROUP_ID", "-5590032342").strip())

DB_HOST = os.getenv("DB_HOST", "localhost").strip()
DB_PORT = os.getenv("DB_PORT", "5432").strip()
DB_NAME = os.getenv("DB_NAME", "okoshko_db").strip()
DB_USER = os.getenv("DB_USER", "okoshko_user").strip()
DB_PASS = os.getenv("DB_PASS", "okoshko_secret").strip()

DATABASE_URL = (
    f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

