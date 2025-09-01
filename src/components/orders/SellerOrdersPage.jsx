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
  Form,
  InputNumber,
  DatePicker,
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
  FilterOutlined,
  EditOutlined,
  CheckOutlined,
  TruckFilled,
  DollarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;

const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'orange', icon: <ClockCircleOutlined /> },
  confirmed: { label: 'Confirmed', color: 'blue', icon: <CheckCircleOutlined /> },
  shipped: { label: 'Shipped', color: 'cyan', icon: <TruckOutlined /> },
  delivered: { label: 'Delivered', color: 'green', icon: <CheckCircleOutlined /> },
  cancelled: { label: 'Cancelled', color: 'red', icon: <CloseCircleOutlined /> }
};

const SellerOrdersPage = () => {
  const { user, token } = useAuth();
  const { getOrders } = useOrder();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailModal, setOrderDetailModal] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [statusForm] = Form.useForm();

  // Real orders will be loaded from API

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log(' Loading seller orders...');
      
      let ordersData = [];
      
      // Try to get orders from backend first
      try {
        const backendResponse = await orderService.getSellerOrders(token);
        console.log(' Backend response:', backendResponse);
        console.log(' Backend response keys:', Object.keys(backendResponse));
        console.log(' Backend response.data keys:', backendResponse?.data ? Object.keys(backendResponse.data) : 'No data');
        
        if (backendResponse && backendResponse.data && backendResponse.data.orders) {
          console.log(' Found orders in backendResponse.data.orders');
          ordersData = backendResponse.data.orders;
        } else if (backendResponse && backendResponse.orders) {
          console.log(' Found orders in backendResponse.orders');
          ordersData = backendResponse.orders;
        } else if (backendResponse && Array.isArray(backendResponse)) {
          console.log(' Backend response is an array');
          ordersData = backendResponse;
        } else if (backendResponse && backendResponse.data) {
          console.log(' Found data in backendResponse.data');
          ordersData = backendResponse.data;
        } else {
          console.log(' No orders found, setting empty array');
          ordersData = [];
        }
        
        console.log('📋 Final ordersData:', ordersData);
        console.log(' Type of ordersData:', typeof ordersData, Array.isArray(ordersData));
        console.log(' Length of ordersData:', ordersData?.length);
        if (ordersData && ordersData.length > 0) {
          console.log(' Sample order structure:', ordersData[0]);
          console.log(' Available fields:', Object.keys(ordersData[0]));
        }
        
        // Ensure ordersData is an array before setting state
        if (!Array.isArray(ordersData)) {
          console.log('⚠️ ordersData is not an array, converting to empty array');
          ordersData = [];
        }
        
        console.log('🚀 Setting orders state with:', ordersData);
        setOrders(ordersData);
        
      } catch (apiError) {
        console.log('🔄 Backend API failed:', apiError);
        console.log('🔄 API Error details:', apiError.message, apiError.response);
        
        // Fallback: Check if we have any orders in the OrderContext
        const contextOrders = getOrders(user._id, 'seller');
        console.log('🔄 Context orders for seller:', contextOrders);
        
        if (contextOrders.length > 0) {
          ordersData = contextOrders;
          setOrders(contextOrders);
          message.info('Showing orders from local storage (backend not available)');
        } else {
          ordersData = [];
          setOrders([]);
          message.info('No orders found. Backend seller orders endpoint not available yet.');
        }
      }
      
      // Check the actual orders that were set
      if (ordersData.length === 0) {
        message.info('No incoming orders found. You haven\'t received any orders yet.');
      } else {
        console.log(` Loaded ${ordersData.length} orders for seller`);
      }
    } catch (error) {
      console.error(' Error loading seller orders:', error);
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

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    statusForm.setFieldsValue({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : null,
      notes: order.notes || ''
    });
    setStatusUpdateModal(true);
  };

  const handleStatusSubmit = async (values) => {
    try {
      console.log('🚀 Starting status update for order:', selectedOrder._id);
      console.log('📝 New status:', values.status);
      console.log(' Token present:', !!token);
      
      // Try to update via backend API first
      await orderService.updateOrderStatus(selectedOrder._id, values.status, token, 'seller');
      console.log(' Backend update successful');
      message.success('Order status updated successfully via backend');
      setStatusUpdateModal(false);
      statusForm.resetFields();
      loadOrders(); // Reload orders
    } catch (error) {
      console.error(' Backend API failed for status update:', error);
      console.error(' Error message:', error.message);
      console.error(' Error type:', typeof error);
      
      // Handle different types of errors
      if (error.message.includes('404')) {
        console.log('🔄 Backend status update endpoint not available, updating locally...');
        
        // Update the order in local state
        const updatedOrders = orders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, status: values.status }
            : order
        );
        
        setOrders(updatedOrders);
        message.success(`Order status updated to "${values.status}" (local update - backend endpoint not available)`);
        setStatusUpdateModal(false);
        statusForm.resetFields();
      } else if (error.message.includes('Cannot change status')) {
        // Handle business logic validation errors
        message.error(`Status update failed: ${error.message}`);
        console.log('🚫 Business logic validation failed:', error.message);
      } else {
        message.error(`Failed to update order status: ${error.message}`);
      }
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
        (order.buyerName && order.buyerName.toLowerCase().includes(searchText.toLowerCase())) ||
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
    const confirmed = ordersArray.filter(o => o.status === 'confirmed').length;
    const shipped = ordersArray.filter(o => o.status === 'shipped').length;
    const delivered = ordersArray.filter(o => o.status === 'delivered').length;
    const cancelled = ordersArray.filter(o => o.status === 'cancelled').length;
    const totalRevenue = ordersArray
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total, pending, confirmed, shipped, delivered, cancelled, totalRevenue };
  };

  // Debug: Log orders state
  console.log(' Current orders state:', orders, 'Type:', typeof orders, 'IsArray:', Array.isArray(orders));
  
  // Safety check: Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  console.log(' Safe orders array:', safeOrders, 'Length:', safeOrders.length);
  
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
      title: 'Buyer',
      dataIndex: 'buyerId',
      key: 'buyerId',
      render: (buyerId, record) => (
        <div>
          <Text strong>{buyerId?.fullName || 'Unknown Buyer'}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            ID: {buyerId?._id?.substring(0, 8)}...
          </Text>
        </div>
      ),
      width: 150
    },
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      render: (productId, record) => (
        <div>
          <Text strong>Product #{productId?._id?.substring(0, 8)}...</Text>
          <br />
          <Text type="secondary" className="text-xs">
            Type: {productId?.productTypeId?.substring(0, 8)}...
          </Text>
        </div>
      )
    },
    {
      title: 'Qty × Price',
      key: 'quantityPrice',
      render: (_, record) => {
        const quantity = record.quantity || 1;
        const unitPrice = record.unitPrice || record.price || record.product?.price || 0;
        const totalAmount = record.totalAmount || (quantity * unitPrice);
        
        return (
          <div>
            <Text>{quantity} × £{unitPrice.toFixed(2)}</Text>
            <br />
            <Text strong className="text-blue-600">
              £{totalAmount.toFixed(2)}
            </Text>
          </div>
        );
      },
      width: 120
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
          {record.status !== 'delivered' && record.status !== 'cancelled' && (
            <Tooltip title="Update Status">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleUpdateStatus(record)}
              />
            </Tooltip>
          )}
          {record.status === 'pending' && (
            <Tooltip title="Mark as Processing">
              <Button 
                type="text" 
                icon={<CheckOutlined />} 
                onClick={() => handleUpdateStatus({ ...record, status: 'processing' })}
              />
            </Tooltip>
          )}
          {record.status === 'processing' && (
            <Tooltip title="Mark as Shipped">
              <Button 
                type="text" 
                icon={<TruckFilled />} 
                onClick={() => handleUpdateStatus({ ...record, status: 'shipped' })}
              />
            </Tooltip>
          )}
        </Space>
      ),
      width: 150
    }
  ];

  // Don't render until orders are properly loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 flex items-center justify-center">
        <Spin size="large" tip="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="text-gray-800 mb-2">
            Incoming Orders
          </Title>
          <Text className="text-gray-600">
            Manage and fulfill customer orders
          </Text>
        </div>

        {/* Data Info Alert */}
        <Alert
          message="Data Structure Notice"
          description="Product names are not available in the current API response. The backend only provides product IDs. To show product names, the backend needs to populate the productId object with product details (name, description, etc.) during order creation or retrieval. Status updates will work locally but require backend endpoint implementation for persistence."
          type="info"
          showIcon
          className="mb-6"
          action={
            <Button size="small" type="link" onClick={() => {
              console.log(' Current order data structure:', orders[0]);
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
                title="Confirmed"
                value={stats.confirmed}
                prefix={<CheckCircleOutlined />}
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
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                styles={{ content: { color: '#52c41a' } }}
                suffix="GBP"
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
                    { label: 'Confirmed', value: 'confirmed' },
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
          {loading ? (
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
              scroll={{ x: 1200 }}
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
                <Descriptions.Item label="Unit Price">
                  £{selectedOrder.unitPrice.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  <Text strong>£{selectedOrder.totalAmount.toFixed(2)}</Text>
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

              <Descriptions title="Customer Information" bordered column={2}>
                <Descriptions.Item label="Name">
                  {selectedOrder.buyerName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedOrder.buyerEmail}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {selectedOrder.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedOrder.shippingAddress.phone}
                </Descriptions.Item>
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
              </Descriptions>

              {selectedOrder.notes && (
                <>
                  <Divider />
                  <Descriptions title="Order Notes" bordered column={1}>
                    <Descriptions.Item label="Notes">
                      {selectedOrder.notes}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}

              {/* Order Progress */}
              <Divider />
              <div>
                <Text strong>Order Progress</Text>
                <div className="mt-4">
                  <Progress
                    percent={
                      selectedOrder.status === 'pending' ? 25 :
                      selectedOrder.status === 'confirmed' ? 50 :
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

        {/* Status Update Modal */}
        <Modal
          title="Update Order Status"
          open={statusUpdateModal}
          onCancel={() => setStatusUpdateModal(false)}
          footer={null}
          width={600}
        >
          <Form
            form={statusForm}
            layout="vertical"
            onFinish={handleStatusSubmit}
          >
            <Form.Item
              name="status"
              label="Order Status"
              rules={[{ required: true, message: 'Please select order status' }]}
            >
              <Select placeholder="Select status">
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="shipped">Shipped</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="trackingNumber"
              label="Tracking Number"
            >
              <Input placeholder="Enter tracking number (optional)" />
            </Form.Item>

            <Form.Item
              name="estimatedDelivery"
              label="Estimated Delivery Date"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Select delivery date (optional)"
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Add any notes about this order update (optional)"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space>
                <Button type="primary" htmlType="submit">
                  Update Status
                </Button>
                <Button onClick={() => setStatusUpdateModal(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default SellerOrdersPage;
