#!/bin/bash
# make-dirs.sh
#
# This script creates all necessary directories for Docker to work properly

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

print_message "$GREEN" "Creating required directories for Docker..."

# Make sure the directory structure exists
mkdir -p docker/init-scripts
mkdir -p docker/nginx/ssl

# Move any init scripts to the right location if they're in the wrong place
if [ -f "./init-scripts/01-init.sql" ]; then
  print_message "$YELLOW" "Moving init scripts to the correct location..."
  cp -r ./init-scripts/* ./docker/init-scripts/
fi

# Make the initialization script executable
chmod +x docker/init.sh
chmod +x docker-run.sh

print_message "$GREEN" "Directory structure created successfully!"