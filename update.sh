#!/bin/bash

LAST_DATE=$(cut -d ',' -f 1 <<< `tail -n 1 us-counties.csv`)
echo "Current date: $LAST_DATE"
echo "Fetching new data..."
wget https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties-recent.csv .
CHECK_DATE=$(cut -d ',' -f 1 <<< `tail -n 1 us-counties-recent.csv`)

echo "New data up to $CHECK_DATE"
TOTAL=$(cut -d ' ' -f 1 <<< `wc -l us-counties-recent.csv`)

if [ "$CHECK_DATE" == "$LAST_DATE" ]; then
    echo 'No update'
    rm us-counties-recent.csv
    exit 1
fi

COUNT=$(cut -d ':' -f 1 <<< `grep -n "$LAST_DATE" us-counties-recent.csv | tail -n 1`)

echo "Updating CSV data..."

echo '' >> us-counties.csv
tail -n $((TOTAL-COUNT+1)) us-counties-recent.csv >> us-counties.csv
rm us-counties-recent.csv
NEW_END_DATE=$(cut -d ',' -f 1 <<< `tail -n 1 us-counties.csv`)

echo "Updating JSON data..."
python extractor.py > js/data/covidbydate.js

echo "Updating operative end date..."
echo -e "const enddate = \"$NEW_END_DATE\"" > js/enddate.js

echo "Done"
