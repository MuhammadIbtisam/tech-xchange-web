import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Alert, 
  Spin, 
  Empty,
  Modal,
  message,
  Tooltip,
  Badge,
  Input
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminProductsPage = () => {
  const { user, token } = useAuth();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Load pending products
  const loadPendingProducts = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await productService.getPendingProducts(token);
      console.log('Pending products response:', response);
      console.log('Response structure:', {
        hasSuccess: !!response?.success,
        hasProducts: !!response?.products,
        productsLength: response?.products?.length,
        responseKeys: Object.keys(response || {}),
        fullResponse: JSON.stringify(response, null, 2)
      });
      
      if (response && response.success) {
        setPendingProducts(response.products || []);
        updateStats(response.products || []);
      } else {
        console.error('Failed to load pending products:', response);
        message.error('Failed to load pending products');
      }
    } catch (error) {
      console.error('Error loading pending products:', error);
      message.error('Error loading pending products');
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (products) => {
    const total = products.length;
    const pending = products.filter(p => p.status === 'pending').length;
    const approved = products.filter(p => p.status === 'approved').length;
    const rejected = products.filter(p => p.status === 'rejected').length;
    
    setStats({ total, pending, approved, rejected });
  };

  // Approve product
  const handleApprove = async (productId) => {
    if (!token) return;
    
    setApproving(true);
    try {
      const response = await productService.approveProduct(productId, token);
      console.log('Approve response:', response);
      
      if (response && response.success) {
        message.success('Product approved successfully');
        // Refresh the list
        loadPendingProducts();
      } else {
        message.error(response?.message || 'Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
      message.error('Error approving product');
    } finally {
      setApproving(false);
    }
  };

  // Reject product
  const handleReject = async (productId) => {
    if (!token) return;
    
    // Show modal to get admin notes
    setSelectedProduct({ _id: productId });
    setRejectModalVisible(true);
  };

  // Confirm rejection with notes
  const confirmReject = async (adminNotes) => {
    if (!token || !selectedProduct) return;
    
    setRejecting(true);
    try {
      const response = await productService.rejectProduct(selectedProduct._id, token, adminNotes);
      console.log('Reject response:', response);
      
      if (response && response.success) {
        message.success('Product rejected successfully');
        // Refresh the list
        loadPendingProducts();
        setRejectModalVisible(false);
        setSelectedProduct(null);
      } else {
        message.error(response?.message || 'Failed to reject product');
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      message.error('Error rejecting product');
    } finally {
      setRejecting(false);
    }
  };

  // View product details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setPreviewVisible(true);
  };

  // Load products on component mount
  useEffect(() => {
    if (token) {
      loadPendingProducts();
    }
  }, [token]);

  // Table columns
  const columns = [
    {
      title: 'Product',
      key: 'product',
      width: 200,
      responsive: ['xs'],
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">{record.name}</div>
          <div className="text-sm text-gray-500">
            {record.productTypeId?.name} • {record.brandId?.name}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Seller: {record.sellerId?.fullName}
          </div>
          <div className="text-sm text-gray-500">
            Price: ${record.price?.toFixed(2)} {record.currency}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Tag color={record.condition === 'new' ? 'green' : 'blue'}>
              {record.condition}
            </Tag>
            <Badge 
              count={record.stock} 
              showZero 
              color={record.stock > 0 ? 'green' : 'red'}
            />
            <Tag 
              icon={<ClockCircleOutlined />} 
              color="orange"
            >
              Pending
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      width: 200,
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">{record.name}</div>
          <div className="text-sm text-gray-500">
            {record.productTypeId?.name} • {record.brandId?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Seller',
      key: 'seller',
      width: 150,
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.sellerId?.fullName}</div>
          <div className="text-sm text-gray-500">{record.sellerId?.email}</div>
        </div>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      width: 100,
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <div className="font-semibold text-green-600">
          ${record.price?.toFixed(2)} {record.currency}
        </div>
      ),
    },
    {
      title: 'Condition',
      key: 'condition',
      width: 100,
      responsive: ['md', 'lg', 'xl'],
      render: (_, record) => (
        <Tag color={record.condition === 'new' ? 'green' : 'blue'}>
          {record.condition}
        </Tag>
      ),
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 80,
      responsive: ['md', 'lg', 'xl'],
      render: (_, record) => (
        <Badge 
          count={record.stock} 
          showZero 
          color={record.stock > 0 ? 'green' : 'red'}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      responsive: ['lg', 'xl'],
      render: (_, record) => (
        <Tag 
          icon={<ClockCircleOutlined />} 
          color="orange"
        >
          Pending Review
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <Space direction="vertical" size="small" className="w-full">
          <Space size="small" wrap>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewProduct(record)}
                className="text-blue-600 hover:text-blue-800"
                size="small"
              />
            </Tooltip>
            <Tooltip title="Approve Product">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record._id)}
                loading={approving}
                className="bg-green-600 hover:bg-green-700 border-green-600"
                size="small"
              >
                <span className="hidden sm:inline">Approve</span>
              </Button>
            </Tooltip>
            <Tooltip title="Reject Product">
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record._id)}
                loading={rejecting}
                size="small"
              >
                <span className="hidden sm:inline">Reject</span>
              </Button>
            </Tooltip>
          </Space>
        </Space>
      ),
    },
  ];

  // Product preview modal
  const ProductPreviewModal = () => (
    <Modal
      title="Product Details"
      open={previewVisible}
      onCancel={() => setPreviewVisible(false)}
      footer={[
        <Button key="close" onClick={() => setPreviewVisible(false)}>
          Close
        </Button>,
        <Button
          key="approve"
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => {
            handleApprove(selectedProduct._id);
            setPreviewVisible(false);
          }}
          loading={approving}
          className="bg-green-600 hover:bg-green-700 border-green-600"
        >
          Approve
        </Button>,
        <Button
          key="reject"
          danger
          icon={<CloseCircleOutlined />}
          onClick={() => {
            handleReject(selectedProduct._id);
            setPreviewVisible(false);
          }}
          loading={rejecting}
        >
          Reject
        </Button>,
      ]}
      width="90%"
      style={{ maxWidth: 800 }}
      centered
    >
      {selectedProduct && (
        <div className="space-y-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Product Name:</Text>
                <div className="text-lg font-semibold">{selectedProduct.name}</div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Price:</Text>
                <div className="text-lg text-green-600 font-semibold">
                  ${selectedProduct.price?.toFixed(2)} {selectedProduct.currency}
                </div>
              </div>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Category:</Text>
                <div>{selectedProduct.productTypeId?.name}</div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Brand:</Text>
                <div>{selectedProduct.brandId?.name}</div>
              </div>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Condition:</Text>
                <Tag color={selectedProduct.condition === 'new' ? 'green' : 'blue'}>
                  {selectedProduct.condition}
                </Tag>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Stock:</Text>
                <Badge 
                  count={selectedProduct.stock} 
                  showZero 
                  color={selectedProduct.stock > 0 ? 'green' : 'red'}
                />
              </div>
            </Col>
          </Row>
          
          <div>
            <Text strong>Description:</Text>
            <Paragraph className="mt-2">{selectedProduct.description}</Paragraph>
          </div>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Seller:</Text>
                <div className="font-medium">{selectedProduct.sellerId?.fullName}</div>
                <div className="text-sm text-gray-500">{selectedProduct.sellerId?.email}</div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text strong>Created:</Text>
                <div>{new Date(selectedProduct.createdAt).toLocaleDateString()}</div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );

  // Rejection modal
  const RejectionModal = () => {
    const [adminNotes, setAdminNotes] = useState('');
    
    const handleSubmit = () => {
      if (!adminNotes.trim()) {
        message.error('Admin notes are required for rejection');
        return;
      }
      confirmReject(adminNotes.trim());
    };

    return (
      <Modal
        title="Reject Product"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedProduct(null);
          setAdminNotes('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setRejectModalVisible(false);
            setSelectedProduct(null);
            setAdminNotes('');
          }}>
            Cancel
          </Button>,
          <Button
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleSubmit}
            loading={rejecting}
          >
            Reject Product
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
      >
        <div className="space-y-4">
          <Alert
            message="Rejection Required"
            description="Please provide a reason for rejecting this product. This will help sellers understand what needs to be improved."
            type="warning"
            showIcon
          />
          
          <div>
            <Text strong>Admin Notes:</Text>
            <TextArea
              rows={4}
              placeholder="Enter the reason for rejection..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <Title level={2} className="mb-2 text-xl sm:text-2xl">Product Management</Title>
          <Text className="text-gray-600 text-sm sm:text-base">
            Review and manage product submissions from sellers
          </Text>
        </div>
        <Button 
          type="primary" 
          onClick={loadPendingProducts}
          loading={loading}
          icon={<ExclamationCircleOutlined />}
          className="w-full sm:w-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.total}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card>
          <div className="mb-4">
            <Text strong className="text-sm sm:text-base">Review Progress</Text>
          </div>
          <Progress
            percent={Math.round(((stats.approved + stats.rejected) / stats.total) * 100)}
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            size="small"
          />
          <div className="mt-2 text-xs sm:text-sm text-gray-500">
            {stats.approved + stats.rejected} of {stats.total} products reviewed
          </div>
        </Card>
      )}

      {/* Pending Products Table */}
      <Card 
        title={<span className="text-sm sm:text-base">Pending Products for Review</span>} 
        className="shadow-sm"
      >
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-500">Loading pending products...</div>
          </div>
        ) : pendingProducts.length === 0 ? (
          <Empty
            description="No pending products to review"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <Alert
              message="Product Review Required"
              description={`You have ${stats.pending} products waiting for review. Please approve or reject each product based on quality and compliance.`}
              type="info"
              showIcon
              className="mb-4 text-xs sm:text-sm"
            />
            
            <Table
              columns={columns}
              dataSource={pendingProducts}
              rowKey="_id"
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} products`,
                responsive: true,
                size: 'small',
              }}
              className="admin-products-table"
              size="small"
            />
          </>
        )}
      </Card>

      {/* Product Preview Modal */}
      <ProductPreviewModal />
      
      {/* Rejection Modal */}
      <RejectionModal />
    </div>
  );
};

export default AdminProductsPage;
