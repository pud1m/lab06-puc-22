import os
import requests
import json


API_URL = 'https://api.github.com/graphql'

def get_token():
  """" Returns github personal access token """
  with open(os.path.join('', '.token'), 'r') as f:
    token = f.read()
  return token


def get_queries():
  """ Returns an array of graphql queries """
  query_list = []
  for filename in os.listdir('queries'):
    with open(os.path.join('queries', filename), 'r') as f:
      query = f.read()
      query_list.append({
        'query': query,
        'name': filename.replace('.graphql', '')
      })
  return query_list


def fetch_data():
  """ Fetches data from github api """
  queries = get_queries()
  data = []
  for query in queries:
    response = requests.post(API_URL, json={'query': query['query']}, headers={'Authorization': 'Bearer ' + get_token()})
    data.append({
      'name': query['name'],
      'data': response.json()
    })
  return data


def build_json(data: list):
  """ Builds json from fetched data and saves it to out folder """
  for response in data:
    json_data = json.dumps(response['data'], indent=2)
    with open(f'out/{response["name"]}.json', 'w') as outfile:
      outfile.write(json_data)

if __name__ == '__main__':
  raw_query_data = fetch_data()
  build_json(raw_query_data)
  print('Done')