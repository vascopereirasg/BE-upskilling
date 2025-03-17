#!/bin/bash

# This script tests the JWT authentication flow using curl
# Run with: bash test-jwt.sh

# API base URL
API_URL="http://localhost:3000/api"

# Test user credentials
EMAIL="test@example.com"
PASSWORD="password123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting JWT authentication test...${NC}"

# Step 1: Login
echo -e "\n${BLUE}1. Testing login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract tokens
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | sed 's/"refreshToken":"//')

if [ -z "$ACCESS_TOKEN" ] || [ -z "$REFRESH_TOKEN" ]; then
  echo -e "${RED}Login failed!${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
else
  echo -e "${GREEN}Login successful!${NC}"
  echo "Access Token: ${ACCESS_TOKEN:0:20}..."
  echo "Refresh Token: ${REFRESH_TOKEN:0:20}..."
fi

# Step 2: Access protected route
echo -e "\n${BLUE}2. Testing protected route access...${NC}"
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$ME_RESPONSE" | grep -q "error"; then
  echo -e "${RED}Protected route access failed!${NC}"
  echo "Response: $ME_RESPONSE"
  exit 1
else
  echo -e "${GREEN}Protected route access successful!${NC}"
  echo "User profile: $ME_RESPONSE"
fi

# Step 3: Refresh token
echo -e "\n${BLUE}3. Testing token refresh...${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$NEW_ACCESS_TOKEN" ]; then
  echo -e "${RED}Token refresh failed!${NC}"
  echo "Response: $REFRESH_RESPONSE"
  exit 1
else
  echo -e "${GREEN}Token refresh successful!${NC}"
  echo "New access token: ${NEW_ACCESS_TOKEN:0:20}..."
fi

# Step 4: Test with new access token
echo -e "\n${BLUE}4. Testing protected route with new access token...${NC}"
ME_RESPONSE2=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

if echo "$ME_RESPONSE2" | grep -q "error"; then
  echo -e "${RED}Protected route access with new token failed!${NC}"
  echo "Response: $ME_RESPONSE2"
  exit 1
else
  echo -e "${GREEN}Protected route access with new token successful!${NC}"
  echo "User profile: $ME_RESPONSE2"
fi

# Step 5: Logout
echo -e "\n${BLUE}5. Testing logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

if echo "$LOGOUT_RESPONSE" | grep -q "error"; then
  echo -e "${RED}Logout failed!${NC}"
  echo "Response: $LOGOUT_RESPONSE"
  exit 1
else
  echo -e "${GREEN}Logout successful!${NC}"
  echo "Response: $LOGOUT_RESPONSE"
fi

# Step 6: Try to use refresh token after logout (should fail)
echo -e "\n${BLUE}6. Testing refresh token after logout (should fail)...${NC}"
REFRESH_AFTER_LOGOUT=$(curl -s -X POST "$API_URL/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

if echo "$REFRESH_AFTER_LOGOUT" | grep -q "error"; then
  echo -e "${GREEN}Success: Refresh token was invalidated after logout${NC}"
  echo "Response: $REFRESH_AFTER_LOGOUT"
else
  echo -e "${RED}ERROR: Refresh token still works after logout!${NC}"
  echo "Response: $REFRESH_AFTER_LOGOUT"
  exit 1
fi

echo -e "\n${GREEN}JWT authentication test completed successfully!${NC}"

