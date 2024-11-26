#!/bin/bash

# Script to connect to the MySQL database and execute a SQL file for setting up the development database.

# Get the directory where the script is located
SCRIPT_DIR=$(dirname "$0")

# MySQL connection details (default values can be overridden with environment variables)
DB_HOST="${DB_HOST:-127.0.0.1}"         # Default host: localhost
DB_USER="${DB_USER:-root}"              # Default user: root
DB_PASSWORD="${DB_PASSWORD:-}"          # Default password: empty
DB_NAME="${DB_NAME:-ratings_dev_db}"    # Default database name: ratings_dev_db
SQL_FILE="$SCRIPT_DIR/DB.sql"           # SQL file to be executed, relative to this script's directory

# Check if the SQL file exists
if [ ! -f "$SQL_FILE" ]; then
  echo "Error: SQL file '$SQL_FILE' not found!"
  exit 1
fi

# Run the SQL file using the MySQL command-line client
echo "Running SQL file '$SQL_FILE' on database '$DB_NAME' at host '$DB_HOST'..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" "$DB_NAME" < "$SQL_FILE"

# Check the exit status of the MySQL command
if [ $? -eq 0 ]; then
  echo "Database setup completed successfully."
else
  echo "Error: An error occurred during database setup."
  exit 1
fi
