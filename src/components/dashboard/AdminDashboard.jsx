import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Button, 
  Space, 
  Progress, 
  Alert,
  Spin,
  Empty,
  Typography,
  Tag,
  Badge,
  Avatar,
  List,
  Tabs,
  Timeline
} from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  UserOutlined,
  StarOutlined,
  SettingOutlined,
  BarChartOutlined,
  TeamOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalBuyers: 0,
    totalProducts: 0,
    pendingApprovals: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    platformFee: 0,
    activeListings: 0,
    totalCategories: 0,
    totalBrands: 0
  });
  const [pendingProducts, setPendingProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load admin statistics and data
      await Promise.all([
        loadAdminStats(),
        loadPendingProducts(),
        loadRecentUsers(),
        loadSystemAlerts(),
        loadRecentActivity()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      // This would call your backend API for admin statistics
      // For now, using realistic mock data
      setStats({
        totalUsers: 247,
        totalSellers: 23,
        totalBuyers: 224,
        totalProducts: 156,
        pendingApprovals: 8,
        totalOrders: 89,
        totalRevenue: 12450.75,
        monthlyRevenue: 2847.50,
        platformFee: 622.54,
        activeListings: 142,
        totalCategories: 8,
        totalBrands: 15
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const loadPendingProducts = async () => {
    try {
      // Mock data for pending products - more realistic
      setPendingProducts([
        {
          _id: '1',
          name: 'Gaming Laptop RTX 4080',
          seller: 'GamingStore',
          price: 2499.99,
          category: 'Laptops',
          submittedDate: '2024-01-15',
          priority: 'high'
        },
        {
          _id: '2',
          name: 'Wireless Earbuds Pro',
          seller: 'AudioWorld',
          price: 199.99,
          category: 'Audio',
          submittedDate: '2024-01-14',
          priority: 'medium'
        },
        {
          _id: '3',
          name: 'Smart Watch Series 8',
          seller: 'TechHub',
          price: 399.99,
          category: 'Wearables',
          submittedDate: '2024-01-13',
          priority: 'low'
        },
        {
          _id: '4',
          name: '4K Action Camera',
          seller: 'AdventureGear',
          price: 299.99,
          category: 'Cameras',
          submittedDate: '2024-01-12',
          priority: 'medium'
        }
      ]);
    } catch (error) {
      console.error('Error loading pending products:', error);
    }
  };

  const loadRecentUsers = async () => {
    try {
      // Mock data for recent users - more realistic
      setRecentUsers([
        {
          _id: '1',
          name: 'John Smith',
          email: 'john@techstore.com',
          role: 'seller',
          status: 'active',
          joinDate: '2024-01-15',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          role: 'buyer',
          status: 'active',
          joinDate: '2024-01-14',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop'
        },
        {
          _id: '3',
          name: 'Mike Chen',
          email: 'mike@audioworld.com',
          role: 'seller',
          status: 'pending',
          joinDate: '2024-01-13',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        {
          _id: '4',
          name: 'Emma Wilson',
          email: 'emma.w@email.com',
          role: 'buyer',
          status: 'active',
          joinDate: '2024-01-12',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        }
      ]);
    } catch (error) {
      console.error('Error loading recent users:', error);
    }
  };

  const loadSystemAlerts = async () => {
    try {
      // Mock data for system alerts - more realistic
      setSystemAlerts([
        {
          id: '1',
          type: 'warning',
          message: 'High server load detected',
          description: 'Server CPU usage is at 78% - monitoring closely',
          timestamp: '2024-01-15 14:30'
        },
        {
          id: '2',
          type: 'info',
          message: 'Database backup completed',
          description: 'Daily backup completed successfully at 02:00 AM',
          timestamp: '2024-01-15 02:00'
        },
        {
          id: '3',
          type: 'success',
          message: 'New user registration spike',
          description: '15 new users registered in the last hour',
          timestamp: '2024-01-15 13:45'
        },
        {
          id: '4',
          type: 'info',
          message: 'Payment system maintenance',
          description: 'Scheduled maintenance completed successfully',
          timestamp: '2024-01-15 11:00'
        }
      ]);
    } catch (error) {
      console.error('Error loading system alerts:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Mock data for recent activity - more realistic
      setRecentActivity([
        {
          id: '1',
          action: 'Product Approved',
          description: 'Lenovo ThinkPad T14 approved by admin',
          timestamp: '2024-01-15 15:30',
          user: 'Admin User'
        },
        {
          id: '2',
          action: 'User Suspended',
          description: 'Seller account suspended for policy violation',
          timestamp: '2024-01-15 14:15',
          user: 'Admin User'
        },
        {
          id: '3',
          action: 'Category Created',
          description: 'New category "Smart Home" added',
          timestamp: '2024-01-15 13:45',
          user: 'Admin User'
        },
        {
          id: '4',
          action: 'Order Dispute Resolved',
          description: 'Customer refund processed for order #12345',
          timestamp: '2024-01-15 12:30',
          user: 'Admin User'
        },
        {
          id: '5',
          action: 'System Update',
          description: 'Platform updated to version 2.1.0',
          timestamp: '2024-01-15 10:00',
          user: 'System'
        }
      ]);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'green'
    };
    return colors[priority] || 'default';
  };

  const getAlertTypeIcon = (type) => {
    const icons = {
      warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      error: <CloseOutlined style={{ color: '#ff4d4f' }} />,
      success: <CheckOutlined style={{ color: '#52c41a' }} />,
      info: <InfoCircleOutlined style={{ color: '#1890ff' }} />
    };
    return icons[type] || <InfoCircleOutlined />;
  };

  const pendingProductColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'Seller',
      dataIndex: 'seller',
      key: 'seller'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text strong>£{price.toFixed(2)}</Text>
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedDate',
      key: 'submittedDate'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>
            Review
          </Button>
          <Button size="small" type="primary" icon={<CheckOutlined />}>
            Approve
          </Button>
          <Button size="small" danger icon={<CloseOutlined />}>
            Reject
          </Button>
        </Space>
      )
    }
  ];

  const userColumns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} size={40} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'seller' ? 'blue' : 'green'}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>
            View
          </Button>
          <Button size="small" icon={<SettingOutlined />}>
            Manage
          </Button>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <div className="mt-4">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Admin Dashboard 🛡️</Title>
        <Text type="secondary">Monitor platform performance, manage users, and oversee system operations.</Text>
      </div>

      {/* Key Platform Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="GBP"
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={stats.pendingApprovals}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue & Platform Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card title="Monthly Revenue">
            <div className="mb-4">
              <Text>Target: £15,000</Text>
              <div className="mt-2">
                <Progress 
                  percent={Math.round((stats.monthlyRevenue / 15000) * 100)} 
                  status="active"
                  strokeColor="#52c41a"
                />
              </div>
              <Text strong>Current: £{stats.monthlyRevenue.toFixed(2)}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Platform Performance">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text>Active Listings</Text>
                <Badge count={stats.activeListings} color="#52c41a" />
              </div>
              <div className="flex justify-between items-center">
                <Text>Categories</Text>
                <Badge count={stats.totalCategories} color="#1890ff" />
              </div>
              <div className="flex justify-between items-center">
                <Text>Brands</Text>
                <Badge count={stats.totalBrands} color="#13c2c2" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="User Distribution">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text>Sellers</Text>
                <Badge count={stats.totalSellers} color="#1890ff" />
              </div>
              <div className="flex justify-between items-center">
                <Text>Buyers</Text>
                <Badge count={stats.totalBuyers} color="#52c41a" />
              </div>
              <div className="flex justify-between items-center">
                <Text>Platform Fee</Text>
                <Text strong>£{stats.platformFee.toFixed(2)}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card title="Quick Actions">
            <Space size="large">
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                size="large"
                onClick={() => navigate('/admin/products')}
              >
                Review Pending Products
              </Button>
              <Button 
                icon={<TeamOutlined />} 
                size="large"
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                size="large"
                onClick={() => navigate('/admin/analytics')}
              >
                View Analytics
              </Button>
              <Button 
                icon={<SettingOutlined />} 
                size="large"
                onClick={() => navigate('/settings')}
              >
                System Settings
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs defaultActiveKey="1" size="large">
          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined />
                Pending Approvals ({pendingProducts.length})
              </span>
            } 
            key="1"
          >
            <div className="mb-4">
              <Alert
                message={`${pendingProducts.length} products awaiting approval`}
                description="Review and approve new product submissions from sellers."
                type="info"
                showIcon
                className="mb-4"
              />
            </div>
            <Table
              columns={pendingProductColumns}
              dataSource={pendingProducts}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Recent Users
              </span>
            } 
            key="2"
          >
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <SafetyOutlined />
                System Alerts
              </span>
            } 
            key="3"
          >
            <List
              dataSource={systemAlerts}
              renderItem={(alert) => (
                <List.Item
                  actions={[
                    <Button size="small" type="link">
                      View Details
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={getAlertTypeIcon(alert.type)}
                    title={alert.message}
                    description={
                      <div>
                        <Text>{alert.description}</Text>
                        <br />
                        <Text type="secondary">{alert.timestamp}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                Recent Activity
              </span>
            } 
            key="4"
          >
            <Timeline>
              {recentActivity.map((activity) => (
                <Timeline.Item 
                  key={activity.id}
                  color="blue"
                  dot={<UserOutlined />}
                >
                  <div className="mb-2">
                    <Text strong>{activity.action}</Text>
                    <br />
                    <Text>{activity.description}</Text>
                    <br />
                    <Text type="secondary">
                      {activity.timestamp} by {activity.user}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* System Health Alerts */}
      {systemAlerts.length > 0 && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <Alert
              message="System Status"
              description="Monitor system health and performance metrics."
              type="info"
              showIcon
              className="mb-4"
            />
            {systemAlerts.map((alert) => (
              <Alert
                key={alert.id}
                message={alert.message}
                description={alert.description}
                type={alert.type}
                showIcon
                className="mb-2"
                action={
                  <Button size="small" type="link">
                    Dismiss
                  </Button>
                }
              />
            ))}
          </Col>
        </Row>
      )}

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={12}>
          <Card title="Platform Growth">
            <div className="space-y-4">
              <div>
                <Text>User Growth Rate</Text>
                <Progress percent={75} status="active" />
              </div>
              <div>
                <Text>Product Growth Rate</Text>
                <Progress percent={68} status="active" />
              </div>
              <div>
                <Text>Revenue Growth Rate</Text>
                <Progress percent={82} status="active" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Quick Stats">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text>Average Order Value</Text>
                <Text strong>£{(stats.totalRevenue / stats.totalOrders).toFixed(2)}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Products per Seller</Text>
                <Text strong>{(stats.totalProducts / stats.totalSellers).toFixed(1)}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Orders per Buyer</Text>
                <Text strong>{(stats.totalOrders / stats.totalBuyers).toFixed(1)}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
