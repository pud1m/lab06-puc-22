from modules.fetch import fetch_data
from modules.utils import build_json

if __name__ == '__main__':
  raw_query_data = fetch_data(
    page_size = 10,
    max_value = 100
  )
  build_json(raw_query_data)
  print('Done')