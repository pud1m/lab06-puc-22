import os
import json

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


def build_json(data: list):
  """ Builds json from fetched data and saves it to out folder """
  for response in data:
    json_data = json.dumps(response['data'], indent=2)
    with open(f'out/{response["name"]}.json', 'w') as outfile:
      outfile.write(json_data)
