import asyncio

from bot.bot import dp, bot
from bot import handlers

async def main():
    print("Bot started")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
