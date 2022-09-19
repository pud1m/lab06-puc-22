import os
import json
import csv
from collections.abc import MutableMapping
import pandas as pd


def flatten_dict(d: MutableMapping, sep: str= '.') -> MutableMapping:
  """ Flattens a dictionary.
    Ref: https://www.freecodecamp.org/news/how-to-flatten-a-dictionary-in-python-in-4-different-ways/
    (Modified for context)
  """
  return pd.json_normalize(d, sep=sep).to_dict(orient='records')


def get_token():
  """" Returns github personal access token """
  with open(os.path.join('', '.token'), 'r') as f:
    token = f.read()
  return token


def get_queries(query_name: str = None):
  """ Returns an array of graphql queries """
  query_list = []
  
  if query_name is None:
    file_list = os.listdir('queries')
  else:
    file_list = [f'{query_name}.graphql']

  for filename in file_list:
    if '.graphql' in filename:
      with open(os.path.join('queries', filename), 'r') as f:
        query = f.read()
        query_list.append({
          'query': query,
          'name': filename.replace('.graphql', '')
        })
  return query_list


def build_json(data: list):
  """ Builds json from fetched data and saves it to out folder """
  for response in data:
    json_data = json.dumps(response['data'], indent=2)
    with open(f'out/{response["name"]}.json', 'w') as outfile:
      outfile.write(json_data)


def build_csv(data: list):
  """ Builds csv from fetched data and saves it to out folder """
  for response in data:
    df = pd.DataFrame.from_dict(flatten_dict(response['data']))
    df.to_csv (f'out/{response["name"]}.csv', index = False, header=True)
