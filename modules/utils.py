import os
import json
import csv
from collections.abc import MutableMapping
import pandas as pd

def flatten_dict(d: MutableMapping, sep: str= '.') -> MutableMapping:
  """ Flattens a dictionary.
    Ref: https://www.freecodecamp.org/news/how-to-flatten-a-dictionary-in-python-in-4-different-ways/
  """
  [flat_dict] = pd.json_normalize(d, sep=sep).to_dict(orient='records')
  return flat_dict

def get_token():
  """" Returns github personal access token """
  with open(os.path.join('', '.token'), 'r') as f:
    token = f.read()
  return token


def get_queries():
  """ Returns an array of graphql queries """
  query_list = []
  for filename in os.listdir('queries'):
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
