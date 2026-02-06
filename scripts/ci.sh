#!/usr/bin/env bash
set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cleanup function to kill any running servers
cleanup() {
	echo ""
	echo -e "${BLUE}🧹 Cleaning up...${NC}"
	# Kill any Next.js servers on port 3000 (only if lsof is available)
	if command -v lsof >/dev/null 2>&1; then
		lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	fi
	# Kill any playwright processes (only if pkill is available)
	if command -v pkill >/dev/null 2>&1; then
		pkill -f "playwright" 2>/dev/null || true
	fi
	echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Register cleanup function to run on script exit (success or failure)
trap cleanup EXIT

# Environment variables for CI
export DB_URL="data.sqlite"
export OTLP_URL="http://localhost:4318/v1/traces"
export CI="true"

# Helper function to run commands with nice output
run_step() {
	local description="$1"
	local command="$2"

	echo ""
	echo -e "${BLUE}📋 ${description}${NC}"
	echo "   Running: ${command}"
	echo ""

	if eval "$command"; then
		echo -e "${GREEN}✅ ${description} - PASSED${NC}"
		echo ""
	else
		echo -e "${RED}❌ ${description} - FAILED${NC}"
		echo ""
		exit 1
	fi
}

echo -e "${BLUE}🚀 Starting CI Pipeline${NC}"
echo ""
echo "============================================================"

# 1. Linting
# run_step "Linting" "npm run lint"

# 2. Type checking (skip in Docker if SKIP_TYPE_CHECK is set)
if [ "$SKIP_TYPE_CHECK" != "true" ]; then
	run_step "Type checking" "npm run check"
else
	echo ""
	echo -e "${YELLOW}⏭️  Skipping type checking (SKIP_TYPE_CHECK=true)${NC}"
	echo ""
fi

# 3. Unit tests
run_step "Unit tests" "npm run test"

# 4. Build
echo ""
echo -e "${BLUE}📦 Building production bundle${NC}"
echo ""
run_step "Production build" "npm run build"

# 5. Seed database for e2e tests
echo ""
echo -e "${YELLOW}🌱 Seeding database for e2e tests...${NC}"
npm run seed:e2e
echo ""

# 6. E2E tests
run_step "E2E tests" "npm run playwright"

echo "============================================================"
echo ""
echo -e "${GREEN}🎉 CI Pipeline Complete - All checks passed!${NC}"
echo ""
