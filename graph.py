from datetime import date, datetime
import pandas as pd
from matplotlib import pyplot as plt
import seaborn as sns

def get_age(initial_date):
  """ Returns age (in days) based on date supplied. """
  initial_date = datetime.strptime(initial_date.split('T')[0], '%Y-%m-%d').date()
  today = date.today()
  return (today - initial_date).days

def get_issue_ratio(total_issues, closed_issues):
  """ Returns ratio of closed issues to total issues. """
  return closed_issues['totalCount'] / total_issues['totalCount']

def flatten_total_value(total_obj):
  """ Flattens a total value """
  try:
    value = total_obj['totalCount']
  except KeyError:
    value = 0
  return value

def flatten_primary_lang(pl):
  """ Flattens primary_lang """
  if pl is None:
    return ''
  try:
    value = pl['name']
  except KeyError:
    value = ''
  return value

if __name__ == '__main__':
  print('init graph')
  
  # Reading JSON
  df = pd.read_json('out/lab1.json')

  # Filling missing values
  df['total_issues_flat'] = df['totalIssues'].apply(flatten_total_value)
  df['closed_issues_flat'] = df['closedIssues'].apply(flatten_total_value)
  df['merged_prs_flat'] = df['mergedPRs'].apply(flatten_total_value)
  df['releases_flat'] = df['releases'].apply(flatten_total_value)
  df['primary_lang_flat'] = df['primaryLanguage'].apply(flatten_primary_lang)

  # Defining repositories age based on createdAt
  df['age'] = df['createdAt'].apply(get_age)
  # Defining time since last update based on updatedAt
  df['last_update'] = df['updatedAt'].apply(get_age)
  # Defining closed issue ratio based on closed issues and total issues
  closed_issues = df['closed_issues_flat']
  total_issues = df['total_issues_flat']
  df['closed_issue_ratio'] = closed_issues.corr(total_issues)
  
  RQ1 = df['age']
  RQ2 = df['merged_prs_flat']
  RQ3 = df['releases_flat']
  RQ4 = df['last_update']
  RQ5 = df['primary_lang_flat']
  RQ6 = df['closed_issue_ratio']


  sns.boxplot(x=RQ1)
  plt.show()
