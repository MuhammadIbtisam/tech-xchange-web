import React from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Avatar } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: 1128,
      prefix: <UserOutlined />,
      color: '#1890ff',
      increase: '+12%',
    },
    {
      title: 'Total Sales',
      value: 9320,
      prefix: <DollarOutlined />,
      color: '#52c41a',
      increase: '+8%',
    },
    {
      title: 'Orders',
      value: 456,
      prefix: <ShoppingCartOutlined />,
      color: '#faad14',
      increase: '+23%',
    },
    {
      title: 'Growth',
      value: 15.3,
      prefix: <RiseOutlined />,
      color: '#f5222d',
      increase: '+5%',
    },
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'placed an order', time: '2 minutes ago', avatar: 'JD' },
    { user: 'Jane Smith', action: 'updated profile', time: '5 minutes ago', avatar: 'JS' },
    { user: 'Mike Johnson', action: 'completed payment', time: '10 minutes ago', avatar: 'MJ' },
    { user: 'Sarah Wilson', action: 'left a review', time: '15 minutes ago', avatar: 'SW' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <Title level={2} className="text-white mb-2">
          Welcome back! 👋
        </Title>
        <Text className="text-blue-100">
          Here's what's happening with your projects today.
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
                valueStyle={{ color: stat.color }}
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
          <Card title="Monthly Goals" className="h-full">
            <Space direction="vertical" className="w-full">
              <div>
                <div className="flex justify-between mb-2">
                  <Text>Sales Target</Text>
                  <Text>75%</Text>
                </div>
                <Progress percent={75} strokeColor="#52c41a" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <Text>User Growth</Text>
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
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" className="h-full">
            <Space direction="vertical" className="w-full">
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
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="text-center hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => console.log('Add User clicked')}
            >
              <UserOutlined className="text-2xl text-blue-500 mb-2" />
              <div>Add User</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="text-center hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => console.log('Create Order clicked')}
            >
              <ShoppingCartOutlined className="text-2xl text-green-500 mb-2" />
              <div>Create Order</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="text-center hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => console.log('Generate Report clicked')}
            >
              <RiseOutlined className="text-2xl text-orange-500 mb-2" />
              <div>Generate Report</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="text-center hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => console.log('Settings clicked')}
            >
              <DollarOutlined className="text-2xl text-purple-500 mb-2" />
              <div>Billing</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard; 