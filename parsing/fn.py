import logging

import datetime
import re
from plistlib import dumps

from utils import *
from common import *

logger = logging.getLogger(__name__)


def extract_file_id(url: str) -> str:
    """Извлекает уникальный идентификатор из URL файла."""
    try:
        # Пробуем найти хеш в конце URL
        match = re.search(r'_([a-f0-9]+)\.pdf$', url)
        if match:
            return match.group(1)
        
        # Если не нашли хеш, используем всё имя файла после последнего слеша
        match = re.search(r'/([^/]+)\.pdf$', url)
        if match:
            return match.group(1)
            
        logger.warning(f"Не удалось извлечь идентификатор из URL: {url}")
        return None
    except Exception as e:
        logger.error(f"Ошибка при извлечении идентификатора из URL {url}: {e}")
        return None


def get_last_file_id() -> str:
    """Получает идентификатор последнего загруженного файла."""
    try:
        with open(os.path.join(FILES_PATH, "last_file_id.txt"), "r") as f:
            return f.read().strip()
    except FileNotFoundError:
        return None


def save_file_id(file_id: str):
    """Сохраняет идентификатор файла."""
    with open(os.path.join(FILES_PATH, "last_file_id.txt"), "w") as f:
        f.write(file_id)


async def save_files(files_url: list[str]) -> list[str] | None:
    if not files_url:
        logger.error("Список URL файлов пуст")
        return None

    # Проверяем первый URL (предполагаем, что он основной)
    file_id = extract_file_id(files_url[0])
    if not file_id:
        logger.error("Не удалось извлечь идентификатор файла из URL")
        return None

    # Проверяем, изменился ли файл
    last_file_id = get_last_file_id()
    if last_file_id:
        if last_file_id == file_id:
            logger.info(f"Файл не изменился с последнего обновления (ID: {file_id})")
            return None
        else:
            logger.info(f"Обнаружен новый файл (старый ID: {last_file_id}, новый ID: {file_id})")
    else:
        logger.info("Первая загрузка файла")

    files_path = []
    file_index = 1
    
    # Создаём директорию для файлов, если её нет
    os.makedirs(FILES_PATH, exist_ok=True)
    
    for file_url in files_url:
        try:
            current_file_id = extract_file_id(file_url)
            if not current_file_id:
                logger.warning(f"Пропуск URL из-за невозможности извлечь ID: {file_url}")
                continue

            with httpx.Client(follow_redirects=True, verify=False) as client:
                response = client.get(file_url)
                response.raise_for_status()

                # Проверяем размер файла
                content_length = int(response.headers.get('content-length', 0))
                if content_length == 0:
                    logger.warning(f"Пропуск пустого файла: {file_url}")
                    continue

                file_path = os.path.join(FILES_PATH, f"parse_data_{file_index}.pdf")
                with open(file_path, "wb") as file:
                    for chunk in response.iter_bytes(chunk_size=8192):
                        file.write(chunk)

                # Проверяем, что файл действительно сохранился
                if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                    logger.error(f"Файл не был сохранен корректно: {file_path}")
                    continue

            files_path.append(file_path)
            logger.info(f"Файл успешно скачан и сохранен: {file_path} (ID: {current_file_id})")
        except httpx.RequestError as e:
            logger.error(f"Ошибка при выполнении запроса: {e}")
            continue
        except httpx.HTTPStatusError as e:
            logger.error(f"Ошибка HTTP статуса: {e.response.status_code} - {e.response.text}")
            continue
        except Exception as e:
            logger.error(f"Непредвиденная ошибка при сохранении файла: {e}")
            continue
        file_index += 1

    # Сохраняем новый идентификатор файла только если успешно сохранили хотя бы один файл
    if files_path:
        save_file_id(file_id)
        logger.info(f"Сохранен новый идентификатор файла: {file_id}")
        return files_path
    else:
        logger.error("Не удалось сохранить ни один файл")
        return None


async def extract_pdf_to_table(files_path: str):
    files_dict = []
    for file_path in files_path:
        all_text = ""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for i in range(len(reader.pages)):
                page = reader.pages[i]
                all_text += page.extract_text()

        for i in range(1, 2496):
            all_text = all_text.replace(f"Стр. {i} из 2495", "", 1)

        table = {}
        sport_pattern = r"([А-ЯЁ\s\(\)-]+)\nОсновной состав"
        split_text_by_sport = re.split(sport_pattern, all_text)
        matches = re.finditer(sport_pattern, all_text)
        i = 1
        for match in matches:
            sport_name = match.group(1)
            table[sport_name.strip(")").replace("\n", "")] = split_text_by_sport[i * 2].replace("\n", " ").replace("Молодежный (резервный) состав", "")
            i += 1

        for sport, text in table.copy().items():
            split_by_number = re.split(r"(\b[0-9]{16}\b)", text)
            split_by_number = [i for i in split_by_number]

            even = split_by_number[::2]
            odd = split_by_number[1::2]
            result = {}
            for x, y in zip(even[1:], odd):
                if len(x) == 16:
                    result[x] = y.strip()
                else:
                    result[y] = x.strip()
            table[sport] = result

        for sport, events in table.copy().items():
            events_list = []
            for number, text in events.copy().items():
                buff = {}
                print(text)
                pattern = re.compile(r'[0-9.]{10} [0-9.]{10}')
                dates = [match.group(0).strip() for match in pattern.finditer(text) if match.group(0).strip()][-1]
                text = text.split(dates)
                dates = dates.split(" ")

                pattern = re.compile(r'(\d{1,5}$)')
                try:
                    participants_num = [match.group(0).strip() for match in pattern.finditer("".join(text)) if match.group(0).strip()][-1]
                except:
                    participants_num = "100"
                text[1] = text[1][:-len(participants_num)]

                pattern = re.compile(r'([а-яё]+[а-яё0-9, \-]*[а-яё][а-яё0-9, \-]*)')
                participants = [match.group(0).strip() for match in pattern.finditer("".join(text[0])) if match.group(0).strip()][0]
                place = text[1].strip().replace("\n", " ").replace("  ", " ")
                text = text[0].split(participants)

                title = text[0].strip()
                discipline = text[1].strip()

                buff["event_id"] = number
                buff["title"] = title
                buff["participants"] = participants
                buff["participants_num"] = participants_num
                buff["discipline"] = discipline
                buff["place"] = place
                buff["date_start"] = datetime.datetime.strptime(dates[0], "%d.%m.%Y")
                buff["date_end"] = datetime.datetime.strptime(dates[1], "%d.%m.%Y")
                events_list.append(buff)

            table[sport] = events_list

        files_dict.append(table)
    return files_dict

