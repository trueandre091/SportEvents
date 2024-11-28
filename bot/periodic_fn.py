import asyncio
from bot.bot import dp, bot
from DB.event import Event
from DB.user import User
from utils import *
from common import *
from parsing import run


async def parsing_and_notifications(test=False):
    while True:
        print("Парсинг и отправка уведомлений")
        if not test:
            old_events_num = Event().get_all_events_ids()
            Event().drop_table()
            all_events_num = await run.main()

            new_events_num = set(all_events_num) - set(old_events_num)
            new_events = [Event().get_by_event_id(event_id) for event_id in new_events_num]
            sports = [i.sport for i in new_events]

            users = User().get_users_with_notifications()
            for user in users:
                if user.tg_id and sports.count(user.sport):
                    message = (f"Здравствуйте!\n\nБыли запланированы новые спортивные мероприятия на нашем сайте, "
                            f"которые будут вам интересны: {sports.count(user.sport)} шт, спорт {user.sport} 🔝")
                    try:
                        await bot.send_message(user.tg_id, message)
                    except Exception as e:
                        print("Отправка сообщения запрещена")
                        pass

        await asyncio.sleep(7 * 24 * 60 * 60)

