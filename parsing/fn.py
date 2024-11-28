import datetime
import re
from plistlib import dumps

from utils import *
from common import *


async def save_files(files_url: list[str]) -> list[str] | None:
    files_path = []
    file_index = 1
    for file_url in files_url:
        try:
            with httpx.Client(follow_redirects=True, verify=False) as client:
                response = client.get(file_url)
                response.raise_for_status()

                file_path = os.path.join(FILES_PATH, f"parse_data_{file_index}.pdf")
                with open(file_path, "wb") as file:
                    for chunk in response.iter_bytes(chunk_size=8192):
                        file.write(chunk)

            files_path.append(file_path)
            print(f"Файл успешно скачан и сохранен по пути: {FILES_PATH}")
        except httpx.RequestError as e:
            print(f"Ошибка при выполнении запроса: {e}")
            return None
        except httpx.HTTPStatusError as e:
            print(f"Ошибка HTTP статуса: {e.response.status_code} - {e.response.text}")
            return None
    return files_path


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

