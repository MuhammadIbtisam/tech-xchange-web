import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  Spin, 
  Empty, 
  message,
  Badge,
  Tooltip
} from 'antd';
import { 
  FireOutlined, 
  ClockCircleOutlined, 
  LinkOutlined, 
  ReloadOutlined,
  ShareAltOutlined,
  BookOutlined,
  GlobalOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import newsService from '../../services/newsService';

const { Title, Text, Paragraph } = Typography;

const NewsSection = ({ 
  title = "Latest Tech News", 
  showTrending = true, 
  maxArticles = 6,
  compact = false 
}) => {
  const [news, setNews] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('tech');

  useEffect(() => {
    loadNews();
    if (showTrending) {
      loadTrendingTopics();
    }
  }, [activeTab]);

  const loadNews = async () => {
    try {
      setLoading(true);
      console.log('📰 Loading news...');
      
      const response = activeTab === 'tech' 
        ? await newsService.getTechNews(1, maxArticles)
        : await newsService.getProductNews(1, maxArticles);
      
      if (response.success) {
        setNews(response.articles || []);
        console.log('✅ News loaded:', response.articles?.length || 0);
      } else {
        message.error('Failed to load news');
      }
    } catch (error) {
      console.error('❌ Error loading news:', error);
      message.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const response = await newsService.getTrendingTopics();
      if (response.success) {
        setTrendingTopics(response.topics || []);
      }
    } catch (error) {
      console.error('❌ Error loading trending topics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    if (showTrending) {
      await loadTrendingTopics();
    }
    setRefreshing(false);
    message.success('News refreshed successfully');
  };

  const handleArticleClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSourceColor = (source) => {
    const colors = {
      'TechCrunch': 'blue',
      'The Verge': 'purple',
      'Wired': 'red',
      'ZDNet': 'green',
      'PC Gamer': 'orange',
      'Digital Trends': 'cyan',
      'TechRadar': 'magenta'
    };
    return colors[source] || 'default';
  };

  const renderNewsCard = (article, index) => {
    if (compact) {
      return (
        <Card
          key={index}
          hoverable
          className="h-full"
          bodyStyle={{ padding: '12px' }}
          onClick={() => handleArticleClick(article.url)}
        >
          <div className="flex gap-3">
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src={article.urlToImage || 'https://via.placeholder.com/64x64?text=News'}
                alt={article.title}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64x64?text=News';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Text strong className="text-xs line-clamp-2 block mb-1">
                {newsService.truncateText(article.title, 80)}
              </Text>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Tag color={getSourceColor(article.source?.name)} size="small">
                  {article.source?.name}
                </Tag>
                <Text type="secondary" className="text-xs">
                  {newsService.formatDate(article.publishedAt)}
                </Text>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card
        key={index}
        hoverable
        className="h-full group"
        cover={
          <div className="relative h-48 overflow-hidden">
            <img
              src={article.urlToImage || 'https://via.placeholder.com/400x200?text=Tech+News'}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200?text=Tech+News';
              }}
            />
            <div className="absolute top-2 right-2">
              <Tag color={getSourceColor(article.source?.name)} className="shadow-sm">
                {article.source?.name}
              </Tag>
            </div>
            <div className="absolute bottom-2 left-2">
              <Tag color="rgba(0,0,0,0.6)" className="text-white border-white">
                <ClockCircleOutlined className="mr-1" />
                {newsService.formatDate(article.publishedAt)}
              </Tag>
            </div>
          </div>
        }
        actions={[
          <Tooltip title="Read Article">
            <Button 
              type="text" 
              icon={<LinkOutlined />}
              onClick={() => handleArticleClick(article.url)}
            />
          </Tooltip>,
          <Tooltip title="Share">
            <Button 
              type="text" 
              icon={<ShareAltOutlined />}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    url: article.url
                  });
                } else {
                  navigator.clipboard.writeText(article.url);
                  message.success('Link copied to clipboard');
                }
              }}
            />
          </Tooltip>
        ]}
      >
        <div className="space-y-3">
          <Title level={5} className="line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </Title>
          <Paragraph className="text-gray-600 text-sm line-clamp-3 mb-0">
            {newsService.truncateText(article.description, 120)}
          </Paragraph>
        </div>
      </Card>
    );
  };

  const renderTrendingTopics = () => {
    if (!showTrending || trendingTopics.length === 0) return null;

    return (
      <Card 
        title={
          <div className="flex items-center gap-2">
            <FireOutlined className="text-orange-500" />
            <span>Trending Topics</span>
          </div>
        }
        className="h-full"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="space-y-3">
          {trendingTopics.slice(0, 8).map((topic, index) => (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                <Text strong className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                  {topic.topic}
                </Text>
              </div>
              <Tag color="blue" size="small" className="flex-shrink-0">
                {topic.count}
              </Tag>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <div className="mt-4 text-gray-500">Loading latest tech news...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title level={3} className="mb-2 text-xl sm:text-2xl">
            <GlobalOutlined className="mr-2 text-blue-500" />
            {title}
          </Title>
          <Text className="text-gray-600 text-sm sm:text-base">
            Stay updated with the latest technology news and trends
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
            size="small"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          type={activeTab === 'tech' ? 'primary' : 'default'}
          icon={<ThunderboltOutlined />}
          onClick={() => setActiveTab('tech')}
          size="small"
        >
          Tech News
        </Button>
        <Button
          type={activeTab === 'products' ? 'primary' : 'default'}
          icon={<BookOutlined />}
          onClick={() => setActiveTab('products')}
          size="small"
        >
          Product News
        </Button>
      </div>

      {/* Content */}
      <Row gutter={[16, 16]}>
        {/* News Articles */}
        <Col xs={24} lg={showTrending ? 16 : 24} xl={showTrending ? 18 : 24}>
          {news.length === 0 ? (
            <Empty
              description="No news articles found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {news.map((article, index) => (
                <Col 
                  key={index} 
                  xs={24} 
                  sm={12} 
                  lg={compact ? 24 : 8}
                  xl={compact ? 12 : 6}
                >
                  {renderNewsCard(article, index)}
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* Trending Topics Sidebar */}
        {showTrending && (
          <Col xs={24} lg={8} xl={6}>
            {renderTrendingTopics()}
          </Col>
        )}
      </Row>

      {/* Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {news.length}
              </div>
              <div className="text-sm text-gray-600">Articles Loaded</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {trendingTopics.length}
              </div>
              <div className="text-sm text-gray-600">Trending Topics</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {activeTab === 'tech' ? 'Tech' : 'Product'}
              </div>
              <div className="text-sm text-gray-600">News Category</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default NewsSection;
