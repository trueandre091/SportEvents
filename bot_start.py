import asyncio
from parsing import run as parsing
from bot.bot import dp, bot
from bot import handlers

async def main():
    print("start polling")
    await asyncio.gather(dp.start_polling(bot), parsing.main())


if __name__ == "__main__":
    asyncio.run(main())
