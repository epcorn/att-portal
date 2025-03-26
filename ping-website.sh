#!/bin/bash

# Set the URL of your website
WEBSITE_URL="https://att-quotation.onrender.com/api/v1/contract/automated/reports/r1"
echo "URL: $WEBSITE_URL"

# Ping the website
PING_RESULT=$(curl --write-out '%{http_code}' --silent --output /dev/null "$WEBSITE_URL")

# Check the response code
if [ "$PING_RESULT" -eq 200 ]; then
    echo "Website is up and running!"
else
    echo "Error: Website is down or not responding correctly. Response code: $PING_RESULT"
fi