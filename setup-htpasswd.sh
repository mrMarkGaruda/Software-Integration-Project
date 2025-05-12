#!/bin/bash
# setup-htpasswd.sh
#
# This script creates an .htpasswd file for nginx basic auth
# to secure MongoDB Express in production environment

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

# Create directory if it doesn't exist
mkdir -p docker/nginx

# Check if htpasswd utility is available
if ! command -v htpasswd &> /dev/null; then
  print_message "$YELLOW" "htpasswd utility not found. Installing apache2-utils..."
  
  # Check the OS and install appropriate package
  if command -v apt-get &> /dev/null; then
    sudo apt-get update && sudo apt-get install -y apache2-utils
  elif command -v yum &> /dev/null; then
    sudo yum install -y httpd-tools
  elif command -v apk &> /dev/null; then
    apk add --no-cache apache2-utils
  else
    print_message "$RED" "Could not install htpasswd utility. Please install it manually."
    exit 1
  fi
fi

# Get username (default from environment or use admin)
USERNAME=${ME_CONFIG_BASICAUTH_USERNAME:-admin}

# Prompt for password if not provided
if [ -z "$1" ]; then
  read -sp "Enter password for $USERNAME: " PASSWORD
  echo
else
  PASSWORD=$1
fi

# Create .htpasswd file
print_message "$GREEN" "Creating .htpasswd file with username $USERNAME..."
htpasswd -bc docker/nginx/.htpasswd $USERNAME $PASSWORD

print_message "$GREEN" ".htpasswd file created successfully at docker/nginx/.htpasswd"
print_message "$YELLOW" "Make sure to mount this file in your nginx container"
print_message "$YELLOW" "Add this to your docker-compose.prod.yml for the nginx service:"
print_message "$YELLOW" "  volumes:"
print_message "$YELLOW" "    - ./docker/nginx/.htpasswd:/etc/nginx/.htpasswd:ro"