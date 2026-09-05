import os
from dotenv import load_dotenv

# Load workspace root .env or backend .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+aiomysql://***REMOVED_DB_USER***:***REMOVED_DB_PASSWORD***@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/student_tracker"
).split("?")[0]
SYNC_DATABASE_URL = os.getenv(
    "SYNC_DATABASE_URL",
    "mysql+pymysql://***REMOVED_DB_USER***:***REMOVED_DB_PASSWORD***@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/student_tracker"
).split("?")[0]

JWT_SECRET = os.getenv("JWT_SECRET", "***REMOVED_JWT_SECRET***")
DEFAULT_USER_PASSWORD = os.getenv("DEFAULT_USER_PASSWORD", "password")
PORT = int(os.getenv("PORT", "8000"))
