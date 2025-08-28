import React from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Avatar, Button } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, RiseOutlined, ShopOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user, isSeller, isBuyer } = useAuth();

  const buyerStats = [
    {
      title: 'Total Orders',
      value: 12,
      prefix: <ShoppingCartOutlined />,
      color: '#1890ff',
      increase: '+3',
    },
    {
      title: 'Saved Items',
      value: 8,
      prefix: <EyeOutlined />,
      color: '#52c41a',
      increase: '+2',
    },
    {
      title: 'Total Spent',
      value: '$2,450',
      prefix: <DollarOutlined />,
      color: '#faad14',
      increase: '+$450',
    },
    {
      title: 'Reviews Given',
      value: 5,
      prefix: <UserOutlined />,
      color: '#f5222d',
      increase: '+1',
    },
  ];

  const sellerStats = [
    {
      title: 'Total Products',
      value: 24,
      prefix: <ShopOutlined />,
      color: '#1890ff',
      increase: '+3',
    },
    {
      title: 'Total Sales',
      value: '$8,450',
      prefix: <DollarOutlined />,
      color: '#52c41a',
      increase: '+$1,200',
    },
    {
      title: 'Product Views',
      value: 1234,
      prefix: <EyeOutlined />,
      color: '#faad14',
      increase: '+156',
    },
    {
      title: 'Average Rating',
      value: 4.8,
      prefix: <RiseOutlined />,
      color: '#f5222d',
      increase: '+0.2',
    },
  ];

  const stats = isSeller ? sellerStats : buyerStats;

  const recentActivities = isSeller ? [
    { user: 'New order received', action: 'for MacBook Pro', time: '2 minutes ago', avatar: '🖥️' },
    { user: 'Product approved', action: 'iPhone 16 by admin', time: '5 minutes ago', avatar: '✅' },
    { user: 'New views', action: 'on ThinkPad X1', time: '10 minutes ago', avatar: '👁️' },
    { user: 'Review received', action: '5 stars for MacBook', time: '15 minutes ago', avatar: '⭐' },
  ] : [
    { user: 'John Doe', action: 'placed an order', time: '2 minutes ago', avatar: 'JD' },
    { user: 'Jane Smith', action: 'updated profile', time: '5 minutes ago', avatar: 'JS' },
    { user: 'Mike Johnson', action: 'completed payment', time: '10 minutes ago', avatar: 'MJ' },
    { user: 'Sarah Wilson', action: 'left a review', time: '15 minutes ago', avatar: 'SW' },
  ];

  const quickActions = isSeller ? [
    { icon: <ShopOutlined />, label: 'Add Product', color: 'blue', onClick: () => console.log('Add Product clicked') },
    { icon: <EyeOutlined />, label: 'View Analytics', color: 'green', onClick: () => console.log('View Analytics clicked') },
    { icon: <DollarOutlined />, label: 'View Orders', color: 'orange', onClick: () => console.log('View Orders clicked') },
    { icon: <UserOutlined />, label: 'Customer Support', color: 'purple', onClick: () => console.log('Customer Support clicked') },
  ] : [
    { icon: <ShoppingCartOutlined />, label: 'Browse Products', color: 'blue', onClick: () => console.log('Browse Products clicked') },
    { icon: <EyeOutlined />, label: 'Saved Items', color: 'green', onClick: () => console.log('Saved Items clicked') },
    { icon: <DollarOutlined />, label: 'My Orders', color: 'orange', onClick: () => console.log('My Orders clicked') },
    { icon: <UserOutlined />, label: 'Profile', color: 'purple', onClick: () => console.log('Profile clicked') },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <Title level={2} className="text-white mb-2">
          Welcome back, {user?.fullName}! 👋
        </Title>
        <Text className="text-blue-100">
          {isSeller 
            ? "Here's how your store is performing today."
            : "Here's what's happening with your orders today."
          }
        </Text>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                styles={{ content: { color: stat.color } }}
              />
              <div className="flex items-center mt-2">
                <Text type="success" className="text-sm">
                  {stat.increase}
                </Text>
                <Text className="text-gray-500 text-sm ml-2">from last month</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Progress and Activity Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={isSeller ? "Store Goals" : "Monthly Goals"} className="h-full">
            <Space orientation="vertical" className="w-full">
              {isSeller ? (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text>Sales Target</Text>
                      <Text>75%</Text>
                    </div>
                    <Progress percent={75} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text>Product Growth</Text>
                      <Text>60%</Text>
                    </div>
                    <Progress percent={60} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text>Customer Satisfaction</Text>
                      <Text>90%</Text>
                    </div>
                    <Progress percent={90} strokeColor="#faad14" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text>Monthly Budget</Text>
                      <Text>75%</Text>
                    </div>
                    <Progress percent={75} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text>Order Goal</Text>
                      <Text>60%</Text>
                    </div>
                    <Progress percent={60} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text>Review Goal</Text>
                      <Text>90%</Text>
                    </div>
                    <Progress percent={90} strokeColor="#faad14" />
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" className="h-full">
            <Space orientation="vertical" className="w-full">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Avatar size="small" className="bg-blue-500">
                    {activity.avatar}
                  </Avatar>
                  <div className="flex-1">
                    <Text strong>{activity.user}</Text>
                    <Text className="text-gray-500 ml-2">{activity.action}</Text>
                  </div>
                  <Text className="text-gray-400 text-sm">{activity.time}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card 
                className="text-center hover:shadow-md transition-shadow cursor-pointer"
                onClick={action.onClick}
              >
                <div className={`text-2xl text-${action.color}-500 mb-2`}>
                  {action.icon}
                </div>
                <div>{action.label}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard; 