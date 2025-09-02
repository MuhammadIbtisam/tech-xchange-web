import React from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Avatar, Button, Table, Tag, Badge } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, RiseOutlined, ShopOutlined, EyeOutlined, TeamOutlined, CheckOutlined, ClockCircleOutlined, HeartOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Dashboard = ({ onNavigate }) => {
  const { user, isSeller, isBuyer, isAdmin } = useAuth();

  // Role-specific statistics - only relevant data
  const getRoleStats = () => {
    if (isSeller) {
      return [
        {
          title: 'Active Products',
          value: 8,
          prefix: <ShopOutlined />,
          color: '#1890ff',
          relevant: true
        },
        {
          title: 'Pending Orders',
          value: 3,
          prefix: <ClockCircleOutlined />,
          color: '#fa8c16',
          relevant: true
        },
        {
          title: 'Monthly Revenue',
          value: '£2,847',
          prefix: <DollarOutlined />,
          color: '#52c41a',
          relevant: true
        },
        {
          title: 'Product Views',
          value: 156,
          prefix: <EyeOutlined />,
          color: '#faad14',
          relevant: true
        }
      ];
    } else if (isBuyer) {
      return [
        {
          title: 'Active Orders',
          value: 3,
          prefix: <ShoppingCartOutlined />,
          color: '#1890ff',
          relevant: true
        },
        {
          title: 'Total Spent',
          value: '£1,247',
          prefix: <DollarOutlined />,
          color: '#52c41a',
          relevant: true
        },
        {
          title: 'Saved Items',
          value: 5,
          prefix: <EyeOutlined />,
          color: '#eb2f96',
          relevant: true
        },
        {
          title: 'Reviews Given',
          value: 2,
          prefix: <UserOutlined />,
          color: '#faad14',
          relevant: true
        }
      ];
    } else if (isAdmin) {
      return [
        {
          title: 'Total Users',
          value: 247,
          prefix: <TeamOutlined />,
          color: '#1890ff',
          relevant: true
        },
        {
          title: 'Pending Approvals',
          value: 8,
          prefix: <ClockCircleOutlined />,
          color: '#fa8c16',
          relevant: true
        },
        {
          title: 'Platform Revenue',
          value: '£12,450',
          prefix: <DollarOutlined />,
          color: '#52c41a',
          relevant: true
        },
        {
          title: 'Active Products',
          value: 142,
          prefix: <ShopOutlined />,
          color: '#faad14',
          relevant: true
        }
      ];
    }
    return [];
  };

  // Role-specific recent data - only relevant information
  const getRecentData = () => {
    if (isSeller) {
      return [
        { type: 'Order', detail: 'New order for Lenovo ThinkPad', time: '2 min ago', status: 'pending' },
        { type: 'Product', detail: 'MacBook Air approved', time: '5 min ago', status: 'approved' },
        { type: 'View', detail: 'High traffic on Dell XPS', time: '10 min ago', status: 'info' }
      ];
    } else if (isBuyer) {
      return [
        { type: 'Order', detail: 'Lenovo ThinkPad shipped', time: '2 min ago', status: 'shipped' },
        { type: 'Payment', detail: 'Payment completed', time: '5 min ago', status: 'completed' },
        { type: 'Delivery', detail: 'Sony headphones delivered', time: '10 min ago', status: 'delivered' }
      ];
    } else if (isAdmin) {
      return [
        { type: 'User', detail: 'New seller registered', time: '2 min ago', status: 'pending' },
        { type: 'Product', detail: 'Gaming laptop approved', time: '5 min ago', status: 'approved' },
        { type: 'System', detail: 'Database backup completed', time: '10 min ago', status: 'completed' }
      ];
    }
    return [];
  };

  // Role-specific quick actions - only relevant functions
  const getQuickActions = () => {
    if (isSeller) {
      return [
        { icon: <ShopOutlined />, label: 'Add Product', action: () => onNavigate('5') }, // My Products
        { icon: <ShoppingCartOutlined />, label: 'View Orders', action: () => onNavigate('6') }, // Incoming Orders
        { icon: <UserOutlined />, label: 'Profile', action: () => onNavigate('3') } // Profile
      ];
    } else if (isBuyer) {
      return [
        { icon: <ShoppingCartOutlined />, label: 'Browse Products', action: () => onNavigate('2') }, // Products
        { icon: <EyeOutlined />, label: 'My Orders', action: () => onNavigate('7') }, // My Orders
        { icon: <HeartOutlined />, label: 'Saved Items', action: () => onNavigate('9') } // Saved Items
      ];
    } else if (isAdmin) {
      return [
        { icon: <CheckOutlined />, label: 'Review Products', action: () => onNavigate('8') }, // Product Management
        { icon: <TeamOutlined />, label: 'Manage Users', action: () => onNavigate('3') }, // Profile (closest to user management)
        { icon: <EyeOutlined />, label: 'System Status', action: () => onNavigate('4') } // Settings
      ];
    }
    return [];
  };

  // Role-specific progress data - only relevant metrics
  const getProgressData = () => {
    if (isSeller) {
      return [
        { label: 'Sales Target', percent: 75, color: '#52c41a' },
        { label: 'Product Growth', percent: 60, color: '#1890ff' },
        { label: 'Customer Satisfaction', percent: 90, color: '#faad14' }
      ];
    } else if (isBuyer) {
      return [
        { label: 'Monthly Budget', percent: 65, color: '#52c41a' },
        { label: 'Order Goal', percent: 80, color: '#1890ff' },
        { label: 'Review Goal', percent: 90, color: '#faad14' }
      ];
    } else if (isAdmin) {
      return [
        { label: 'Platform Growth', percent: 85, color: '#52c41a' },
        { label: 'User Engagement', percent: 72, color: '#1890ff' },
        { label: 'System Performance', percent: 95, color: '#faad14' }
      ];
    }
    return [];
  };

  const stats = getRoleStats();
  const recentData = getRecentData();
  const quickActions = getQuickActions();
  const progressData = getProgressData();

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      shipped: 'blue',
      delivered: 'green',
      completed: 'green',
      info: 'blue'
    };
    return colors[status] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section - Role-specific */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <Title level={2} className="text-white mb-2">
          Welcome back, {user?.firstName || user?.fullName || 'User'}! 👋
        </Title>
        <Text className="text-blue-100">
          {isSeller && "Here's your business overview for today."}
          {isBuyer && "Here's your shopping summary for today."}
          {isAdmin && "Here's your platform overview for today."}
        </Text>
      </Card>

      {/* Key Statistics - Only relevant metrics */}
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
            </Card>
          </Col>
        ))}
      </Row>

      {/* Progress and Recent Activity - Only relevant data */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={isSeller ? "Business Goals" : isBuyer ? "Shopping Goals" : "Platform Goals"} className="h-full">
            <Space orientation="vertical" className="w-full">
              {progressData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <Text>{item.label}</Text>
                    <Text>{item.percent}%</Text>
                  </div>
                  <Progress percent={item.percent} strokeColor={item.color} />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" className="h-full">
            <Space orientation="vertical" className="w-full">
              {recentData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Tag color={getStatusColor(item.status)} size="small">
                    {item.type}
                  </Tag>
                  <div className="flex-1">
                    <Text>{item.detail}</Text>
                  </div>
                  <Text className="text-gray-400 text-sm">{item.time}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions - Only relevant actions */}
      <Card title="Quick Actions">
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card 
                className="text-center hover:shadow-md transition-shadow cursor-pointer"
                onClick={action.action}
              >
                <div className="text-2xl text-blue-500 mb-2">
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