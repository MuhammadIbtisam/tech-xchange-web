import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Empty, 
  Spin,
  Modal,
  Descriptions,
  message,
  Badge,
  Tooltip,
  Divider,
  Select,
  Input,
  Alert
} from 'antd';
import { 
  ShoppingOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  TruckOutlined, 
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;

const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'orange', icon: <ClockCircleOutlined /> },
  processing: { label: 'Processing', color: 'blue', icon: <ShoppingOutlined /> },
  shipped: { label: 'Shipped', color: 'cyan', icon: <TruckOutlined /> },
  delivered: { label: 'Delivered', color: 'green', icon: <CheckCircleOutlined /> },
  cancelled: { label: 'Cancelled', color: 'red', icon: <CloseCircleOutlined /> }
};

const BuyerOrdersPage = () => {
  const { user, token } = useAuth();
  const { orders: contextOrders, loading: contextLoading, getOrders, updateOrder } = useOrder();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading buyer orders...');
      
      let ordersData = [];
      
      // Try to get orders from backend first
      try {
        const backendResponse = await orderService.getBuyerOrders(token);
        console.log('📦 Backend response:', backendResponse);
        console.log('🔍 Backend response keys:', Object.keys(backendResponse));
        console.log('🔍 Backend response.data keys:', backendResponse?.data ? Object.keys(backendResponse.data) : 'No data');
        
        if (backendResponse && backendResponse.data && backendResponse.data.orders) {
          console.log('✅ Found orders in backendResponse.data.orders');
          ordersData = backendResponse.data.orders;
        } else if (backendResponse && backendResponse.orders) {
          console.log('✅ Found orders in backendResponse.orders');
          ordersData = backendResponse.orders;
        } else if (backendResponse && Array.isArray(backendResponse)) {
          console.log('✅ Backend response is an array');
          ordersData = backendResponse;
        } else if (backendResponse && backendResponse.data) {
          console.log('✅ Found data in backendResponse.data');
          ordersData = backendResponse.data;
        } else {
          console.log('❌ No orders found in backend, trying context...');
          ordersData = [];
        }
        
        console.log('📋 Final ordersData from backend:', ordersData);
        
      } catch (apiError) {
        console.log('🔄 Backend API failed:', apiError);
        console.log('🔄 API Error details:', apiError.message, apiError.response);
        console.log('🔄 Falling back to context orders...');
        
        // Fallback: Get orders from context (local storage)
        console.log('🔄 About to call getOrders with:', { userId: user._id, userRole: 'buyer' });
        const contextOrders = getOrders(user._id, 'buyer');
        console.log('🔄 Context orders for buyer:', contextOrders);
        console.log('🔄 User ID:', user._id);
        console.log('🔄 User role:', user.role);
        console.log('🔄 getOrders function:', typeof getOrders);
        
        if (contextOrders.length > 0) {
          ordersData = contextOrders;
          message.info('Showing orders from local storage (backend not available)');
        } else {
          ordersData = [];
          message.info('No orders found. Backend buyer orders endpoint not available yet.');
        }
      }
      
      // Ensure ordersData is an array before setting state
      if (!Array.isArray(ordersData)) {
        console.log('⚠️ ordersData is not an array, converting to empty array');
        ordersData = [];
      }
      
      console.log('🚀 Setting orders state with:', ordersData);
      setOrders(ordersData);
      
      // Check the actual orders that were set
      if (ordersData.length === 0) {
        message.info('No orders found. You haven\'t placed any orders yet.');
      } else {
        console.log(`✅ Loaded ${ordersData.length} orders for buyer`);
      }
      
    } catch (error) {
      console.error('❌ Error loading buyer orders:', error);
      message.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDetailModal(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      // Try to cancel via API first
      try {
        await orderService.cancelOrder(orderId, token);
        message.success('Order cancelled successfully via API');
      } catch (apiError) {
        console.log('API cancellation failed, updating locally:', apiError.message);
        // Fallback to local update
        message.info('Order cancelled locally (API not available)');
      }
      
      // Update order status locally
      updateOrder(orderId, { status: 'cancelled' });
      
      message.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      message.error('Failed to cancel order');
    }
  };

  const getFilteredOrders = () => {
    // Ensure orders is always an array
    let filtered = Array.isArray(orders) ? orders : [];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    if (searchText) {
      filtered = filtered.filter(order => 
        (order.productName && order.productName.toLowerCase().includes(searchText.toLowerCase())) ||
        (order._id && order._id.includes(searchText))
      );
    }
    
    return filtered;
  };

  const getOrderStats = () => {
    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : [];
    
    const total = ordersArray.length;
    const pending = ordersArray.filter(o => o.status === 'pending').length;
    const processing = ordersArray.filter(o => o.status === 'processing').length;
    const shipped = ordersArray.filter(o => o.status === 'shipped').length;
    const delivered = ordersArray.filter(o => o.status === 'delivered').length;
    const cancelled = ordersArray.filter(o => o.status === 'cancelled').length;

    return { total, pending, processing, shipped, delivered, cancelled };
  };

  // Debug: Log orders state
  console.log('🔍 Current buyer orders state:', orders, 'Type:', typeof orders, 'IsArray:', Array.isArray(orders));
  
  // Safety check: Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  console.log('🔍 Safe buyer orders array:', safeOrders, 'Length:', safeOrders.length);
  
  const stats = getOrderStats();
  const filteredOrders = getFilteredOrders();

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => (
        <Tooltip title="Click to copy full ID">
          <Text 
            code 
            copyable={{ text: id }}
            style={{ cursor: 'pointer' }}
            onClick={() => navigator.clipboard.writeText(id)}
          >
            {id}
          </Text>
        </Tooltip>
      ),
      width: 200
    },
    {
      title: 'Debug',
      key: 'debug',
      render: (_, record) => (
        <Tooltip title="Click to see raw data">
          <Button 
            size="small" 
            type="text"
            onClick={() => {
              console.log('🔍 Raw buyer order data:', record);
              message.info('Check console for raw data');
            }}
          >
            View Data
          </Button>
        </Tooltip>
      ),
      width: 100
    },
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      render: (productId, record) => (
        <div>
          <Text strong>
            {productId?.name || record.productName || `Product #${productId?._id?.substring(0, 8)}...`}
          </Text>
          {productId?.description && (
            <>
              <br />
              <Text type="secondary" className="text-xs">
                {productId.description.substring(0, 50)}...
              </Text>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => <Text strong>{quantity || 1}</Text>,
      width: 80,
      align: 'center'
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount, record) => {
        const total = amount || (record.quantity * (record.unitPrice || record.price || 0));
        return <Text strong className="text-green-600">£{total.toFixed(2)}</Text>;
      },
      width: 100,
      align: 'right'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={ORDER_STATUS[status]?.color} icon={ORDER_STATUS[status]?.icon}>
          {ORDER_STATUS[status]?.label}
        </Tag>
      ),
      width: 120
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Badge 
          status={status === 'paid' ? 'success' : 'processing'} 
          text={status === 'paid' ? 'Paid' : 'Pending'} 
        />
      ),
      width: 100
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        try {
          if (!date) return 'No date';
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) return 'Invalid date';
          return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (error) {
          return 'Invalid date';
        }
      },
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewOrder(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Cancel Order">
              <Button 
                type="text" 
                danger 
                icon={<CloseCircleOutlined />} 
                onClick={() => handleCancelOrder(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
      width: 120
    }
  ];

  // Don't render until orders are properly loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <Spin size="large" tip="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="text-gray-800 mb-2">
            My Orders
          </Title>
          <Text className="text-gray-600">
            Track your orders and manage your purchases
          </Text>
        </div>

        {/* Data Info Alert */}
        <Alert
          message="Order Data Notice"
          description="This page shows your order history. Product names may be limited - click 'View Data' on any order to see the complete data structure. Orders are loaded from backend API with fallback to local storage."
          type="info"
          showIcon
          className="mb-6"
          action={
            <Button size="small" type="link" onClick={() => {
              console.log('🔍 Current buyer order data structure:', orders[0]);
              message.info('Check console for data structure');
            }}>
              View Data Structure
            </Button>
          }
        />

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Orders"
                value={stats.total}
                prefix={<ShoppingOutlined />}
                styles={{ content: { color: '#1890ff' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                styles={{ content: { color: '#fa8c16' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Processing"
                value={stats.processing}
                prefix={<ShoppingOutlined />}
                styles={{ content: { color: '#1890ff' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Shipped"
                value={stats.shipped}
                prefix={<TruckOutlined />}
                styles={{ content: { color: '#13c2c2' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Delivered"
                value={stats.delivered}
                prefix={<CheckCircleOutlined />}
                styles={{ content: { color: '#52c41a' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Cancelled"
                value={stats.cancelled}
                prefix={<CloseCircleOutlined />}
                styles={{ content: { color: '#ff4d4f' } }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Text strong>Filter by Status:</Text>
              <div className="mt-2">
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: '100%' }}
                  options={[
                    { label: 'All Orders', value: 'all' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Processing', value: 'processing' },
                    { label: 'Shipped', value: 'shipped' },
                    { label: 'Delivered', value: 'delivered' },
                    { label: 'Cancelled', value: 'cancelled' }
                  ]}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text strong>Search:</Text>
              <div className="mt-2">
                <Input
                  placeholder="Search orders..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<FilterOutlined />}
                />
              </div>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={loadOrders}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Text className="text-gray-500">
                  Showing {filteredOrders.length} of {orders.length} orders
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Orders Table */}
        <Card>
          {loading || contextLoading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-4">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Empty
              description="No orders found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredOrders}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} orders`
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </Card>

        {/* Order Detail Modal */}
        <Modal
          title="Order Details"
          open={orderDetailModal}
          onCancel={() => setOrderDetailModal(false)}
          footer={[
            <Button key="close" onClick={() => setOrderDetailModal(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedOrder && (
            <div>
              <Descriptions title="Order Information" bordered column={2}>
                <Descriptions.Item label="Order ID" span={2}>
                  <Text code>{selectedOrder._id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Product">
                  {selectedOrder.productName}
                </Descriptions.Item>
                <Descriptions.Item label="Quantity">
                  {selectedOrder.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  <Text strong>£{selectedOrder.totalAmount.toFixed(2)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {selectedOrder.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Order Status">
                  <Tag color={ORDER_STATUS[selectedOrder.status]?.color}>
                    {ORDER_STATUS[selectedOrder.status]?.label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Badge 
                    status={selectedOrder.paymentStatus === 'paid' ? 'success' : 'processing'} 
                    text={selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Pending'} 
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Order Date">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </Descriptions.Item>
                {selectedOrder.estimatedDelivery && (
                  <Descriptions.Item label="Estimated Delivery">
                    {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider />

              <Descriptions title="Shipping Address" bordered column={1}>
                <Descriptions.Item label="Street">
                  {selectedOrder.shippingAddress.street}
                </Descriptions.Item>
                <Descriptions.Item label="City">
                  {selectedOrder.shippingAddress.city}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {selectedOrder.shippingAddress.state}
                </Descriptions.Item>
                <Descriptions.Item label="ZIP Code">
                  {selectedOrder.shippingAddress.zipCode}
                </Descriptions.Item>
                <Descriptions.Item label="Country">
                  {selectedOrder.shippingAddress.country}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedOrder.shippingAddress.phone}
                </Descriptions.Item>
              </Descriptions>

              {/* Order Progress */}
              <Divider />
              <div>
                <Text strong>Order Progress</Text>
                <div className="mt-4">
                  <Progress
                    percent={
                      selectedOrder.status === 'pending' ? 25 :
                      selectedOrder.status === 'processing' ? 50 :
                      selectedOrder.status === 'shipped' ? 75 :
                      selectedOrder.status === 'delivered' ? 100 :
                      selectedOrder.status === 'cancelled' ? 0 : 0
                    }
                    status={
                      selectedOrder.status === 'cancelled' ? 'exception' :
                      selectedOrder.status === 'delivered' ? 'success' : 'active'
                    }
                    strokeColor={
                      selectedOrder.status === 'cancelled' ? '#ff4d4f' :
                      selectedOrder.status === 'delivered' ? '#52c41a' : '#1890ff'
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default BuyerOrdersPage;
