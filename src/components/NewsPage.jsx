import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Input, 
  Tag,
  Breadcrumb,
  Divider
} from 'antd';
import { 
  GlobalOutlined, 
  BookOutlined,
  ThunderboltOutlined,
  FireOutlined
} from '@ant-design/icons';
import NewsSection from './news/NewsSection';

const { Title, Text } = Typography;

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('compact');

  const categories = [
    { value: 'all', label: 'All News', icon: <GlobalOutlined /> },
    { value: 'tech', label: 'Technology', icon: <ThunderboltOutlined /> },
    { value: 'products', label: 'Products', icon: <BookOutlined /> },
    { value: 'trending', label: 'Trending', icon: <FireOutlined /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 md:py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item>
              <span className="text-blue-200">Home</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span className="text-white">Tech News</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          
          <div className="text-center">
            <Title level={1} className="text-white mb-4 text-3xl md:text-4xl lg:text-5xl">
              <GlobalOutlined className="mr-3" />
              Technology News & Trends
            </Title>
            <Text className="text-blue-100 text-lg md:text-xl mb-8 block">
              Stay ahead with the latest technology news, product launches, and industry insights
            </Text>
            

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Category Filter */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Title level={4} className="mb-2">Browse by Category</Title>
              <Text className="text-gray-600">Select a category to filter news content</Text>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.value}
                  type={selectedCategory === category.value ? 'primary' : 'default'}
                  icon={category.icon}
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center gap-2"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>



        {/* News Content */}
        <Row gutter={[24, 24]}>
          {/* Main News Section */}
          <Col xs={24} lg={16}>
            {selectedCategory === 'all' && (
              <div className="space-y-8">
                {/* Tech News */}
                <Card>
                  <NewsSection 
                    title="Latest Technology News"
                    showTrending={false}
                    maxArticles={8}
                    compact={viewMode === 'compact'}
                  />
                </Card>
                
                <Divider />
                
                {/* Product News */}
                <Card>
                  <NewsSection 
                    title="Product News & Reviews"
                    showTrending={false}
                    maxArticles={6}
                    compact={viewMode === 'compact'}
                  />
                </Card>
              </div>
            )}
            
            {selectedCategory === 'tech' && (
              <Card>
                <NewsSection 
                  title="Technology News"
                  showTrending={false}
                  maxArticles={12}
                  compact={viewMode === 'compact'}
                />
              </Card>
            )}
            
            {selectedCategory === 'products' && (
              <Card>
                <NewsSection 
                  title="Product News & Reviews"
                  showTrending={false}
                  maxArticles={12}
                  compact={viewMode === 'compact'}
                />
              </Card>
            )}
            
            {selectedCategory === 'trending' && (
              <Card>
                <NewsSection 
                  title="Trending Technology Topics"
                  showTrending={true}
                  maxArticles={10}
                  compact={viewMode === 'compact'}
                />
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              {/* Trending Topics */}
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <FireOutlined className="text-orange-500" />
                    <span>Trending Now</span>
                  </div>
                }
              >
                <div className="space-y-3">
                  {[
                    { topic: 'Artificial Intelligence', count: 45, trend: 'up' },
                    { topic: 'iPhone 15 Pro', count: 32, trend: 'up' },
                    { topic: 'Tesla Cybertruck', count: 28, trend: 'up' },
                    { topic: 'ChatGPT Updates', count: 25, trend: 'up' },
                    { topic: 'Samsung Galaxy S24', count: 22, trend: 'up' },
                    { topic: 'Meta Quest 3', count: 18, trend: 'up' },
                    { topic: 'Google Pixel 8', count: 15, trend: 'up' },
                    { topic: 'MacBook Pro M3', count: 12, trend: 'up' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <Text strong className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.topic}
                        </Text>
                      </div>
                      <Tag color="blue" size="small" className="flex-shrink-0">
                        {item.count}
                      </Tag>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card title="News Statistics">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Text>Total Articles Today</Text>
                    <Text strong className="text-blue-600">247</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>Tech Companies Covered</Text>
                    <Text strong className="text-green-600">89</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>Product Reviews</Text>
                    <Text strong className="text-purple-600">156</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>Trending Topics</Text>
                    <Text strong className="text-orange-600">23</Text>
                  </div>
                </div>
              </Card>

              {/* Newsletter Signup */}
              <Card 
                title="Stay Updated"
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              >
                <div className="text-center space-y-4">
                  <Text className="block text-gray-600">
                    Get the latest tech news delivered to your inbox
                  </Text>
                  <Space.Compact className="w-full">
                    <Input 
                      placeholder="Enter your email" 
                      className="flex-1"
                    />
                    <Button type="primary">
                      Subscribe
                    </Button>
                  </Space.Compact>
                  <Text className="text-xs text-gray-500 block">
                    No spam, unsubscribe at any time
                  </Text>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default NewsPage;
