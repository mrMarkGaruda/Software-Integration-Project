#!/bin/bash
# setup-mongo-replica.sh
#
# This script initializes MongoDB replica set for production environment

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print with colors
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

print_message "$GREEN" "Setting up MongoDB replica set for production..."

# Check if running in production environment
if [ ! -f ".env.production" ]; then
  print_message "$RED" "Error: .env.production file not found."
  print_message "$YELLOW" "This script should be run only in production environment."
  exit 1
fi

# Load environment variables
source .env.production

# Get MongoDB username and password from environment or use defaults
MONGO_USERNAME=${MONGO_USERNAME:-mongo_production_user}
MONGO_PASSWORD=${MONGO_PASSWORD:-prod_mongo_secure_pwd}

# Check if MongoDB containers are running
if ! docker compose -f docker-compose.prod.yml ps | grep -q "mongodb"; then
  print_message "$YELLOW" "MongoDB containers not running. Starting them..."
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d mongodb mongodb_backup
  
  # Wait for containers to start
  print_message "$YELLOW" "Waiting for MongoDB containers to start..."
  sleep 10
fi

# Create and execute JS script to initialize replica set
print_message "$GREEN" "Initializing replica set..."

cat > /tmp/init_replica.js << EOF
rs.status().ok || rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb:27017", priority: 2 },
    { _id: 1, host: "mongodb_backup:27018", priority: 1 }
  ]
});

// Wait for replica set to initialize
sleep(2000);

// Print status
printjson(rs.status());
EOF

# Execute the script in the MongoDB container
docker compose -f docker-compose.prod.yml exec -T mongodb mongosh \
  --username $MONGO_USERNAME \
  --password $MONGO_PASSWORD \
  --authenticationDatabase admin \
  --quiet /tmp/init_replica.js

# Check if initialization was successful
if [ $? -eq 0 ]; then
  print_message "$GREEN" "MongoDB replica set initialized successfully!"
else
  print_message "$RED" "Failed to initialize MongoDB replica set."
  print_message "$YELLOW" "Check if MongoDB is running and credentials are correct."
  exit 1
fi

# Create MongoDB Express user if needed
print_message "$GREEN" "Ensuring MongoDB Express user exists..."

cat > /tmp/create_mongo_express_user.js << EOF
db = db.getSiblingDB('admin');

// Check if user exists
var users = db.getUsers();
var userExists = false;
for (var i = 0; i < users.users.length; i++) {
  if (users.users[i].user === "${ME_CONFIG_BASICAUTH_USERNAME:-admin}") {
    userExists = true;
    break;
  }
}

// Create user if not exists
if (!userExists) {
  db.createUser({
    user: "${ME_CONFIG_BASICAUTH_USERNAME:-admin}",
    pwd: "${ME_CONFIG_BASICAUTH_PASSWORD:-prod_admin_secure_password}",
    roles: [{ role: "readAnyDatabase", db: "admin" }]
  });
  print("MongoDB Express user created successfully");
} else {
  print("MongoDB Express user already exists");
}
EOF

# Execute the script in the MongoDB container
docker compose -f docker-compose.prod.yml exec -T mongodb mongosh \
  --username $MONGO_USERNAME \
  --password $MONGO_PASSWORD \
  --authenticationDatabase admin \
  --quiet /tmp/create_mongo_express_user.js

print_message "$GREEN" "MongoDB replica set setup completed!"
print_message "$GREEN" "MongoDB Express should now be accessible through Nginx at https://your-domain/mongo-admin/"