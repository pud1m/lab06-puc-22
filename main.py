import argparse
from modules.fetch import fetch_data
from modules.utils import build_json, build_csv

# Getting args from cmd
parser = argparse.ArgumentParser()
parser.add_argument('--output', dest='output', help='Type of output')
parser.add_argument('--queryname', dest='queryname', help='Name of the query file', default=None)
parser.add_argument('--pagesize', dest='pagesize', help='Size of pages', default=10)
parser.add_argument('--querysize', dest='querysize', help='Size of the query being made', default=10)

args = parser.parse_args()

if __name__ == '__main__':
  raw_query_data = fetch_data(
    query_name = args.queryname,
    page_size = int(args.pagesize),
    max_value = int(args.querysize)
  )
  if args.output == 'json':
    build_json(raw_query_data)
  elif args.output == 'csv':
    build_csv(raw_query_data)
  print('Done')