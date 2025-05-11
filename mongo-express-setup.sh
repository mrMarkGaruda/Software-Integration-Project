#!/bin/bash
# mongo-express-setup.sh
#
# This script properly sets up mongo-express for different environments

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

# Environment defaults to dev if not specified
ENV=${1:-dev}

# Validate environment
if [[ ! "$ENV" =~ ^(dev|release|pprod|prod)$ ]]; then
  print_message "$RED" "Invalid environment: $ENV"
  print_message "$YELLOW" "Valid environments are: dev, release, pprod, or prod"
  exit 1
fi

print_message "$GREEN" "Setting up MongoDB Express for $ENV environment..."

# Map environment to docker-compose file and env file
case $ENV in
  dev)
    COMPOSE_FILE="docker-compose.dev.yml"
    ENV_FILE=".env.development"
    ;;
  release)
    COMPOSE_FILE="docker-compose.release.yml"
    ENV_FILE=".env.release"
    ;;
  pprod)
    COMPOSE_FILE="docker-compose.pprod.yml"
    ENV_FILE=".env.pprod"
    ;;
  prod)
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.production"
    ;;
esac

# Ensure MongoDB Express container is running
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE ps mongo-express > /dev/null 2>&1
if [ $? -ne 0 ]; then
  print_message "$YELLOW" "MongoDB Express is not running. Starting it..."
  docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d mongo-express
fi

# Get the container ID
CONTAINER_ID=$(docker compose -f $COMPOSE_FILE --env-file $ENV_FILE ps -q mongo-express)

if [ -z "$CONTAINER_ID" ]; then
  print_message "$RED" "Failed to get MongoDB Express container ID"
  exit 1
fi

print_message "$GREEN" "MongoDB Express is set up and running!"

# Display access information
case $ENV in
  dev|release)
    print_message "$GREEN" "Access MongoDB Express at: http://localhost:8081"
    print_message "$GREEN" "Username: admin"
    print_message "$YELLOW" "Password: Check your $ENV_FILE file for ME_CONFIG_BASICAUTH_PASSWORD"
    ;;
  pprod)
    print_message "$GREEN" "Access MongoDB Express at: http://localhost:8081"
    print_message "$GREEN" "Username: admin"
    print_message "$YELLOW" "Password: Check your $ENV_FILE file for ME_CONFIG_BASICAUTH_PASSWORD (default: pprod_admin)"
    ;;
  prod)
    print_message "$GREEN" "Access MongoDB Express at: https://your-domain/mongo-admin/"
    print_message "$GREEN" "This instance is secured behind nginx with basic auth"
    print_message "$YELLOW" "Check your $ENV_FILE file for credentials"
    ;;
esac