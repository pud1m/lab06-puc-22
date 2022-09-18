#!/bin/bash

read -p "Gerar relatório em CSV ou JSON: " flag
pip install -r requirements.txt
python3 main.py --output="$flag"

echo "relatório $flag gerado!"

npm install
npm run dev

echo "relatório $flag gerado!"