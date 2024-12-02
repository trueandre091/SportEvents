import asyncio
from bot.periodic_fn import parsing_and_notifications

async def main():
    await parsing_and_notifications()

if __name__ == "__main__":
    asyncio.run(main()) 