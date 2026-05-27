import os
from dotenv import load_dotenv
from scheduler import start_scheduler

load_dotenv()

if __name__ == "__main__":
    print("크롤러 시작")
    start_scheduler()
