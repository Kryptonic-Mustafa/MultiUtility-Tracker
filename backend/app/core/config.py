import os
from dotenv import load_dotenv

# Load workspace root .env or backend .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+aiomysql://277XF19miZ6FU9s.root:fxr1XWkPoPgye73T@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/student_tracker"
).split("?")[0]
SYNC_DATABASE_URL = os.getenv(
    "SYNC_DATABASE_URL",
    "mysql+pymysql://277XF19miZ6FU9s.root:fxr1XWkPoPgye73T@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/student_tracker"
).split("?")[0]

JWT_SECRET = os.getenv("JWT_SECRET", "multiutility_tracker_super_secret_key_2026")
DEFAULT_USER_PASSWORD = os.getenv("DEFAULT_USER_PASSWORD", "password")
PORT = int(os.getenv("PORT", "8000"))
