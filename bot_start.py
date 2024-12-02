import asyncio

from bot.bot import dp, bot
from bot import handlers

async def main():
    # Создаем новый цикл событий
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Запускаем только поллинг бота, без парсинга
        await dp.start_polling(bot)
    finally:
        loop.close()

if __name__ == "__main__":
    asyncio.run(main())
