#!/bin/bash
set -e

# This script runs during PostgreSQL initialization
echo "Configuring PostgreSQL authentication..."

# Update pg_hba.conf to use md5 authentication
cat > /var/lib/postgresql/data/pg_hba.conf <<EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    all             all             0.0.0.0/0               md5
EOF

echo "PostgreSQL authentication configured successfully"
