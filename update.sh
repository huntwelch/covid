#!/bin/bash

LAST_DATE=$(cut -d ',' -f 1 <<< `tail -n 1 us-counties.csv`)
wget https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties-recent.csv .
CHECK_DATE=$(cut -d ',' -f 1 <<< `tail -n 1 us-counties-recent.csv`)
TOTAL=$(cut -d ' ' -f 1 <<< `wc -l us-counties-recent.csv`)

if [ "$CHECK_DATE" == "$LAST_DATE" ]; then
    echo 'No update'
    exit 1
fi

while true
do
    NEW_DATE=$(cut -d ',' -f 1 <<< `head -n $TOTAL us-counties-recent.csv | tail -n 1`)
    if [ "$NEW_DATE" == "$LAST_DATE" ]; then
        break
    fi
    TOTAL=$((TOTAL-1))
    echo -n '.'
done

head -n $((TOTAL+1)) us-counties-recent.csv >> us-counties.csv
NEW_END_DATE=$(cut -d ',' -f 1 <<< `tail -n 1 us-counties.csv`)

echo -e "const enddate=$NEW_END_DATE\nexport default enddate" > js/enddate.js
