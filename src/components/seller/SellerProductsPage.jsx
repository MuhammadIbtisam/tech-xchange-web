import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Table, 
  Tag, 
  Image, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Upload, 
  Row, 
  Col, 
  Statistic, 
  Progress,
  Popconfirm,
  Tooltip,
  Badge,
  Empty,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  UploadOutlined,
  ShoppingOutlined,
  DollarOutlined,
  FireOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import { ProductReviews } from '../reviews';
import ImageUpload from '../shared/ImageUpload';
import { processProductsImages, processProductImages } from '../../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SellerProductsPage = ({ onProductView }) => {
  const { user, isAuthenticated, isSeller, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [productImages, setProductImages] = useState([]);

  // Load seller's products
  useEffect(() => {
    if (isAuthenticated && isSeller) {
      loadMyProducts();
    }
  }, [isAuthenticated, isSeller]);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        message.error('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await productService.getMyProducts(token);
      
      if (response.success) {
        // Process products to ensure image URLs are properly constructed
        const processedProducts = processProductsImages(response.products || []);
        setProducts(processedProducts);
        console.log('📦 Loaded products with processed images:', processedProducts);
      } else {
        message.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyProducts();
    setRefreshing(false);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    
    console.log(' Editing product:', product);
    
    // Wait for form to be ready before setting fields
    setTimeout(() => {
      if (form && form.setFieldsValue) {
        const formData = {
          name: product.productTypeId?.name || product.name,
          description: product.description,
          price: product.price,
          currency: product.currency || 'GBP',
          condition: product.condition,
          stock: product.stock,
          category: product.productTypeId?.categoryId?._id,
          brand: product.productTypeId?.brandId?._id,
          specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : '',
          tags: product.tags?.join(', ') || ''
        };
        
        console.log('📝 Setting form data:', formData);
        form.setFieldsValue(formData);
      }
    }, 100);
    
    setModalVisible(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await productService.deleteProduct(productId, token);
      message.success('Product deleted successfully');
      loadMyProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setUploading(true);
      
      // Use token from auth context instead of localStorage
      if (!token) {
        message.error('Authentication token not found. Please login again.');
        return;
      }
      
      // Try with minimal fields that should definitely work
      const productData = {
        price: Number(values.price),
        condition: values.condition,
        stock: Number(values.stock)
      };
      
      // Only add description if it exists and is not empty
      if (values.description && values.description.trim()) {
        productData.description = values.description.trim();
      }
      
      console.log(' Testing with minimal data structure');
      console.log('📋 Form values received:', values);
      console.log(' Final data to send:', productData);
      console.log(' Data types:', {
        price: typeof productData.price,
        condition: typeof productData.condition,
        stock: typeof productData.stock,
        description: typeof productData.description
      });
      
      // Test with minimal data first
      if (editingProduct) {
        console.log(' Testing minimal update...');
        const minimalData = {
          price: productData.price,
          condition: productData.condition,
          stock: productData.stock
        };
        console.log(' Minimal data:', minimalData);
      }

      if (editingProduct) {
        // Validate product ID
        if (!editingProduct._id) {
          throw new Error('Invalid product ID');
        }
        
        console.log(' Updating product:', {
          productId: editingProduct._id,
          productData: productData,
          originalProduct: editingProduct,
          token: token ? 'Present' : 'Missing'
        });
        
        console.log('🚀 About to call updateProduct with:', {
          id: editingProduct._id,
          data: productData,
          token: token ? 'Present' : 'Missing',
          tokenLength: token ? token.length : 0,
          tokenStart: token ? token.substring(0, 20) + '...' : 'None'
        });
        
        // Log the exact data structure being sent
        console.log('📋 Raw form values:', values);
        console.log(' Processed product data:', productData);
        console.log(' Product ID type:', typeof editingProduct._id);
        console.log(' Product ID value:', editingProduct._id);
        
        const updateResponse = await productService.updateProduct(editingProduct._id, productData, token);
        console.log(' Update response:', updateResponse);
        message.success('Product updated successfully');
      } else {
        console.log(' Creating product:', {
          productData: productData,
          token: token ? 'Present' : 'Missing'
        });
        
        // For create, we need all required fields
        const createData = {
          name: values.name || 'Test Product', // Required field
          description: values.description || '',
          price: Number(values.price),
          categoryId: "68b5ef05f6d5de9e5f963ad2", // Laptops category
          brandId: "68b5ef05f6d5de9e5f963ad9", // Apple brand
          productTypeId: "68b5ef05f6d5de9e5f963ae3", // MacBook Pro 16"
          condition: values.condition || 'new',
          stock: Number(values.stock) || 1,
          currency: 'USD'
        };
        
        console.log('🚀 Creating product with data:', createData);
        console.log('📤 Sending to backend:', JSON.stringify(createData, null, 2));
        const createResponse = await productService.createProduct(createData, token);
        console.log('📥 Backend response:', createResponse);
        console.log('🔍 Product name in response:', createResponse?.product?.name);
        message.success('Product created successfully');
      }
      
      setModalVisible(false);
      loadMyProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      
      // More specific error messages based on backend responses
      if (error.message.includes('404')) {
        message.error('Product not found. It may have been deleted or you may not have permission to edit it.');
      } else if (error.message.includes('401')) {
        message.error('Authentication failed. Please login again.');
      } else if (error.message.includes('403')) {
        message.error('Access denied. You may not have permission to edit this product.');
      } else if (error.message.includes('400')) {
        message.error('Invalid data. Please check your input and try again.');
      } else if (error.message.includes('500')) {
        message.error('Server error. Please try again later.');
      } else if (error.message.includes('Validation failed')) {
        message.error('Please check your input data and try again.');
      } else {
        message.error(`Failed to save product: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'approved': 'green',
      'rejected': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <ClockCircleOutlined />,
      'approved': <CheckCircleOutlined />,
      'rejected': <CloseCircleOutlined />
    };
    return icons[status] || null;
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'green',
      'like-new': 'blue',
      'good': 'orange',
      'fair': 'yellow',
      'poor': 'red'
    };
    return colors[condition] || 'default';
  };

  const formatPrice = (price, currency = 'GBP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Calculate statistics
  const totalProducts = products.length;
  const approvedProducts = products.filter(p => p.status === 'approved').length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  // Table columns
  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {record.images && record.images.length > 0 ? (
              <Image
                alt={record.name}
                src={record.images[0]}
                className="w-full h-full object-cover"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                📱
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Text strong className="block truncate">
              {record.name}
            </Text>
            <Text className="text-gray-500 text-sm block truncate">
              {record.productTypeId?.name} • {record.productTypeId?.brandId?.name} • {record.productTypeId?.categoryId?.displayName}
            </Text>
            <div className="flex items-center gap-2 mt-1">
              <Tag color={getConditionColor(record.condition)} size="small">
                {record.condition?.charAt(0).toUpperCase() + record.condition?.slice(1)}
              </Tag>
              <Tag color={getStatusColor(record.status)} size="small" icon={getStatusIcon(record.status)}>
                {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <div>
          <Text strong className="text-lg text-green-600">
            {formatPrice(record.price, record.currency)}
          </Text>
          <div className="text-gray-500 text-sm">
            Stock: {record.stock}
          </div>
        </div>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_, record) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {record.views || 0}
          </div>
          <Text className="text-gray-500 text-sm">Views</Text>
          {record.isFeatured && (
            <div className="mt-1">
              <Tag icon={<FireOutlined />} color="red" size="small">
                Featured
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onProductView && onProductView(record)}
            />
          </Tooltip>
                                  <Tooltip title="Edit Product">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditProduct(record)}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Delete Product"
                          description="Are you sure you want to delete this product? This action cannot be undone."
                          onConfirm={() => handleDeleteProduct(record._id)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                        >
                          <Tooltip title="Delete Product">
                            <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                            />
                          </Tooltip>
                        </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAuthenticated || !isSeller) {
    return (
      <div className="p-6 text-center">
        <Empty description="Access denied. Seller account required." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="mb-2">
              My Product Store
            </Title>
            <Text className="text-gray-600">
              Manage your product catalog and track performance
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            Add New Product
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={totalProducts}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Approved"
                value={approvedProducts}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending Review"
                value={pendingProducts}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Views"
                value={totalViews}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Products Table */}
        <Card
          title="Product Catalog"
          extra={
            <Button
              icon={<EyeOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              Refresh
            </Button>
          }
        >
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : products.length > 0 ? (
            <Table
              columns={columns}
              dataSource={products}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} products`,
              }}
              className="seller-products-table"
            />
          ) : (
            <Empty
              description="No products found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={handleAddProduct}>
                Add Your First Product
              </Button>
            </Empty>
          )}
        </Card>

        {/* Product Reviews Section */}
        {products.length > 0 && (
          <Card
            title="Product Reviews"
            className="mt-6"
          >
            <div className="space-y-6">
              {products.map((product) => (
                <div key={product._id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.productTypeId?.name || product.name}
                          className="w-full h-full object-cover"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📱
                        </div>
                      )}
                    </div>
                    <div>
                      <Text strong className="block">
                        {product.productTypeId?.name || product.name}
                      </Text>
                      <Text type="secondary" className="text-sm">
                        {product.productTypeId?.brandId?.name || 'Unknown Brand'}
                      </Text>
                    </div>
                  </div>
                  
                  <ProductReviews
                    productId={product._id}
                    productName={product.productTypeId?.name || product.name}
                    showReviewForm={false}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Add/Edit Product Modal */}
        <Modal
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              currency: 'GBP',
              condition: 'new',
              stock: 1
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: 'Please enter product name' }]}
                >
                  <Input placeholder="Enter product name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    addonAfter={
                      <Form.Item name="currency" noStyle>
                        <Select style={{ width: 80 }}>
                          <Option value="GBP">GBP</Option>
                          <Option value="USD">USD</Option>
                          <Option value="EUR">EUR</Option>
                        </Select>
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="condition"
                  label="Condition"
                  rules={[{ required: true, message: 'Please select condition' }]}
                >
                  <Select placeholder="Select condition">
                    <Option value="new">New</Option>
                    <Option value="like-new">Like New</Option>
                    <Option value="good">Good</Option>
                    <Option value="fair">Fair</Option>
                    <Option value="poor">Poor</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="stock"
                  label="Stock Quantity"
                  rules={[{ required: true, message: 'Please enter stock quantity' }]}
                >
                  <InputNumber
                    placeholder="1"
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea
                rows={4}
                placeholder="Describe your product..."
              />
            </Form.Item>

            <Form.Item
              name="specifications"
              label="Specifications (JSON)"
              help="Enter product specifications in JSON format"
            >
              <TextArea
                rows={3}
                placeholder='{"screen": "6.1\"", "ram": "8GB", "storage": "256GB"}'
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
              help="Separate tags with commas"
            >
              <Input placeholder="phones, Apple, smartphone" />
            </Form.Item>

            {/* Image Upload Section */}
            {editingProduct && (
              <Form.Item label="Product Images">
                <ImageUpload
                  productId={editingProduct._id}
                  onUploadSuccess={(response) => {
                    console.log('📸 Upload success response:', response);
                    message.success('Images uploaded successfully');
                    
                    // Update the specific product with new images
                    if (response.success && response.images && editingProduct) {
                      const updatedProducts = products.map(product => {
                        if (product._id === editingProduct._id) {
                          // Process new images and add to existing ones
                          const newImageUrls = response.images.map(imagePath => {
                            if (imagePath.startsWith('http')) {
                              return imagePath;
                            }
                            return `http://localhost:3000/${imagePath}`;
                          });
                          
                          return {
                            ...product,
                            images: [...(product.images || []), ...newImageUrls]
                          };
                        }
                        return product;
                      });
                      
                      setProducts(updatedProducts);
                      console.log('🔄 Updated products with new images:', updatedProducts);
                    } else {
                      // Fallback: reload all products
                      loadMyProducts();
                    }
                  }}
                  onUploadError={(error) => {
                    message.error('Failed to upload images: ' + error.message);
                  }}
                  existingImages={editingProduct.images || []}
                  maxFiles={10}
                  maxSize={5}
                />
              </Form.Item>
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default SellerProductsPage;
