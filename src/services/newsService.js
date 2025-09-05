import apiService from './apiService';

class NewsService {
  constructor() {
    // Using NewsAPI - you can get a free API key from https://newsapi.org/
    this.apiKey = import.meta.env.VITE_NEWS_API_KEY || 'demo_key';
    this.baseUrl = 'https://newsapi.org/v2';
    
    // Fallback to demo data if no API key
    this.useDemoData = !import.meta.env.VITE_NEWS_API_KEY;
  }

  // Get latest technology news
  async getTechNews(page = 1, pageSize = 10) {
    if (this.useDemoData) {
      return this.getDemoTechNews();
    }

    try {
      console.log('📰 Fetching tech news from NewsAPI...');
      
      // Use a proxy or CORS-enabled endpoint since NewsAPI has CORS restrictions
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(
        `${this.baseUrl}/everything?q=technology&language=en&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${this.apiKey}`
      )}`);
      
      const data = await response.json();
      const newsData = JSON.parse(data.contents);
      
      if (newsData.status === 'ok') {
        return {
          success: true,
          articles: newsData.articles,
          totalResults: newsData.totalResults,
          page: page,
          pageSize: pageSize
        };
      } else {
        throw new Error(newsData.message || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('❌ Error fetching tech news:', error);
      // Fallback to demo data
      return this.getDemoTechNews();
    }
  }

  // Get technology product news
  async getProductNews(page = 1, pageSize = 10) {
    if (this.useDemoData) {
      return this.getDemoProductNews();
    }

    try {
      console.log('📱 Fetching product news from NewsAPI...');
      
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(
        `${this.baseUrl}/everything?q=(smartphone OR laptop OR tablet OR "tech product")&language=en&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${this.apiKey}`
      )}`);
      
      const data = await response.json();
      const newsData = JSON.parse(data.contents);
      
      if (newsData.status === 'ok') {
        return {
          success: true,
          articles: newsData.articles,
          totalResults: newsData.totalResults,
          page: page,
          pageSize: pageSize
        };
      } else {
        throw new Error(newsData.message || 'Failed to fetch product news');
      }
    } catch (error) {
      console.error('❌ Error fetching product news:', error);
      return this.getDemoProductNews();
    }
  }

  // Get trending tech topics
  async getTrendingTopics() {
    if (this.useDemoData) {
      return this.getDemoTrendingTopics();
    }

    try {
      console.log('🔥 Fetching trending topics...');
      
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(
        `${this.baseUrl}/everything?q=technology&language=en&sortBy=popularity&page=1&pageSize=20&apiKey=${this.apiKey}`
      )}`);
      
      const data = await response.json();
      const newsData = JSON.parse(data.contents);
      
      if (newsData.status === 'ok') {
        // Extract trending topics from article titles
        const topics = this.extractTrendingTopics(newsData.articles);
        return {
          success: true,
          topics: topics
        };
      } else {
        throw new Error(newsData.message || 'Failed to fetch trending topics');
      }
    } catch (error) {
      return this.getDemoTrendingTopics();
    }
  }

  // Extract trending topics from article titles
  extractTrendingTopics(articles) {
    const topicCounts = {};
    const techKeywords = [
      'AI', 'Artificial Intelligence', 'Machine Learning', 'Blockchain', 'Cryptocurrency',
      'iPhone', 'Samsung', 'Apple', 'Google', 'Microsoft', 'Tesla', 'Meta', 'Amazon',
      'Smartphone', 'Laptop', 'Tablet', 'Gaming', 'VR', 'AR', 'IoT', '5G', 'Cloud',
      'Cybersecurity', 'Data Science', 'Robotics', 'Automation', 'Fintech', 'Edtech'
    ];

    articles.forEach(article => {
      const title = article.title.toLowerCase();
      techKeywords.forEach(keyword => {
        if (title.includes(keyword.toLowerCase())) {
          topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
        }
      });
    });

    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));
  }

  // Demo data for development/testing
  getDemoTechNews() {
    return {
      success: true,
      articles: [
        {
          title: "Apple Announces New MacBook Pro with M3 Chip",
          description: "Apple has unveiled its latest MacBook Pro featuring the powerful M3 chip, promising significant performance improvements and better battery life.",
          url: "https://www.apple.com/newsroom/2024/10/apple-announces-macbook-pro-with-m3-chip/",
          urlToImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
          publishedAt: new Date().toISOString(),
          source: { name: "Apple Newsroom" }
        },
        {
          title: "Samsung Galaxy S24 Ultra: Revolutionary Camera Technology",
          description: "Samsung's latest flagship smartphone features groundbreaking camera technology with AI-powered photography capabilities.",
          url: "https://www.samsung.com/us/smartphones/galaxy-s24-ultra/",
          urlToImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: { name: "Samsung" }
        },
        {
          title: "Tesla's New Autopilot Update Improves Safety by 40%",
          description: "Tesla has released a major update to its Autopilot system, significantly improving safety and autonomous driving capabilities.",
          url: "https://www.tesla.com/autopilot",
          urlToImage: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: { name: "Tesla" }
        },
        {
          title: "Microsoft Copilot Gets Major AI Enhancements",
          description: "Microsoft has announced significant improvements to its Copilot AI assistant, making it more powerful and intuitive.",
          url: "https://www.microsoft.com/en-us/copilot",
          urlToImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
          publishedAt: new Date(Date.now() - 10800000).toISOString(),
          source: { name: "Microsoft" }
        },
        {
          title: "Google's New AI Model Outperforms GPT-4 in Benchmarks",
          description: "Google has unveiled its latest AI model that shows superior performance in various benchmark tests compared to existing models.",
          url: "https://ai.google/discover/gemini/",
          urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
          publishedAt: new Date(Date.now() - 14400000).toISOString(),
          source: { name: "Google AI" }
        }
      ],
      totalResults: 5,
      page: 1,
      pageSize: 10
    };
  }

  getDemoProductNews() {
    return {
      success: true,
      articles: [
        {
          title: "Best Gaming Laptops of 2024: Performance Meets Portability",
          description: "Our comprehensive review of the top gaming laptops that deliver exceptional performance while maintaining portability.",
          url: "https://www.pcgamer.com/best-gaming-laptops/",
          urlToImage: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop",
          publishedAt: new Date().toISOString(),
          source: { name: "PC Gamer" }
        },
        {
          title: "iPhone 15 Pro Max vs Samsung Galaxy S24 Ultra: Camera Comparison",
          description: "A detailed comparison of the camera systems in the latest flagship smartphones from Apple and Samsung.",
          url: "https://www.digitaltrends.com/mobile/iphone-15-pro-max-vs-samsung-galaxy-s24-ultra/",
          urlToImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
          publishedAt: new Date(Date.now() - 1800000).toISOString(),
          source: { name: "Digital Trends" }
        }
      ],
      totalResults: 2,
      page: 1,
      pageSize: 10
    };
  }

  getDemoTrendingTopics() {
    return {
      success: true,
      topics: [
        { topic: "AI", count: 15 },
        { topic: "iPhone", count: 12 },
        { topic: "Samsung", count: 10 },
        { topic: "Tesla", count: 8 },
        { topic: "Apple", count: 7 },
        { topic: "Google", count: 6 },
        { topic: "Microsoft", count: 5 },
        { topic: "Blockchain", count: 4 },
        { topic: "5G", count: 3 },
        { topic: "VR", count: 2 }
      ]
    };
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  // Truncate text for display
  truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

// Create and export service instance
const newsService = new NewsService();
export default newsService;
