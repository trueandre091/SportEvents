from utils import *
from common import *
import parsing.driver
import parsing.fn
from DB.event import Event
import logging
import httpx
import re

logger = logging.getLogger(__name__)


async def get_current_pdf_url(params: dict) -> str:
    """Получает актуальную ссылку на PDF файл с сайта."""
    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(params["site_url"])
            response.raise_for_status()
            content = response.text
            
            file_matches = re.findall(params["pdf_pattern"], content)
            
            if file_matches:
                url = file_matches[0]
                url = f"https://storage.minsport.gov.ru{url}"
                logger.info(f"Найдена актуальная ссылка на PDF: {url}")
                return url
            
            logger.error("Не удалось найти ссылку на PDF файл")
            return None
            
    except Exception as e:
        logger.error(f"Ошибка при получении ссылки на PDF: {e}")
        return None


async def main():
    try:
        with open(PARAMS_PATH, 'r') as file:
            params = yaml.safe_load(file)

        # Получаем актуальную ссылку на PDF
        current_pdf_url = await get_current_pdf_url(params)
        if not current_pdf_url:
            logger.error("Не удалось получить актуальную ссылку на PDF")
            return []
        
        # Скачиваем файл только если он изменился
        files_path = await parsing.fn.save_files([current_pdf_url])
        if not files_path:
            logger.info("Нет новых файлов для обработки")
            return []

        files_dict = await parsing.fn.extract_pdf_to_table(files_path)
        result = []
        Event().drop_table()
        for all_events in files_dict:
            for sport, events in all_events.items():
                for event in events.copy():
                    event["sport"] = sport
                    result.append(event)
                    Event(**event).create()

        logger.info(f"Успешно обработано {len(result)} событий")
        return [i["event_id"] for i in result]
    except Exception as e:
        logger.error(f"Ошибка при выполнении парсера: {e}")
        raise
