#!/bin/bash
# Create the log directory and log file

mkdir -p /logs

yarn migration:run
yarn db:seed

node dist/main.js