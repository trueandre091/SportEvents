from utils import *
from common import *
import parsing.driver
import parsing.fn
from DB.event import Event


async def main():
    with open(PARAMS_PATH, 'r') as file:
        params = yaml.safe_load(file)

    url = params["site_url"]
    link_pattern = params["link_pattern"]
    link_tags = params["link_tags"]

    driver = await parsing.driver.start()
    driver.get(url)

    page_source = driver.page_source
    urls = re.findall(link_pattern, page_source)
    files_url = []
    for url in urls:
        if len([True for i in link_tags if i in url]) == len(link_tags):
            files_url.append(url)

    files_path = await parsing.fn.save_files(files_url)
    files_dict = await parsing.fn.extract_pdf_to_table(files_path)
    result = []
    for all_events in files_dict:
        for sport, events in all_events.items():
            for event in events.copy():
                event["sport"] = sport
                result.append(event)
                Event(**event).create()

    return [i["event_id"] for i in result]
