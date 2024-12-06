import asyncio
from parsing import archive_parser, sportevents_parser, results_parser
import test_fsp_events
from bot.bot import dp, bot
from bot import handlers

async def main():
    await sportevents_parser.main()
    await archive_parser.main()
    await results_parser.main()

    print("start polling")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
