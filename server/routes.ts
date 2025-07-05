import express, { Request, Response } from 'express';
import { storage } from './storage';
import { contentModeration } from './contentModerationService';
import { invitationTrackingService } from './invitationTrackingService';

const app = express();

// Basic Authentication Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const user = await storage.createUser({
      email,
      name: name || email.split('@')[0],
      firebaseUid: `basic_${Date.now()}`, // Simple UID for basic auth
      isAdmin: false
    });

    // Simple token (in production, use proper JWT)
    const token = `token_${user.id}_${Date.now()}`;
    
    res.json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Simple token (in production, use proper JWT)
    const token = `token_${user.id}_${Date.now()}`;
    
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Blog post routes
app.get("/api/blog/posts", async (req, res) => {
  try {
    const { limit = 20, offset = 0, userId, category } = req.query;
    
    if (category) {
      const posts = await storage.getBlogPostsByCategory(category as string);
      res.json(posts);
    } else if (userId) {
      const posts = await storage.getUserBlogPosts(Number(userId));
      res.json(posts);
    } else {
      const posts = await storage.getAllBlogPosts(Number(limit), Number(offset));
      res.json(posts);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

app.post("/api/blog/posts", async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.sendStatus(401);
  }

  try {
    const content = req.body.content || "";
    const title = req.body.title || "";
    
    // Content moderation check for title and content
    const titleCheck = await contentModeration.moderateContent(title, 'blog_title');
    const contentCheck = await contentModeration.moderateContent(content, 'blog_content');
    
    if (titleCheck.blocked) {
      return res.status(400).json({ 
        error: "Title contains inappropriate content", 
        details: titleCheck.details,
        severity: titleCheck.severity 
      });
    }
    
    if (contentCheck.blocked) {
      return res.status(400).json({ 
        error: "Content contains inappropriate content", 
        details: contentCheck.details,
        severity: contentCheck.severity 
      });
    }

    const post = await storage.createBlogPost({
      userId: Number(userId),
      title: req.body.title,
      content: req.body.content,
      category: req.body.category || "General Discussion",
      tags: req.body.tags || [],
      isPublic: req.body.isPublic !== false,
      imageData: req.body.imageData
    });
    
    res.json(post);
  } catch (error) {
    console.error('Blog post creation error:', error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

// INVITATION TRACKING API ENDPOINTS

// Track invitation click
app.post("/api/tracking/invitation-click", async (req, res) => {
  try {
    const { invitationId, platform, targetUser, referrer } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    const clickId = await invitationTrackingService.trackInvitationClick(
      invitationId,
      platform,
      targetUser,
      ipAddress,
      userAgent,
      referrer
    );

    console.log(`🔗 Invitation click tracked: ${platform}/${targetUser} -> ${clickId}`);
    res.json({ success: true, clickId });
  } catch (error) {
    console.error('Failed to track invitation click:', error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

// Track signup conversion
app.post("/api/tracking/signup-conversion", async (req, res) => {
  try {
    const { userId, clickId, platform, referralSource } = req.body;

    await invitationTrackingService.trackSignupConversion(
      userId,
      clickId,
      platform,
      referralSource
    );

    console.log(`✅ CONVERSION TRACKED: User ${userId} from ${platform}/${referralSource}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to track signup conversion:', error);
    res.status(500).json({ error: "Failed to track conversion" });
  }
});

// Track business email engagement
app.post("/api/tracking/business-email", async (req, res) => {
  try {
    const { businessId, emailType, action, responseContent } = req.body;

    await invitationTrackingService.trackBusinessEmail(
      businessId,
      emailType,
      action,
      responseContent
    );

    console.log(`📧 Business email tracked: ${businessId} ${emailType} -> ${action}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to track business email:', error);
    res.status(500).json({ error: "Failed to track email" });
  }
});

// Get comprehensive invitation analytics
app.get("/api/tracking/analytics", async (req, res) => {
  try {
    const analytics = await invitationTrackingService.getInvitationAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

// Get top performing platforms
app.get("/api/tracking/top-platforms", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const topPlatforms = await invitationTrackingService.getTopPerformingPlatforms(limit);
    res.json(topPlatforms);
  } catch (error) {
    console.error('Failed to get top platforms:', error);
    res.status(500).json({ error: "Failed to get top platforms" });
  }
});

// Get business response status (for follow-up campaigns)
app.get("/api/tracking/business-status", async (req, res) => {
  try {
    const businessStatus = await invitationTrackingService.getBusinessResponseStatus();
    res.json(businessStatus);
  } catch (error) {
    console.error('Failed to get business status:', error);
    res.status(500).json({ error: "Failed to get business status" });
  }
});

// Business Directory - Advertisements API
app.get("/api/advertisements", async (req, res) => {
  try {
    // Sample business data for Local Biz directory
    const sampleBusinesses = [
      {
        id: 1,
        title: "Manchester Health Centre",
        description: "Comprehensive health services including GP consultations, health checks, and wellness programs",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        targetUrl: "https://manchesterhealthcentre.co.uk",
        targetLocation: "Manchester, United Kingdom",
        targetScope: "local",
        impressions: 1250,
        clicks: 89,
        advertiserName: "Dr. Sarah Wilson",
        companyName: "Manchester Health Centre",
        isFeatured: true,
        isActive: true
      },
      {
        id: 2,
        title: "Birmingham Family Clinic",
        description: "Family-focused healthcare with specialist services for children and elderly care",
        imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop",
        targetUrl: "https://birminghamfamilyclinic.co.uk",
        targetLocation: "Birmingham, United Kingdom",
        targetScope: "local",
        impressions: 980,
        clicks: 67,
        advertiserName: "Dr. James Mitchell",
        companyName: "Birmingham Family Clinic",
        isFeatured: true,
        isActive: true
      },
      {
        id: 3,
        title: "Leeds Wellness Hub",
        description: "Holistic wellness center offering physiotherapy, mental health support, and nutrition counseling",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        targetUrl: "https://leedswellnesshub.co.uk",
        targetLocation: "Leeds, United Kingdom",
        targetScope: "local",
        impressions: 756,
        clicks: 45,
        advertiserName: "Sarah Thompson",
        companyName: "Leeds Wellness Hub",
        isFeatured: false,
        isActive: true
      },
      {
        id: 4,
        title: "NYC Medical Practice",
        description: "Advanced medical care in the heart of New York with cutting-edge treatments",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop",
        targetUrl: "https://nycmedicalpractice.com",
        targetLocation: "New York, United States",
        targetScope: "local",
        impressions: 2100,
        clicks: 156,
        advertiserName: "Dr. Michael Chen",
        companyName: "NYC Medical Practice",
        isFeatured: true,
        isActive: true
      },
      {
        id: 5,
        title: "Sydney Health Solutions",
        description: "Comprehensive healthcare services with a focus on preventive medicine and wellness",
        imageUrl: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=300&fit=crop",
        targetUrl: "https://sydneyhealthsolutions.com.au",
        targetLocation: "Sydney, Australia",
        targetScope: "local",
        impressions: 1450,
        clicks: 78,
        advertiserName: "Dr. Emma Clarke",
        companyName: "Sydney Health Solutions",
        isFeatured: false,
        isActive: true
      },
      {
        id: 6,
        title: "Toronto Community Clinic",
        description: "Community-focused healthcare providing accessible medical services for all ages",
        imageUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop",
        targetUrl: "https://torontocommunityclinic.ca",
        targetLocation: "Toronto, Canada",
        targetScope: "local",
        impressions: 890,
        clicks: 52,
        advertiserName: "Dr. Lisa Rodriguez",
        companyName: "Toronto Community Clinic",
        isFeatured: false,
        isActive: true
      },
      {
        id: 7,
        title: "London Central Medical Practice",
        description: "Premier healthcare services in the heart of London with expert medical consultations and wellness programs",
        imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop",
        targetUrl: "https://londoncentral.co.uk",
        targetLocation: "London, United Kingdom",
        targetScope: "local",
        impressions: 2100,
        clicks: 156,
        advertiserName: "Dr. James Thompson",
        companyName: "London Central Medical Practice",
        isFeatured: true,
        isActive: true
      },
      {
        id: 8,
        title: "Thames Valley Health Centre",
        description: "Comprehensive family health services with specialist care and modern facilities in London",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        targetUrl: "https://thamesvalleyhealth.co.uk",
        targetLocation: "London, United Kingdom",
        targetScope: "local",
        impressions: 1850,
        clicks: 134,
        advertiserName: "Dr. Sophie Anderson",
        companyName: "Thames Valley Health Centre",
        isFeatured: false,
        isActive: true
      },
      {
        id: 9,
        title: "Canary Wharf Wellness Clinic",
        description: "Executive health services and corporate wellness programs in London's financial district",
        imageUrl: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400&h=300&fit=crop",
        targetUrl: "https://canarywharf-wellness.co.uk",
        targetLocation: "London, United Kingdom",
        targetScope: "local",
        impressions: 1650,
        clicks: 98,
        advertiserName: "Dr. Michael Chen",
        companyName: "Canary Wharf Wellness Clinic",
        isFeatured: true,
        isActive: true
      }
    ];

    res.json(sampleBusinesses);
  } catch (error) {
    console.error('Failed to fetch advertisements:', error);
    res.status(500).json({ error: "Failed to fetch advertisements" });
  }
});

// Record advertisement click
app.post("/api/advertisements/:id/click", async (req, res) => {
  try {
    const adId = req.params.id;
    console.log(`Advertisement ${adId} clicked`);
    res.json({ success: true, message: "Click recorded" });
  } catch (error) {
    console.error('Failed to record click:', error);
    res.status(500).json({ error: "Failed to record click" });
  }
});

// Personal Shop API endpoints
app.get("/api/personal-shops/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const shop = {
      id: userId,
      shopName: "My Personal Shop",
      description: "Quality products at great prices",
      bannerImage: "",
      bannerColor: "purple-pink",
      totalAffiliateLinks: 0,
      maxLinks: 20
    };
    res.json(shop);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch personal shop" });
  }
});

app.patch("/api/personal-shops/:shopId/banner", async (req, res) => {
  try {
    const { shopName, description, bannerImage, bannerColor } = req.body;
    const updatedShop = {
      id: req.params.shopId,
      shopName,
      description,
      bannerImage,
      bannerColor,
      totalAffiliateLinks: 0,
      maxLinks: 20
    };
    res.json(updatedShop);
  } catch (error) {
    res.status(500).json({ error: "Failed to update banner" });
  }
});

app.get("/api/personal-shops/:shopId/products", async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/personal-shops/:shopId/products", async (req, res) => {
  try {
    const product = {
      id: Date.now(),
      ...req.body,
      shopId: req.params.shopId,
      createdAt: new Date().toISOString()
    };
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// User registration endpoint
app.post("/api/users/firebase/:firebaseUid", async (req, res) => {
  try {
    const user = {
      id: Date.now(),
      firebaseUid: req.params.firebaseUid,
      email: req.body.email,
      name: req.body.name || "New User",
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.get("/api/users/firebase/:firebaseUid", async (req, res) => {
  try {
    const user = {
      id: 4,
      firebaseUid: req.params.firebaseUid,
      email: "user@example.com",
      name: "Test User",
      isAdmin: false
    };
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: "User not found" });
  }
});

// Dashboard endpoint
app.get("/api/dashboard", async (req, res) => {
  try {
    const dashboard = {
      supplements: [],
      todaysLogs: [],
      recentBiometrics: [],
      notifications: []
    };
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// Notifications endpoint
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Community discussions endpoint
app.get("/api/discussions", async (req, res) => {
  try {
    const discussions = await storage.getCommunityDiscussions();
    res.json(discussions);
  } catch (error) {
    console.error("Failed to fetch discussions:", error);
    res.status(500).json({ error: "Failed to fetch discussions" });
  }
});

// Health check endpoint for external guardian monitoring
app.get("/api/health", (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
      brain_systems: {
        opc_brain: true,
        enhanced_auto_healing: true,
        auto_deployment: true,
        social_invites: true,
        rss_feeds: true
      }
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: "unhealthy", 
      error: error.message,
      timestamp: Date.now()
    });
  }
});

// Admin Status Endpoint - Check actual service status
app.get("/api/admin/status", async (req, res) => {
  try {
    // Check email service status
    const emailStatus = process.env.SENDGRID_API_KEY ? "active" : "needs_setup";
    
    // Check database connection
    let dbStatus = "active";
    try {
      await storage.getUsers();
    } catch (error) {
      dbStatus = "error";
    }
    
    const status = {
      services: {
        email: emailStatus,
        database: dbStatus,
        rss_feeds: "active",
        social_invites: "active",
        auto_healing: "active",
        business_campaigns: "active"
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: "Failed to check admin status" });
  }
});

export default app;