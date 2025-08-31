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
  List
} from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  EyeOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined,
  StarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const BuyerDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
    savedItems: 0,
    totalReviews: 0,
    cartItems: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load buyer statistics and data
      await Promise.all([
        loadBuyerStats(),
        loadRecentOrders(),
        loadSavedItems(),
        loadRecommendations(),
        loadOrderHistory()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerStats = async () => {
    try {
      // This would call your backend API for buyer statistics
      // For now, using realistic mock data
      setStats({
        totalOrders: 5,
        pendingOrders: 1,
        confirmedOrders: 1,
        shippedOrders: 1,
        deliveredOrders: 2,
        totalSpent: 1247.85,
        savedItems: 3,
        totalReviews: 2,
        cartItems: 0 // Initialize cartItems
      });
    } catch (error) {
      console.error('Error loading buyer stats:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      // Mock data for recent orders - more realistic and consistent
      setRecentOrders([
        {
          _id: '1',
          productName: 'Lenovo ThinkPad T14',
          sellerName: 'TechStore London',
          status: 'shipped',
          amount: 899.99,
          date: '2024-01-15',
          estimatedDelivery: '2024-01-20'
        },
        {
          _id: '2',
          productName: 'Sony WH-1000XM5 Headphones',
          sellerName: 'AudioPro UK',
          status: 'confirmed',
          amount: 349.99,
          date: '2024-01-14',
          estimatedDelivery: '2024-01-18'
        },
        {
          _id: '3',
          productName: 'iPad Air 5th Gen',
          sellerName: 'AppleStore Manchester',
          status: 'pending',
          amount: 599.99,
          date: '2024-01-13',
          estimatedDelivery: '2024-01-17'
        }
      ]);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const loadSavedItems = async () => {
    try {
      // Mock data for saved items - more realistic and consistent
      setSavedItems([
        {
          _id: '1',
          name: 'Samsung Galaxy S24 Ultra',
          price: 1199.99,
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
          seller: 'MobileWorld',
          rating: 4.7
        },
        {
          _id: '2',
          name: 'MacBook Air M2',
          price: 1099.99,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop',
          seller: 'TechStore London',
          rating: 4.9
        },
        {
          _id: '3',
          name: 'Nike Air Max 270',
          price: 129.99,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
          seller: 'SportsDirect',
          rating: 4.5
        }
      ]);
    } catch (error) {
      console.error('Error loading saved items:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      // Mock data for recommendations - more realistic and consistent
      setRecommendations([
        {
          _id: '1',
          name: 'Bose QuietComfort 45',
          price: 329.99,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
          seller: 'AudioPro UK',
          rating: 4.8,
          discount: '20%'
        },
        {
          _id: '2',
          name: 'Canon EOS R7',
          price: 1899.99,
          image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop',
          seller: 'CameraWorld',
          rating: 4.9,
          discount: '15%'
        },
        {
          _id: '3',
          name: 'Kindle Paperwhite',
          price: 139.99,
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=100&fit=crop',
          seller: 'BookStore UK',
          rating: 4.6,
          discount: '10%'
        }
      ]);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadOrderHistory = async () => {
    try {
      // Mock data for order history - more realistic and consistent
      setOrderHistory([
        {
          _id: '1',
          productName: 'Lenovo ThinkPad T14',
          status: 'delivered',
          amount: 899.99,
          date: '2024-01-10',
          rating: 5
        },
        {
          _id: '2',
          productName: 'Sony WH-1000XM5 Headphones',
          status: 'delivered',
          amount: 349.99,
          date: '2024-01-05',
          rating: 4
        }
      ]);
    } catch (error) {
      console.error('Error loading order history:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      confirmed: <CheckCircleOutlined />,
      shipped: <TruckOutlined />,
      delivered: <CheckCircleOutlined />,
      cancelled: <CloseCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const orderColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'Seller',
      dataIndex: 'sellerName',
      key: 'sellerName'
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
      title: 'Order Date',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Est. Delivery',
      dataIndex: 'estimatedDelivery',
      key: 'estimatedDelivery'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>
            Track
          </Button>
          {record.status === 'delivered' && (
            <Button size="small" type="primary" icon={<StarOutlined />}>
              Review
            </Button>
          )}
        </Space>
      )
    }
  ];

  const savedItemColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.image} 
            size={40}
            shape="square"
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary">{record.seller}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text strong>£{price.toFixed(2)}</Text>
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
          <Button size="small" type="primary" icon={<ShoppingCartOutlined />}>
            Buy Now
          </Button>
        </Space>
      )
    }
  ];

  const recommendationColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.image} 
            size={40}
            shape="square"
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary">{record.seller}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <div>
          <Text delete>£{(record.price * 1.2).toFixed(2)}</Text>
          <br />
          <Text strong type="danger">£{record.price.toFixed(2)}</Text>
          <Tag color="red" className="ml-2">{record.discount} OFF</Tag>
        </div>
      )
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
          <Button size="small" icon={<HeartOutlined />}>
            Save
          </Button>
          <Button size="small" type="primary" icon={<ShoppingCartOutlined />}>
            Add to Cart
          </Button>
        </Space>
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
        <Title level={2}>Welcome back, {user?.firstName || 'Buyer'}! 🛍️</Title>
        <Text type="secondary">Track your orders, discover new products, and manage your shopping experience.</Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Spent"
              value={stats.totalSpent}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="GBP"
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Saved Items"
              value={stats.savedItems}
              prefix={<HeartOutlined />}
              styles={{ content: { color: '#eb2f96' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Reviews Given"
              value={stats.totalReviews}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Cart Items"
              value={stats.cartItems}
              prefix={<ShoppingCartOutlined />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Active Orders"
              value={stats.pendingOrders + stats.confirmedOrders + stats.shippedOrders}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: '#13c2c2' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Progress */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Order Status Overview">
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
        <Col xs={24} md={12}>
          <Card title="Shopping Progress">
            <div className="mb-4">
              <Text>Monthly Budget: £500</Text>
              <div className="mt-2">
                <Progress 
                  percent={Math.min(Math.round((stats.totalSpent / 500) * 100), 100)} 
                  status={stats.totalSpent > 500 ? "exception" : "active"}
                  strokeColor={stats.totalSpent > 500 ? "#ff4d4f" : "#52c41a"}
                />
              </div>
              <Text strong>Spent: £{stats.totalSpent.toFixed(2)}</Text>
              <br />
              <Text type="secondary">
                {stats.totalSpent > 500 
                  ? `£${(stats.totalSpent - 500).toFixed(2)} over budget` 
                  : `£${(500 - stats.totalSpent).toFixed(2)} remaining`
                }
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card title="Quick Actions">
            <Space size="large">
              <Button type="primary" icon={<ShoppingCartOutlined />} size="large">
                Start Shopping
              </Button>
              <Button icon={<EyeOutlined />} size="large">
                Track Orders
              </Button>
              <Button icon={<HeartOutlined />} size="large">
                View Saved Items
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
              <Button type="link" onClick={() => navigate('/orders')}>
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

      {/* Saved Items & Recommendations */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card 
            title="Saved Items" 
            extra={
              <Button type="link" onClick={() => navigate('/saved-items')}>
                View All Saved
              </Button>
            }
          >
            {savedItems.length > 0 ? (
              <Table
                columns={savedItemColumns}
                dataSource={savedItems}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="No saved items yet" />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Recommended for You" 
            extra={
              <Button type="link" onClick={() => navigate('/products')}>
                Browse More
              </Button>
            }
          >
            {recommendations.length > 0 ? (
              <Table
                columns={recommendationColumns}
                dataSource={recommendations}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="No recommendations available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Order History */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card 
            title="Order History" 
            extra={
              <Button type="link" onClick={() => navigate('/orders')}>
                View Full History
              </Button>
            }
          >
            <List
              dataSource={orderHistory}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button size="small" icon={<EyeOutlined />}>
                      View Details
                    </Button>,
                    item.rating ? (
                      <Tag color="green">Rated: {item.rating}/5</Tag>
                    ) : (
                      <Button size="small" type="primary" icon={<StarOutlined />}>
                        Rate Order
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    title={item.productName}
                    description={
                      <Space>
                        <Tag color={getStatusColor(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Tag>
                        <Text>£{item.amount.toFixed(2)}</Text>
                        <Text type="secondary">{item.date}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.pendingOrders > 0 && (
        <Alert
          message={`${stats.pendingOrders} orders pending confirmation`}
          description="Some of your orders are waiting for seller confirmation. You'll be notified once they're processed."
          type="info"
          showIcon
          className="mb-6"
          action={
            <Button size="small" type="link">
              Track Orders
            </Button>
          }
        />
      )}

      {stats.shippedOrders > 0 && (
        <Alert
          message={`${stats.shippedOrders} orders in transit`}
          description="Your orders are on their way! Track their delivery progress."
          type="success"
          showIcon
          className="mb-6"
          action={
            <Button size="small" type="link">
              Track Delivery
            </Button>
          }
        />
      )}
    </div>
  );
};

export default BuyerDashboard;
