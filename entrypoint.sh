#!/bin/bash
# Create the log directory and log file

mkdir -p /logs

node dist/cli.js migration validate
node dist/cli.js migration run
yarn db:seed

node dist/main.js