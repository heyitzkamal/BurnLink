/**
 * SEO & Social Media Recommendation System
 * Detects burnlink-related searches and suggests relevant content
 */

const supabase = require("./supabase");

// Knowledge base for burnlink-related search queries
const BURNLINK_KNOWLEDGE_BASE = [
  {
    keywords: ["secure file sharing", "encrypted file transfer", "private file share"],
    posts: ["secure-file-sharing", "end-to-end-encryption"],
    category: "security",
  },
  {
    keywords: ["one-time links", "burn files", "self-destructing files", "one time download"],
    posts: ["how-one-time-links-work", "security-features"],
    category: "features",
  },
  {
    keywords: ["file storage privacy", "no account needed", "anonymous sharing"],
    posts: ["privacy-first-design", "no-account-file-sharing"],
    category: "privacy",
  },
  {
    keywords: ["download limit", "share files securely", "guest access"],
    posts: ["file-sharing-controls", "sharing-best-practices"],
    category: "features",
  },
  {
    keywords: ["file encryption", "aes encryption", "end to end"],
    posts: ["encryption-explained", "how-encryption-works"],
    category: "security",
  },
  {
    keywords: ["alternative to", "file transfer", "document sharing"],
    posts: ["burnlink-vs-others", "why-choose-burnlink"],
    category: "comparison",
  },
  {
    keywords: ["large file transfer", "file size limit", "upload limit"],
    posts: ["transfer-large-files", "file-size-limits"],
    category: "help",
  },
  {
    keywords: ["mobile file sharing", "share from phone", "send files mobile"],
    posts: ["mobile-file-sharing", "sharing-from-phone"],
    category: "guide",
  },
];

/**
 * Extract search intent from query string
 */
function extractSearchIntent(query) {
  if (!query || typeof query !== "string") return null;

  const lowercaseQuery = query.toLowerCase().trim();
  
  // Check if query contains burnlink
  if (!lowercaseQuery.includes("burnlink") && !lowercaseQuery.includes("burn link")) {
    return null;
  }

  // Remove burnlink from query to see what they're actually looking for
  const intent = lowercaseQuery
    .replace(/burnlink|burn\s+link/g, "")
    .trim();

  return intent || "general";
}

/**
 * Find relevant blog posts based on search query
 */
function findRelevantPosts(searchQuery) {
  const intent = extractSearchIntent(searchQuery);
  if (!intent) return [];

  const relevant = [];
  const intentLower = intent.toLowerCase();

  for (const knowledge of BURNLINK_KNOWLEDGE_BASE) {
    const matches = knowledge.keywords.filter(
      (kw) => intentLower.includes(kw) || kw.includes(intentLower)
    );

    if (matches.length > 0) {
      relevant.push({
        posts: knowledge.posts,
        category: knowledge.category,
        matchScore: matches.length,
      });
    }
  }

  // Sort by relevance
  return relevant.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get recommendation data for social media sharing
 */
async function getRecommendationData(postSlug, referrerPlatform = null) {
  try {
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", postSlug)
      .single();

    if (error) throw error;
    if (!post) return null;

    // Generate platform-specific metadata
    const recommendations = {
      facebook: generateFacebookCard(post),
      instagram: generateInstagramCaption(post),
      twitter: generateTwitterCard(post),
      linkedin: generateLinkedInCard(post),
      generic: {
        title: post.title,
        description: post.excerpt,
        image: post.featured_image,
        url: `https://burnlink.page/blog/${post.slug}`,
      },
    };

    return recommendations;
  } catch (err) {
    console.error("Error fetching recommendation data:", err);
    return null;
  }
}

/**
 * Generate Facebook/Instagram Open Graph card
 */
function generateFacebookCard(post) {
  return {
    title: post.title,
    description: post.excerpt,
    image: post.featured_image || "https://burnlink.page/og-default.jpg",
    url: `https://burnlink.page/blog/${post.slug}`,
    type: "article",
    publishedTime: post.published_at,
    category: post.category,
    hashtags: generateHashtags(post),
  };
}

/**
 * Generate Instagram caption with hashtags
 */
function generateInstagramCaption(post) {
  const hashtags = generateHashtags(post);
  return {
    caption: `📖 ${post.title}\n\n${post.excerpt}\n\nLink in bio 🔗\n\n${hashtags.join(" ")}`,
    image: post.featured_image,
    keywords: post.tags || [],
  };
}

/**
 * Generate Twitter/X card
 */
function generateTwitterCard(post) {
  return {
    title: post.title.substring(0, 200),
    description: post.excerpt.substring(0, 160),
    image: post.featured_image,
    url: `https://burnlink.page/blog/${post.slug}`,
    hashtags: generateHashtags(post).slice(0, 3),
  };
}

/**
 * Generate LinkedIn article card
 */
function generateLinkedInCard(post) {
  return {
    title: post.title,
    description: post.excerpt,
    image: post.featured_image,
    url: `https://burnlink.page/blog/${post.slug}`,
    category: post.category,
    author: post.author || "BurnLink",
  };
}

/**
 * Generate relevant hashtags
 */
function generateHashtags(post) {
  const baseHashtags = [
    "#BurnLink",
    "#FileSharing",
    "#Encryption",
    "#Privacy",
    "#Security",
  ];

  const categoryHashtags = {
    security: ["#CyberSecurity", "#Encryption", "#PrivacyFirst"],
    privacy: ["#PrivacyMatters", "#DataPrivacy", "#PrivacyRights"],
    features: ["#FileSharing", "#SecureTransfer", "#OnlineTools"],
    comparison: ["#ProductComparison", "#BestPractices"],
    guide: ["#HowTo", "#Tutorial", "#Guide"],
    help: ["#FAQ", "#Support", "#Help"],
  };

  const tags = [...baseHashtags];
  if (post.category && categoryHashtags[post.category]) {
    tags.push(...categoryHashtags[post.category]);
  }

  return tags.slice(0, 10);
}

/**
 * Track search query for analytics
 */
async function trackSearchQuery(searchQuery, platform = "organic") {
  try {
    const intent = extractSearchIntent(searchQuery);
    if (!intent) return; // Not burnlink related

    await supabase.from("search_analytics").insert([
      {
        search_query: searchQuery,
        search_intent: intent,
        platform,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("Error tracking search query:", err);
  }
}

/**
 * Get trending burnlink searches
 */
async function getTrendingSearches(days = 7) {
  try {
    const { data, error } = await supabase
      .from("search_analytics")
      .select("search_query, count(*)")
      .gte("timestamp", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .group_by("search_query")
      .order("count", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching trending searches:", err);
    return [];
  }
}

/**
 * Get recommended posts for a search query
 */
async function getRecommendedPosts(searchQuery, limit = 5) {
  try {
    const relevant = findRelevantPosts(searchQuery);
    if (relevant.length === 0) {
      // Return general featured posts
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .eq("featured", true)
        .limit(limit);

      return posts || [];
    }

    const postSlugs = relevant[0].posts;
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .in("slug", postSlugs)
      .eq("status", "published")
      .limit(limit);

    if (error) throw error;
    return posts || [];
  } catch (err) {
    console.error("Error getting recommended posts:", err);
    return [];
  }
}

module.exports = {
  extractSearchIntent,
  findRelevantPosts,
  getRecommendationData,
  generateFacebookCard,
  generateInstagramCaption,
  generateTwitterCard,
  generateLinkedInCard,
  generateHashtags,
  trackSearchQuery,
  getTrendingSearches,
  getRecommendedPosts,
};
