from datetime import datetime, timedelta
from DB.FSPevent import FSPevent
from DB.models.regionals import Regions
from DB.models.FSPevent_status import FSPEventStatus

# Базовая дата для тестов
base_date = datetime.now()

# Тестовые записи
test_events = [
    FSPevent(
        sport="Футбол",
        title="Чемпионат области по футболу",
        description="Ежегодный чемпионат области по футболу среди любительских команд",
        participants="Любительские команды",
        participants_num="16 команд",
        discipline="Футбол 11x11",
        region=Regions.MOSCOW_REGION,
        representative="Иванов И.И.",
        place="Центральный стадион",
        date_start=base_date - timedelta(days=30),
        date_end=base_date - timedelta(days=25),
        status=FSPEventStatus.APPROVED,
        files=[{
            "key": "events/123/regulations.pdf",
            "filename": "положение.pdf",
            "size": 1234567,
            "mime_type": "application/pdf",
            "uploaded_at": "2024-03-14T12:00:00Z"
        }]
    ),
    FSPevent(
        sport="Баскетбол",
        title="Кубок города по баскетболу",
        description="Турнир по баскетболу среди школьных команд",
        participants="Школьные команды",
        participants_num="8 команд",
        discipline="Баскетбол 5x5",
        region=Regions.SAINT_PETERSBURG,
        representative="Петров П.П.",
        place="Спортивный комплекс 'Олимп'",
        date_start=base_date - timedelta(days=20),
        date_end=base_date - timedelta(days=18),
        status=FSPEventStatus.APPROVED,
        files=[]
    ),
    FSPevent(
        sport="Волейбол",
        title="Студенческая лига по волейболу",
        description="Межвузовские соревнования по волейболу",
        participants="Студенческие команды",
        participants_num="12 команд",
        discipline="Волейбол",
        region=Regions.KALININGRAD_REGION,
        representative="Сидоров С.С.",
        place="Университетский спорткомплекс",
        date_start=base_date - timedelta(days=15),
        date_end=base_date - timedelta(days=10),
        status=FSPEventStatus.APPROVED,
        files=[]
    ),
    FSPevent(
        sport="Легкая атлетика",
        title="Областные соревнования по легкой атлетике",
        description="Соревнования по бегу на различные дистанции",
        participants="Спортсмены от 18 лет",
        participants_num="150 участников",
        discipline="Бег",
        region=Regions.NOVOSIBIRSK_REGION,
        representative="Кузнецов К.К.",
        place="Легкоатлетический манеж",
        date_start=base_date - timedelta(days=10),
        date_end=base_date - timedelta(days=8),
        status=FSPEventStatus.CONSIDERATION,
        files=[]
    ),
    FSPevent(
        sport="Плавание",
        title="Городские соревнования по плаванию",
        description="Соревнования по плаванию различными стилями",
        participants="Дети 12-16 лет",
        participants_num="80 участников",
        discipline="Плавание",
        region=Regions.ASTRAKHAN_REGION,
        representative="Морозова М.М.",
        place="Бассейн 'Дельфин'",
        date_start=base_date - timedelta(days=5),
        date_end=base_date - timedelta(days=3),
        status=FSPEventStatus.REJECTED,
        files=[]
    )
]

# Добавление записей в базу данных
for event in test_events:
    event.add()

print("Тестовые записи добавлены в базу данных")
