import asyncio

from bot.bot import dp, bot
from bot import handlers
from bot import periodic_fn

async def main():
    # Создаем новый цикл событий
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        await asyncio.gather(
            dp.start_polling(bot),
            periodic_fn.parsing_and_notifications(test=False)
        )
    finally:
        loop.close()

if __name__ == "__main__":
    asyncio.run(main())
