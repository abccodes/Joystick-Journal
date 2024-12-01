#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR=$(dirname "$0")

# MySQL connection details
DB_HOST="${DB_HOST:-127.0.0.1}"         # Default host: localhost
DB_USER="${DB_USER:-root}"              # Default user: root
DB_PASSWORD="${DB_PASSWORD:-}"          # Default password: empty
DB_NAME="${DB_NAME:-ratings_dev_db}"    # Default database name: ratings_dev_db
SQL_FILE="$SCRIPT_DIR/DB.sql"           # SQL file to be executed

# Check if the SQL file exists
if [ ! -f "$SQL_FILE" ]; then
  echo "Error: SQL file '$SQL_FILE' not found!"
  exit 1
fi

# Run the SQL file
echo "Setting up the database..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" "$DB_NAME" < "$SQL_FILE"

if [ $? -eq 0 ]; then
  echo "Database setup completed successfully."
else
  echo "Error during database setup."
  exit 1
fi
