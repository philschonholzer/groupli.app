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

# Helper function to ensure Playwright browsers are installed
ensure_playwright_browsers() {
	echo ""
	echo -e "${BLUE}🎭 Checking Playwright browsers...${NC}"
	echo ""

	# Install Playwright browsers (only Chromium to save resources)
	# Skip if using Nix-provided browsers
	if [[ "$PLAYWRIGHT_BROWSERS_PATH" == /nix/store/* ]]; then
		echo "✓ Using Nix-provided Playwright browsers, skipping installation..."
	else
		echo "🎭 Installing Playwright browsers..."
		pnpm exec playwright install --with-deps chromium
	fi
	
	echo ""
	echo -e "${GREEN}✅ Playwright browsers ready${NC}"
	echo ""
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

# 3. Unit tests (skip in Docker if SKIP_UNIT_TESTS is set)
if [ "$SKIP_UNIT_TESTS" != "true" ]; then
	run_step "Unit tests" "npm run test"
else
	echo ""
	echo -e "${YELLOW}⏭️  Skipping unit tests (SKIP_UNIT_TESTS=true)${NC}"
	echo ""
fi

# 4. Build
echo ""
echo -e "${BLUE}📦 Building production bundle${NC}"
echo ""
run_step "Production build" "npm run build"

# 5. E2E tests (skip in Docker if SKIP_E2E_TESTS is set)
if [ "$SKIP_E2E_TESTS" != "true" ]; then
	# Ensure Playwright browsers are installed
	ensure_playwright_browsers
	
	# Seed database for E2E tests
	run_step "Seeding database for E2E tests" "npm run seed:e2e"
	
	run_step "E2E tests" "npm run playwright"
	
	# Clean up Playwright browsers after tests to save 1.5GB in Docker image
	# Skip if using Nix-provided browsers (they're in /nix/store, not in cache)
	if [[ "$PLAYWRIGHT_BROWSERS_PATH" == /nix/store/* ]]; then
		echo ""
		echo -e "${BLUE}ℹ️  Using Nix-provided browsers, skipping cache cleanup${NC}"
		echo ""
	else
		echo ""
		echo -e "${BLUE}🧹 Cleaning up Playwright browsers (saves 1.5GB)...${NC}"
		# Use PLAYWRIGHT_BROWSERS_PATH if set, otherwise default cache locations
		if [ -n "$PLAYWRIGHT_BROWSERS_PATH" ]; then
			echo "   Removing: $PLAYWRIGHT_BROWSERS_PATH"
			rm -rf "$PLAYWRIGHT_BROWSERS_PATH" || true
		else
			echo "   Removing: ~/.cache/ms-playwright and /root/.cache/ms-playwright"
			rm -rf ~/.cache/ms-playwright || true
			rm -rf /root/.cache/ms-playwright || true
		fi
		echo -e "${GREEN}✅ Playwright browsers removed${NC}"
		echo ""
	fi
else
	echo ""
	echo -e "${YELLOW}⏭️  Skipping E2E tests (SKIP_E2E_TESTS=true)${NC}"
	echo ""
fi

echo "============================================================"
echo ""
echo -e "${GREEN}🎉 CI Pipeline Complete - All checks passed!${NC}"
echo ""
