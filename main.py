import argparse
from modules.fetch import fetch_data
from modules.utils import build_json, build_csv

# Getting args from cmd
parser = argparse.ArgumentParser()
parser.add_argument('--output', dest='output', help='Type of output')

args = parser.parse_args()

if __name__ == '__main__':
  raw_query_data = fetch_data(
    page_size = 10,
    max_value = 1000
  )
  if args.output == 'json':
    build_json(raw_query_data)
  elif args.output == 'csv':
    build_csv(raw_query_data)
  print('Done')