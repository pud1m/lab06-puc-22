import requests
from .utils import get_token, get_queries

API_URL = 'https://api.github.com/graphql'

def api_call(query: str):
  """ Fetches data from github api """
  response = requests.post(API_URL, json={'query': query['query']}, headers={'Authorization': 'Bearer ' + get_token()})
  return {
    'name': query['name'],
    'data': response.json()['data']['search']
  }


def get_paginated(
  max_value: int,
  total_count: int,
  page_size: int,
  cursor: str,
  query: str,
  result: dict
  ) -> dict:
  """ Makes GraphQL queries that are paginated """
  if total_count >= max_value:
    return result

  print(f'Query for cursor {cursor}')
  
  edited_query = {
    'query': None,
    'name': query['name']
  }
  cursor_text = 'null' if cursor is None else f'"{cursor}"'

  edited_query['query'] = query['query'].replace('$first', str(page_size))
  edited_query['query'] = edited_query['query'].replace('$after', cursor_text)
  response = api_call(edited_query)
  initial_results = result.get('data', [])
  result['data'] = initial_results + response['data']['nodes']

  if not response['data']['pageInfo']['hasNextPage']:
    return result

  return get_paginated(
    max_value = max_value,
    total_count = total_count + page_size,
    page_size = page_size,
    cursor = response['data']['pageInfo']['endCursor'],
    query = query,
    result = result
  )


def fetch_data(page_size: int = 100, max_value: int = 100):
  """ Entrypoint fetch function """
  queries = get_queries()
  data = []
  for query in queries:
    print(f'### Fetching data for {query["name"]}')
    result = get_paginated(
      max_value = max_value,
      total_count = 0,
      page_size = page_size,
      cursor = None,
      query = query,
      result = {
        'name': query['name'],
      }
    )
    data.append(result)
  return data
