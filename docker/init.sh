#!/bin/bash
# docker/init.sh
#
# This script initializes the docker environment for first-time setup

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  print_message "$RED" "Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
  print_message "$YELLOW" "Docker Compose V2 not found. Checking for docker-compose..."
  if ! command -v docker-compose &> /dev/null; then
    print_message "$RED" "Neither Docker Compose V2 nor docker-compose is installed. Please install Docker Compose first."
    exit 1
  fi
fi

# Ensure scripts are executable
print_message "$GREEN" "Making scripts executable..."
chmod +x docker-run.sh
chmod +x docker/init-scripts/*.sh 2>/dev/null || true

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

# Create necessary directories
print_message "$GREEN" "Creating necessary directories..."
mkdir -p docker/init-scripts

# Check if directories for SSL certs need to be created (for prod)
if [ "$ENV" = "prod" ]; then
  mkdir -p docker/nginx/ssl
  
  # Generate self-signed certificates for development if they don't exist
  if [ ! -f docker/nginx/ssl/server.crt ]; then
    print_message "$YELLOW" "Generating self-signed SSL certificates for development..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout docker/nginx/ssl/server.key \
      -out docker/nginx/ssl/server.crt \
      -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
  fi
fi

# Check for environment file
if [ ! -f "$ENV_FILE" ]; then
  print_message "$YELLOW" "Environment file $ENV_FILE not found. Creating default file..."
  cp .env.$ENV .env || echo "# Default environment for $ENV" > .env
fi

# MongoDB Express setup
if [ "$ENV" = "prod" ]; then
  print_message "$GREEN" "Setting up MongoDB Express for production..."
  
  # Create .htpasswd file for Nginx if it doesn't exist
  if [ ! -f "docker/nginx/.htpasswd" ]; then
    print_message "$YELLOW" "Creating .htpasswd file for MongoDB Express authentication..."
    
    # Check if htpasswd utility is available
    if command -v htpasswd &> /dev/null; then
      # Get or create admin password
      MONGO_EXPRESS_PW=${ME_CONFIG_BASICAUTH_PASSWORD:-prod_admin_secure_password}
      htpasswd -bc docker/nginx/.htpasswd ${ME_CONFIG_BASICAUTH_USERNAME:-admin} $MONGO_EXPRESS_PW
    else
      print_message "$YELLOW" "htpasswd utility not found. Please run setup-htpasswd.sh manually."
      touch docker/nginx/.htpasswd  # Create empty file as placeholder
    fi
  fi
  
  print_message "$YELLOW" "For production, MongoDB Express needs additional setup."
  print_message "$YELLOW" "After starting the containers, run: ./setup-mongo-replica.sh"
fi

print_message "$GREEN" "Environment initialized successfully for $ENV!"
print_message "$GREEN" "You can now run: ./docker-run.sh $ENV up"

print_message "$GREEN" "Environment initialized successfully for $ENV!"
print_message "$GREEN" "You can now run: ./docker-run.sh $ENV up"