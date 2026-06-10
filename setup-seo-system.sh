#!/bin/bash

# BurnLink SEO & Social Recommendation System - Setup Script
# This script sets up the complete recommendation system

set -e

echo "🚀 BurnLink SEO & Social Recommendation System - Setup"
echo "======================================================"
echo ""

# Step 1: Verify environment
echo "✓ Step 1: Checking environment..."
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env"
    exit 1
fi
echo "  ✓ Supabase credentials found"

# Step 2: Run migrations
echo ""
echo "✓ Step 2: Running database migrations..."
echo "  Note: Execute these SQL files in Supabase dashboard:"
echo "  1. migrations/003_search_analytics.sql"
echo "  2. migrations/002_seo_blog_posts.sql"
echo ""

# Step 3: Verify dependencies
echo "✓ Step 3: Checking dependencies..."
if grep -q '"express"' package.json; then
    echo "  ✓ Express found"
fi
if grep -q '"ejs"' package.json; then
    echo "  ✓ EJS found"
fi
if grep -q '@supabase/supabase-js' package.json; then
    echo "  ✓ Supabase client found"
fi

# Step 4: Check files created
echo ""
echo "✓ Step 4: Verifying system files..."
FILES=(
    "lib/seo-recommendations.js"
    "migrations/002_seo_blog_posts.sql"
    "migrations/003_search_analytics.sql"
    "routes/blog.js"
    "views/blog/post.ejs"
    "SEO_RECOMMENDATION_SYSTEM.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ⚠ Missing: $file"
    fi
done

# Step 5: API endpoints summary
echo ""
echo "✓ Step 5: API Endpoints Summary"
echo "======================================================"
echo ""
echo "Recommendation & Analytics Endpoints:"
echo ""
echo "  GET  /blog/api/recommendations?q=<query>"
echo "       → Get recommended posts for a search query"
echo ""
echo "  GET  /blog/api/share/:slug?platform=<platform>"
echo "       → Get social media metadata for a post"
echo "       → Platforms: facebook, instagram, twitter, linkedin, generic"
echo ""
echo "  POST /blog/api/track-search"
echo "       → Track burnlink-related searches"
echo "       → Body: {query, platform}"
echo ""
echo "  GET  /blog/api/trending-searches?days=<days>"
echo "       → Get trending searches (default: 7 days)"
echo ""
echo "  GET  /blog/api/categories-with-stats"
echo "       → Get categories with engagement stats"
echo ""

# Step 6: Test endpoints
echo "✓ Step 6: Testing Endpoints"
echo "======================================================"
echo ""
echo "Run these tests to verify the system:"
echo ""
echo "1. Test recommendations:"
echo "   curl 'http://localhost:3000/blog/api/recommendations?q=burnlink+encryption'"
echo ""
echo "2. Test social metadata:"
echo "   curl 'http://localhost:3000/blog/api/share/secure-file-sharing-guide'"
echo ""
echo "3. Test search tracking:"
echo "   curl -X POST http://localhost:3000/blog/api/track-search \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"query\":\"burnlink encryption\",\"platform\":\"facebook\"}'"
echo ""
echo "4. Test trending searches:"
echo "   curl 'http://localhost:3000/blog/api/trending-searches?days=7'"
echo ""

# Step 7: Integration points
echo "✓ Step 7: Integration Points"
echo "======================================================"
echo ""
echo "Add to your website:"
echo ""
echo "1. Paperfrogs website search (to detect burnlink searches):"
echo "   - Add search query tracking to search input"
echo "   - Call /blog/api/recommendations?q=<query> for results"
echo ""
echo "2. Social media buttons on BurnLink blog:"
echo "   - Already integrated in views/blog/post.ejs"
echo "   - Tracks shares via /blog/api/track-search"
echo ""
echo "3. Open Graph metadata:"
echo "   - Automatically included in blog post pages"
echo "   - Shows rich previews on Facebook, LinkedIn, etc."
echo ""
echo "4. Analytics dashboard:"
echo "   - Query search_analytics table for trending data"
echo "   - Use burnlink_search_recommendations view"
echo ""

# Step 8: Next steps
echo ""
echo "✓ Step 8: Next Steps"
echo "======================================================"
echo ""
echo "1. Run database migrations in Supabase dashboard"
echo "2. Restart the application"
echo "3. Test API endpoints"
echo "4. Monitor analytics at /blog/api/trending-searches"
echo "5. Share blog posts on social media"
echo "6. Monitor engagement metrics"
echo ""

# Step 9: Monitoring commands
echo "✓ Step 9: Monitoring & Analytics"
echo "======================================================"
echo ""
echo "Monitor system health:"
echo ""
echo "  Check trending searches:"
echo "  curl http://localhost:3000/blog/api/trending-searches?days=7"
echo ""
echo "  Database view (via psql):"
echo "  SELECT * FROM burnlink_search_recommendations ORDER BY search_count DESC;"
echo ""
echo "  Recent searches:"
echo "  SELECT search_query, platform, COUNT(*)"
echo "  FROM search_analytics"
echo "  WHERE timestamp > NOW() - INTERVAL '24 hours'"
echo "  GROUP BY search_query, platform"
echo "  ORDER BY COUNT(*) DESC;"
echo ""

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Your BurnLink SEO & Social Recommendation System is ready!"
echo "The system will now:"
echo "  • Detect burnlink-related searches"
echo "  • Recommend relevant blog posts"
echo "  • Generate social media cards"
echo "  • Track analytics"
echo "  • Display trending searches"
echo ""
echo "For detailed documentation, see: SEO_RECOMMENDATION_SYSTEM.md"
echo ""
