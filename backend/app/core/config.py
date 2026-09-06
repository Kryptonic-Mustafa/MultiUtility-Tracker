import os
from dotenv import load_dotenv

# Load workspace root .env or backend .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))
load_dotenv()

raw_url = os.getenv(
    "SYNC_DATABASE_URL",
    os.getenv("DATABASE_URL", "mysql+pymysql://277XF19miZ6FU9s.root:fxr1XWkPoPgye73T@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/student_tracker")
)

# Strip any query parameters like ?sslaccept=strict that break PyMySQL connection kwargs
clean_url = raw_url.split("?")[0]

# Extract base host URL without database name (e.g. mysql+pymysql://root:pass@host:4000/)
if clean_url.endswith("/"):
    DB_BASE_URL = clean_url
else:
    DB_BASE_URL = clean_url.rsplit("/", 1)[0] + "/"

# Master Control Database URL
MASTER_SYNC_DATABASE_URL = f"{DB_BASE_URL}multiutility_master"

# Default Module #1 Database URL (student_tracker / module_sms)
SYNC_DATABASE_URL = f"{DB_BASE_URL}student_tracker"
DATABASE_URL = SYNC_DATABASE_URL

JWT_SECRET = os.getenv("JWT_SECRET", "multiutility_tracker_super_secret_key_2026")
DEFAULT_USER_PASSWORD = os.getenv("DEFAULT_USER_PASSWORD", "password")
PORT = int(os.getenv("PORT", "8000"))
