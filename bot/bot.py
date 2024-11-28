import asyncio
import os
from dotenv import load_dotenv

from aiogram import Bot
from aiogram import Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

load_dotenv()

bot = Bot(token=os.environ.get("BOT_TOKEN"))
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
