#!/bin/bash
# Comprehensive Performance Testing Script
# Plant Tracker - Post-Optimization Verification

set -e

echo "🚀 Starting comprehensive performance audit..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
URL="http://localhost:3000"
MOBILE_URL="$URL"
DESKTOP_URL="$URL"

# Create reports directory
mkdir -p lighthouse-reports
mkdir -p bundle-analysis

echo "📦 Step 1: Bundle Analysis"
echo "Analyzing bundle size..."
ANALYZE=true npm run build 2>&1 | tee bundle-analysis/build-output.log

echo ""
echo "📱 Step 2: Mobile Performance (4G)"
echo "Testing FCP, LCP, CLS targets..."
lighthouse $MOBILE_URL \
  --chrome-flags="--headless" \
  --preset=perf \
  --budget-path=./performance-budget.json \
  --output=html,json \
  --output-path=./lighthouse-reports/mobile-perf \
  --throttling-method=simulate \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1638.4 \
  --throttling.cpuSlowdownMultiplier=4 \
  --emulated-form-factor=mobile \
  --max-wait-for-load=45000

echo ""
echo "💻 Step 3: Desktop Performance"
echo "Testing desktop metrics..."
lighthouse $DESKTOP_URL \
  --chrome-flags="--headless" \
  --preset=perf \
  --output=html,json \
  --output-path=./lighthouse-reports/desktop-perf \
  --emulated-form-factor=desktop \
  --throttling-method=simulate \
  --throttling.rttMs=40 \
  --throttling.throughputKbps=10240 \
  --throttling.cpuSlowdownMultiplier=1

echo ""
echo "♿ Step 4: Accessibility Audit"
lighthouse $URL \
  --chrome-flags="--headless" \
  --only-categories=accessibility \
  --output=html \
  --output-path=./lighthouse-reports/accessibility

echo ""
echo "🔍 Step 5: SEO & Best Practices"
lighthouse $URL \
  --chrome-flags="--headless" \
  --only-categories=seo,best-practices \
  --output=html \
  --output-path=./lighthouse-reports/seo-best-practices

echo ""
echo "📊 Step 6: Key Pages Analysis"
echo "Testing critical user journeys..."

# Test key pages
PAGES=("/" "/list" "/add-plant" "/settings")
for page in "${PAGES[@]}"; do
  echo "Testing $page..."
  lighthouse "$URL$page" \
    --chrome-flags="--headless" \
    --preset=perf \
    --output=json \
    --output-path="./lighthouse-reports/page-$(echo $page | tr '/' '-')" \
    --quiet
done

echo ""
echo "🧮 Step 7: Core Web Vitals Summary"
echo "Extracting key metrics..."

# Parse JSON reports and extract key metrics
node -e "
const fs = require('fs');
const reports = ['mobile-perf', 'desktop-perf'];

console.log('\\n📈 CORE WEB VITALS SUMMARY');
console.log('================================');

reports.forEach(report => {
  try {
    const data = JSON.parse(fs.readFileSync(\`lighthouse-reports/\${report}.report.json\`, 'utf8'));
    const audits = data.audits;
    
    console.log(\`\\n\${report.toUpperCase()} RESULTS:\`);
    console.log(\`FCP: \${Math.round(audits['first-contentful-paint'].numericValue)}ms (target: <1000ms)\`);
    console.log(\`LCP: \${Math.round(audits['largest-contentful-paint'].numericValue)}ms (target: <2000ms)\`);
    console.log(\`CLS: \${audits['cumulative-layout-shift'].numericValue.toFixed(3)} (target: <0.1)\`);
    console.log(\`TBT: \${Math.round(audits['total-blocking-time'].numericValue)}ms (target: <150ms)\`);
    console.log(\`Speed Index: \${Math.round(audits['speed-index'].numericValue)}ms (target: <2500ms)\`);
    
    // Performance score
    const perfScore = Math.round(data.categories.performance.score * 100);
    console.log(\`Performance Score: \${perfScore}/100\`);
    
    // Bundle size check
    if (audits['unused-javascript']) {
      console.log(\`Unused JS: \${Math.round(audits['unused-javascript'].numericValue / 1024)}kB\`);
    }
    if (audits['unused-css-rules']) {
      console.log(\`Unused CSS: \${Math.round(audits['unused-css-rules'].numericValue / 1024)}kB\`);
    }
  } catch (e) {
    console.log(\`Error parsing \${report}: \${e.message}\`);
  }
});
"

echo ""
echo "🎯 Step 8: Target Validation"
echo "Checking against performance targets..."

# Validate against targets
node -e "
const fs = require('fs');
try {
  const mobileData = JSON.parse(fs.readFileSync('lighthouse-reports/mobile-perf.report.json', 'utf8'));
  const audits = mobileData.audits;
  
  const fcp = audits['first-contentful-paint'].numericValue;
  const lcp = audits['largest-contentful-paint'].numericValue;
  const cls = audits['cumulative-layout-shift'].numericValue;
  const tbt = audits['total-blocking-time'].numericValue;
  
  console.log('\\n🎯 TARGET VALIDATION:');
  console.log('====================');
  console.log(\`FCP: \${fcp < 1000 ? '✅' : '❌'} \${Math.round(fcp)}ms (target: <1000ms)\`);
  console.log(\`LCP: \${lcp < 2000 ? '✅' : '❌'} \${Math.round(lcp)}ms (target: <2000ms)\`);
  console.log(\`CLS: \${cls < 0.1 ? '✅' : '❌'} \${cls.toFixed(3)} (target: <0.1)\`);
  console.log(\`TBT: \${tbt < 150 ? '✅' : '❌'} \${Math.round(tbt)}ms (target: <150ms)\`);
  
  const perfScore = Math.round(mobileData.categories.performance.score * 100);
  console.log(\`Performance Score: \${perfScore >= 95 ? '✅' : '❌'} \${perfScore}/100 (target: ≥95)\`);
} catch (e) {
  console.log('Error validating targets:', e.message);
}
"

echo ""
echo "📈 Step 9: Bundle Size Analysis"
if [ -f ".next/analyze/client.html" ]; then
  echo "Bundle analyzer report generated at .next/analyze/client.html"
  echo "Key findings:"
  node -e "
  const fs = require('fs');
  try {
    const buildLog = fs.readFileSync('bundle-analysis/build-output.log', 'utf8');
    const gzipMatch = buildLog.match(/(\d+(?:\.\d+)?)\s*kB.*?gzipped/i);
    if (gzipMatch) {
      const gzipSize = parseFloat(gzipMatch[1]);
      console.log(\`Total JS (gzipped): \${gzipSize}kB\`);
      console.log(\`Bundle reduction: \${gzipSize < 200 ? '✅' : '❌'} (target: <200kB)\`);
    }
  } catch (e) {
    console.log('Could not parse build output');
  }
  "
fi

echo ""
echo "🏁 Performance Audit Complete!"
echo "=================================="
echo "📋 Reports generated in lighthouse-reports/"
echo "📊 Open lighthouse-reports/mobile-perf.report.html to view detailed results"
echo ""
echo "🎉 Next steps:"
echo "   1. Review Core Web Vitals scores above"
echo "   2. Check bundle analyzer for optimization opportunities"
echo "   3. Deploy and test on real devices"
echo "   4. Monitor with Real User Monitoring (RUM)"
echo "" 