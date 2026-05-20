const supabase = require("../lib/supabase");

class BlogPost {
  static async create(data) {
    const { title, slug, excerpt, content, category, status, featured, author, tags, featured_image } = data;
    const now = new Date().toISOString();
    const postStatus = status || "draft";

    const { data: post, error } = await supabase
      .from("blog_posts")
      .insert([
        {
          title,
          slug: slug || this.generateSlug(title),
          excerpt,
          content,
          category,
          status: postStatus,
          featured: featured || false,
          author: author || "BurnLink Team",
          tags: tags || [],
          featured_image: featured_image || null,
          created_at: now,
          updated_at: now,
          published_at: postStatus === "published" ? now : null,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to create blog post: ${error.message}`);
    return post;
  }

  static async getAll(filters = {}) {
    let query = supabase.from("blog_posts").select("*");

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.featured) query = query.eq("featured", true);

    query = query.order("created_at", { ascending: false });

    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch blog posts: ${error.message}`);
    return data || [];
  }

  static async getBySlug(slug) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) throw new Error(`Blog post not found: ${error.message}`);
    return data;
  }

  static async update(id, data) {
    const now = new Date().toISOString();
    const updateData = {
      ...data,
      updated_at: now,
    };
    
    // Set published_at when publishing a post for the first time
    if (data.status === "published" && !updateData.published_at) {
      updateData.published_at = now;
    }

    const { data: post, error } = await supabase
      .from("blog_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update blog post: ${error.message}`);
    return post;
  }

  static async delete(id) {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete blog post: ${error.message}`);
    return true;
  }

  static async getRelated(category, currentSlug, limit = 3) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("category", category)
      .eq("status", "published")
      .neq("slug", currentSlug)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch related posts: ${error.message}`);
    return data || [];
  }

  static async searchPosts(query) {
    // Sanitize and split query for better matching
    const sanitizedQuery = query.toLowerCase().trim();
    const queryTerms = sanitizedQuery.split(/\s+/).filter(t => t.length > 1);
    
    if (queryTerms.length === 0) return [];

    const supabase = require("../lib/supabase");
    
    // First, try exact phrase match
    let dbQuery = supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, category, author, published_at, created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20);

    // Build filter conditions for better search
    // Search in title, excerpt, and content
    const conditions = queryTerms
      .map((term) => `title.ilike.%${term}%,excerpt.ilike.%${term}%`)
      .join(",");

    if (conditions) {
      dbQuery = dbQuery.or(conditions);
    }

    const { data, error } = await dbQuery;

    if (error) throw new Error(`Search failed: ${error.message}`);
    
    // Sort results by relevance (title matches are ranked higher)
    const results = (data || []).sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      const aMatches = queryTerms.filter(t => aTitle.includes(t)).length;
      const bMatches = queryTerms.filter(t => bTitle.includes(t)).length;
      
      return bMatches - aMatches;
    });

    return results;
  }

  // ── Comments ──
  static async getComments(postId) {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch comments: ${error.message}`);
    return data || [];
  }

  static async addComment(postId, authorName, authorEmail, content) {
    const { data: comment, error } = await supabase
      .from("blog_comments")
      .insert([
        {
          post_id: postId,
          author_name: authorName,
          author_email: authorEmail,
          content,
          approved: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to add comment: ${error.message}`);
    return comment;
  }

  static async approveComment(commentId) {
    const { data, error } = await supabase
      .from("blog_comments")
      .update({ approved: true })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve comment: ${error.message}`);
    return data;
  }

  static async deleteComment(commentId) {
    const { error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("id", commentId);

    if (error) throw new Error(`Failed to delete comment: ${error.message}`);
    return true;
  }

  static generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
}

module.exports = BlogPost;
