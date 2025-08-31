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
  Badge
} from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined,
  TrendingUpOutlined,
  UserOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SellerDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingApproval: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalViews: 0,
    averageRating: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load seller statistics and data
      await Promise.all([
        loadSellerStats(),
        loadRecentOrders(),
        loadRecentProducts(),
        loadLowStockProducts()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerStats = async () => {
    try {
      // This would call your backend API for seller statistics
      // For now, using realistic mock data
      setStats({
        totalProducts: 8,
        activeProducts: 6,
        pendingApproval: 2,
        totalOrders: 23,
        pendingOrders: 3,
        confirmedOrders: 2,
        shippedOrders: 8,
        deliveredOrders: 10,
        totalRevenue: 2847.50,
        monthlyRevenue: 847.25,
        totalViews: 156,
        averageRating: 4.2
      });
    } catch (error) {
      console.error('Error loading seller stats:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      // Mock data for recent orders - more realistic
      setRecentOrders([
        {
          _id: '1',
          buyerName: 'Alex Thompson',
          productName: 'Lenovo ThinkPad T14',
          status: 'shipped',
          amount: 899.99,
          date: '2024-01-15',
          estimatedDelivery: '2024-01-20'
        },
        {
          _id: '2',
          buyerName: 'Maria Rodriguez',
          productName: 'Dell XPS 13',
          status: 'confirmed',
          amount: 1299.99,
          date: '2024-01-14',
          estimatedDelivery: '2024-01-18'
        },
        {
          _id: '3',
          buyerName: 'David Chen',
          productName: 'MacBook Air M1',
          status: 'pending',
          amount: 999.99,
          date: '2024-01-13',
          estimatedDelivery: '2024-01-17'
        }
      ]);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const loadRecentProducts = async () => {
    try {
      // Mock data for recent products - more realistic
      setRecentProducts([
        {
          _id: '1',
          name: 'Lenovo ThinkPad T14',
          status: 'approved',
          views: 45,
          rating: 4.3
        },
        {
          _id: '2',
          name: 'Dell XPS 13',
          status: 'approved',
          views: 38,
          rating: 4.1
        },
        {
          _id: '3',
          name: 'MacBook Air M1',
          status: 'pending',
          views: 12,
          rating: 4.5
        }
      ]);
    } catch (error) {
      console.error('Error loading recent products:', error);
    }
  };

  const loadLowStockProducts = async () => {
    try {
      // Mock data for low stock products - more realistic
      setLowStockProducts([
        {
          _id: '1',
          name: 'Lenovo ThinkPad T14',
          stock: 1,
          threshold: 3
        },
        {
          _id: '2',
          name: 'Dell XPS 13',
          stock: 2,
          threshold: 3
        }
      ]);
    } catch (error) {
      console.error('Error loading low stock products:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'red',
      approved: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      confirmed: <CheckCircleOutlined />,
      shipped: <TruckOutlined />,
      delivered: <CheckCircleOutlined />,
      cancelled: <CloseCircleOutlined />,
      approved: <CheckCircleOutlined />,
      rejected: <CloseCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <Text code>{id}</Text>
    },
    {
      title: 'Buyer',
      dataIndex: 'buyerName',
      key: 'buyerName'
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>£{amount.toFixed(2)}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>
            View
          </Button>
          {record.status === 'pending' && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />}>
              Confirm
            </Button>
          )}
        </Space>
      )
    }
  ];

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      render: (views) => <Text>{views}</Text>
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <Text>{rating}</Text>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>
            View
          </Button>
          <Button size="small" icon={<EditOutlined />}>
            Edit
          </Button>
        </Space>
      )
    }
  ];

  const lowStockColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Current Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <Badge 
          count={stock} 
          showZero 
          color={stock <= record.threshold ? '#ff4d4f' : '#52c41a'}
        />
      )
    },
    {
      title: 'Threshold',
      dataIndex: 'threshold',
      key: 'threshold'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button size="small" type="primary" icon={<PlusOutlined />}>
          Restock
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <div className="mt-4">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Welcome back, {user?.firstName || 'Seller'}! 👋</Title>
        <Text type="secondary">Here's what's happening with your business today.</Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Orders"
              value={stats.totalOrders}
              prefix={<TrendingUpOutlined />}
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
              title="Average Rating"
              value={stats.averageRating}
              prefix={<StarOutlined />}
              precision={1}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Progress */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Monthly Revenue Progress">
            <div className="mb-4">
              <Text>Target: £1,500</Text>
              <div className="mt-2">
                <Progress 
                  percent={Math.round((stats.monthlyRevenue / 1500) * 100)} 
                  status="active"
                  strokeColor="#52c41a"
                />
              </div>
              <Text strong>Current: £{stats.monthlyRevenue.toFixed(2)}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Order Status Distribution">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text>Pending</Text>
                <Badge count={stats.pendingOrders} color="#fa8c16" />
              </div>
              <div className="flex justify-between items-center">
                <Text>Confirmed</Text>
                <Badge count={stats.confirmedOrders} color="#1890ff" />
              </div>
              <div className="flex justify-between items-center">
                <Text>Shipped</Text>
                <Badge count={stats.shippedOrders} color="#13c2c2" />
              </div>
              <div className="flex justify-between items-center">
                <Text>Delivered</Text>
                <Badge count={stats.deliveredOrders} color="#52c41a" />
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
              <Button type="primary" icon={<PlusOutlined />} size="large">
                Add New Product
              </Button>
              <Button icon={<ShoppingOutlined />} size="large">
                View All Orders
              </Button>
              <Button icon={<TrendingUpOutlined />} size="large">
                View Analytics
              </Button>
              <Button icon={<UserOutlined />} size="large">
                Manage Profile
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card 
            title="Recent Orders" 
            extra={
              <Button type="link" onClick={() => navigate('/seller/orders')}>
                View All Orders
              </Button>
            }
          >
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Product Management */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card 
            title="Recent Products" 
            extra={
              <Button type="link" onClick={() => navigate('/seller/products')}>
                View All Products
              </Button>
            }
          >
            <Table
              columns={productColumns}
              dataSource={recentProducts}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Low Stock Alert" 
            extra={
              <Button type="link" onClick={() => navigate('/seller/products')}>
                Manage Stock
              </Button>
            }
          >
            {lowStockProducts.length > 0 ? (
              <Table
                columns={lowStockColumns}
                dataSource={lowStockProducts}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="All products have sufficient stock" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.pendingApproval > 0 && (
        <Alert
          message={`${stats.pendingApproval} products pending approval`}
          description="You have products waiting for admin approval. This may affect your sales."
          type="warning"
          showIcon
          className="mb-6"
          action={
            <Button size="small" type="link">
              View Pending
            </Button>
          }
        />
      )}

      {lowStockProducts.length > 0 && (
        <Alert
          message={`${lowStockProducts.length} products running low on stock`}
          description="Consider restocking these products to avoid losing sales."
          type="info"
          showIcon
          className="mb-6"
          action={
            <Button size="small" type="link">
              Restock Now
            </Button>
          }
        />
      )}
    </div>
  );
};

export default SellerDashboard;
