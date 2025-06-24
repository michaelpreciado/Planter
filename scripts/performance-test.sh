#!/bin/bash

# Performance Testing Script for Plant Tracker
# Tests against aggressive performance budget

set -e

echo "🚀 Starting Performance Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PORT=3000
BUILD_DIR=".next"
REPORTS_DIR="./lighthouse-reports"
BUDGET_FILE="./performance-budget.json"

# Create reports directory
mkdir -p "$REPORTS_DIR"

echo "📊 Performance Budget Targets:"
echo "- FCP: ≤ 1.0s"
echo "- LCP: ≤ 2.0s" 
echo "- CLS: ≤ 0.1"
echo "- TBT: ≤ 150ms"
echo "- Bundle: ≤ 300kB JS, ≤ 50kB CSS"
echo ""

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Start the server in background
echo "🚀 Starting production server..."
npm run start &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
for i in {1..30}; do
    if curl -s "http://localhost:$PORT" > /dev/null; then
        echo -e "${GREEN}✅ Server is ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Server failed to start${NC}"
        kill $SERVER_PID
        exit 1
    fi
done

# Function to run Lighthouse audit
run_lighthouse() {
    local url=$1
    local page_name=$2
    local output_file="$REPORTS_DIR/${page_name}-$(date +%Y%m%d-%H%M%S)"
    
    echo "🔍 Testing $page_name ($url)..."
    
    # Run Lighthouse with mobile simulation
    lighthouse "$url" \
        --output=json \
        --output=html \
        --output-path="$output_file" \
        --form-factor=mobile \
        --throttling-method=simulate \
        --throttling.rttMs=150 \
        --throttling.throughputKbps=1638.4 \
        --throttling.cpuSlowdownMultiplier=4 \
        --emulated-form-factor=mobile \
        --chrome-flags="--headless --no-sandbox --disable-gpu" \
        --budget-path="$BUDGET_FILE" \
        --max-wait-for-load=45000 \
        --skip-audits=uses-rel-preconnect \
        --quiet
    
    # Extract key metrics from JSON report
    local json_file="${output_file}.report.json"
    if [ -f "$json_file" ]; then
        local fcp=$(jq -r '.audits["first-contentful-paint"].numericValue' "$json_file")
        local lcp=$(jq -r '.audits["largest-contentful-paint"].numericValue' "$json_file")
        local cls=$(jq -r '.audits["cumulative-layout-shift"].numericValue' "$json_file")
        local tbt=$(jq -r '.audits["total-blocking-time"].numericValue' "$json_file")
        local performance=$(jq -r '.categories.performance.score' "$json_file")
        
        echo "  📈 Metrics:"
        echo "    FCP: ${fcp}ms (target: ≤1000ms)"
        echo "    LCP: ${lcp}ms (target: ≤2000ms)"
        echo "    CLS: $cls (target: ≤0.1)"
        echo "    TBT: ${tbt}ms (target: ≤150ms)"
        echo "    Performance Score: $(echo "$performance * 100" | bc -l | cut -d. -f1)% (target: ≥95%)"
        
        # Check if targets are met
        local failed=0
        if (( $(echo "$fcp > 1000" | bc -l) )); then
            echo -e "    ${RED}❌ FCP failed target${NC}"
            failed=1
        fi
        if (( $(echo "$lcp > 2000" | bc -l) )); then
            echo -e "    ${RED}❌ LCP failed target${NC}"
            failed=1
        fi
        if (( $(echo "$cls > 0.1" | bc -l) )); then
            echo -e "    ${RED}❌ CLS failed target${NC}"
            failed=1
        fi
        if (( $(echo "$tbt > 150" | bc -l) )); then
            echo -e "    ${RED}❌ TBT failed target${NC}"
            failed=1
        fi
        if (( $(echo "$performance < 0.95" | bc -l) )); then
            echo -e "    ${RED}❌ Performance score failed target${NC}"
            failed=1
        fi
        
        if [ $failed -eq 0 ]; then
            echo -e "    ${GREEN}✅ All targets met!${NC}"
        fi
        
        return $failed
    else
        echo -e "    ${RED}❌ Failed to generate report${NC}"
        return 1
    fi
}

# Test critical pages
OVERALL_RESULT=0

echo ""
echo "🧪 Running Lighthouse audits..."

# Home page
if ! run_lighthouse "http://localhost:$PORT/" "homepage"; then
    OVERALL_RESULT=1
fi

# Plant list
if ! run_lighthouse "http://localhost:$PORT/list" "plant-list"; then
    OVERALL_RESULT=1
fi

# Add plant
if ! run_lighthouse "http://localhost:$PORT/add-plant" "add-plant"; then
    OVERALL_RESULT=1
fi

# Settings
if ! run_lighthouse "http://localhost:$PORT/settings" "settings"; then
    OVERALL_RESULT=1
fi

# Bundle analysis
echo ""
echo "📦 Analyzing bundle size..."
npm run analyze 2>/dev/null || echo "⚠️ Bundle analyzer not available"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true

# Final results
echo ""
echo "📋 Test Summary:"
echo "Reports saved to: $REPORTS_DIR"

if [ $OVERALL_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 All performance targets met!${NC}"
    echo -e "${GREEN}Ready for production deployment${NC}"
else
    echo -e "${RED}❌ Some performance targets failed${NC}"
    echo -e "${YELLOW}Check reports for detailed analysis${NC}"
fi

exit $OVERALL_RESULT 