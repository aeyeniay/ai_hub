#!/usr/bin/env python3
import csv
import json

# CSV'yi oku
data = []
with open('tested.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Boş değerleri temizle ve sayısal değerleri dönüştür
        clean_row = {}
        for key, value in row.items():
            if value == '':
                clean_row[key] = None
            elif key in ['PassengerId', 'Survived', 'Pclass', 'SibSp', 'Parch']:
                clean_row[key] = int(value) if value else None
            elif key in ['Age', 'Fare']:
                try:
                    clean_row[key] = float(value) if value else None
                except:
                    clean_row[key] = None
            else:
                clean_row[key] = value
        data.append(clean_row)

# JSON olarak kaydet
output = {
    "table_data": data,
    "max_charts": 5
}

with open('test_chart_full.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✅ {len(data)} satır CSV'den JSON'a çevrildi: test_chart_full.json")



