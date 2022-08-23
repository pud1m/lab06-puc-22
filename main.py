from modules.fetch import fetch_data
from modules.utils import build_json
from modules.csv import build_csv

if __name__ == '__main__':
  raw_query_data = fetch_data(
    page_size = 10,
    max_value = 1000
  )
  build_json(raw_query_data)
  build_csv()
  print('Done')