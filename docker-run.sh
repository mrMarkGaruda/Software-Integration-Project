#!/bin/bash

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

# Check if environment argument is provided
if [ -z "$1" ]; then
  print_message "$RED" "Please specify an environment: dev, release, pprod, or prod"
  print_message "$YELLOW" "Usage: ./docker-run.sh <environment> [operation]"
  print_message "$YELLOW" "Examples:"
  print_message "$YELLOW" "  ./docker-run.sh dev up     # Start development environment"
  print_message "$YELLOW" "  ./docker-run.sh prod down  # Stop production environment"
  exit 1
fi

# Set environment and operation
ENV=$1
OPERATION=${2:-up -d}  # Default operation is "up -d"

# Validate environment
if [[ ! "$ENV" =~ ^(dev|release|pprod|prod)$ ]]; then
  print_message "$RED" "Invalid environment: $ENV"
  print_message "$YELLOW" "Valid environments are: dev, release, pprod, or prod"
  exit 1
fi

# Map environment to docker-compose file
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

# Check if the docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  print_message "$RED" "Docker Compose file not found: $COMPOSE_FILE"
  exit 1
fi

# Check if the environment file exists
if [ ! -f "$ENV_FILE" ]; then
  print_message "$YELLOW" "Warning: Environment file not found: $ENV_FILE"
  
  # Create a minimal environment file if it doesn't exist
  if [[ "$OPERATION" == *"up"* ]]; then
    print_message "$YELLOW" "Creating a minimal $ENV_FILE file..."
    touch "$ENV_FILE"
  fi
fi

# Make sure script is executable
chmod +x docker-run.sh

# Execute docker-compose command
print_message "$GREEN" "Running docker-compose -f $COMPOSE_FILE $OPERATION with $ENV environment..."

# Run the docker-compose command with the environment file
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE $OPERATION

# Check the exit status
if [ $? -eq 0 ]; then
  print_message "$GREEN" "Docker operation completed successfully!"
else
  print_message "$RED" "Docker operation failed!"
fi