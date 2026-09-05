import ssl
import asyncio
from sqlalchemy import create_engine, text

def test_pymysql_engine():
    ctx = ssl.create_default_context()
    url = "mysql+pymysql://277XF19miZ6FU9s.root:fxr1XWkPoPgye73T@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/student_tracker"
    engine = create_engine(
        url,
        connect_args={"ssl": ctx},
        pool_recycle=3600,
        pool_pre_ping=True
    )
    with engine.connect() as conn:
        res = conn.execute(text("SELECT 1"))
        print("SQLAlchemy + PyMySQL Connection Result:", res.fetchone())

if __name__ == "__main__":
    test_pymysql_engine()
