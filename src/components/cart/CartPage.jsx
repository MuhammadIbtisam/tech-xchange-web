import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  InputNumber, 
  Typography, 
  Space, 
  Divider, 
  Empty, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select,
  Row,
  Col,
  Image,
  Tag
} from 'antd';
import { 
  ShoppingCartOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  CreditCardOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;

const CartPage = ({ onBack }) => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, user, isBuyer } = useAuth();
  const { addOrder } = useOrder();
  
  // Restrict cart access to buyers only
  if (!isAuthenticated || !isBuyer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <Title level={2} className="mb-4">Access Denied</Title>
            <Text className="text-gray-600 mb-6 block">
              Shopping cart is only available for buyer accounts.
            </Text>
            <Button type="primary" onClick={onBack}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const [loading, setLoading] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutForm] = Form.useForm();

  const handleQuantityChange = (productId, quantity) => {
    const result = updateQuantity(productId, quantity);
    if (result.success) {
      message.success('Quantity updated');
    } else {
      message.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = (productId) => {
    const result = removeFromCart(productId);
    if (result.success) {
      message.success('Item removed from cart');
    } else {
      message.error('Failed to remove item');
    }
  };

  const handleClearCart = () => {
    Modal.confirm({
      title: 'Clear Cart',
      content: 'Are you sure you want to remove all items from your cart?',
      okText: 'Yes, Clear Cart',
      cancelText: 'Cancel',
      onOk: () => {
        clearCart();
        message.success('Cart cleared');
      }
    });
  };

  const handleCheckout = async (values) => {
    if (!isAuthenticated) {
      message.error('Please login to checkout');
      return;
    }

    // Validate all required fields
    const requiredFields = ['street', 'city', 'state', 'zipCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !values[field] || !values[field].trim());
    
    if (missingFields.length > 0) {
      message.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication token not found');
        return;
      }

      // Validate user object first
      if (!user || !user._id) {
        throw new Error('User information not available. Please login again.');
      }
      
      console.log(`🔍 User validation:`, { user: user, userId: user._id, userType: typeof user._id });
      
      // Create individual orders for each cart item
      const orders = [];
      
      for (const item of cartItems) {
        // Prepare order data for single product - ensure exact backend format
        const orderData = {
          buyerId: user._id, // Add buyerId as required by backend
          quantity: Number(item.quantity), // Ensure it's a number
          shippingAddress: {
            street: values.street.trim(),
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: values.zipCode.trim(),
            country: values.country.trim(),
            phone: values.phone.trim()
          },
          paymentMethod: values.paymentMethod
        };
        
        // Add optional fields only if they exist and are valid
        if (values.notes && values.notes.trim()) {
          orderData.notes = values.notes.trim();
        }
        
        // Validate required fields
        if (!orderData.quantity || orderData.quantity < 1) {
          throw new Error(`Invalid quantity for ${item.name}: ${item.quantity}`);
        }
        
        if (!orderData.shippingAddress.street || !orderData.shippingAddress.city || 
            !orderData.shippingAddress.state || !orderData.shippingAddress.zipCode || 
            !orderData.shippingAddress.country || !orderData.shippingAddress.phone) {
          throw new Error('All shipping address fields are required');
        }
        
                // Log the validated data structure
        console.log(`🧪 Validated order data for ${item.name}:`, orderData);
        console.log(`📋 Full order data JSON:`, JSON.stringify(orderData, null, 2));
        console.log(`🔍 Shipping address details:`, orderData.shippingAddress);
        console.log(`👤 User object:`, user);
        console.log(`🆔 User ID being sent:`, user._id);
        console.log(`🔑 buyerId in orderData:`, orderData.buyerId);
        
        console.log(`📦 Creating order for product ${item.productId}:`, orderData);
        console.log(`🔍 Product details:`, {
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
        console.log(`📤 Final order data being sent:`, JSON.stringify(orderData, null, 2));

        try {
          // Create order for this product
          console.log(`🚀 Sending order request for ${item.name}...`);
          console.log(`📤 Request details:`, {
            productId: item.productId,
            orderData: orderData,
            token: token ? 'Present' : 'Missing',
            buyerId: orderData.buyerId
          });
          
          const newOrder = await orderService.createOrder(item.productId, orderData, token);
          
          // Validate the order response
          if (!newOrder || (!newOrder.data && !newOrder.order && !newOrder._id)) {
            console.warn('⚠️ Order response missing ID, using fallback ID');
          }
          
          orders.push(newOrder);
          
          // Add order to local context for immediate display
          console.log('🔍 Full API response structure:', newOrder);
          
          const orderForContext = {
            _id: newOrder.data?._id || newOrder.order?._id || newOrder._id || `order_${Date.now()}_${Math.random()}`,
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            totalAmount: item.price * item.quantity,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: values.paymentMethod,
            shippingAddress: orderData.shippingAddress,
            buyerId: user._id,
            sellerId: item.sellerId || 'unknown',
            createdAt: new Date(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          };
          
          console.log('📦 Order for context:', orderForContext);
          
          try {
            addOrder(orderForContext);
            console.log(`✅ Order created for ${item.name}:`, newOrder);
            console.log(`📦 Order added to context:`, orderForContext);
          } catch (contextError) {
            console.warn('⚠️ Failed to add order to context:', contextError);
            // Don't fail the checkout if context fails
          }
        } catch (error) {
          console.error(`❌ Failed to create order for ${item.name}:`, error);
          
          // Provide more specific error information
          let errorMessage = error.message;
          if (error.message.includes('400')) {
            errorMessage = 'Invalid order data. Please check your information.';
          } else if (error.message.includes('401')) {
            errorMessage = 'Authentication failed. Please login again.';
          } else if (error.message.includes('403')) {
            errorMessage = 'You cannot order this product.';
          } else if (error.message.includes('404')) {
            errorMessage = 'Product not found.';
          } else if (error.message.includes('500')) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          throw new Error(`Failed to create order for ${item.name}: ${errorMessage}`);
        }
      }
      
      message.success('Order placed successfully!');
      setCheckoutModalVisible(false);
      checkoutForm.resetFields();
      
      // Clear cart after successful order
      clearCart();
      
      // Navigate back
      onBack && onBack();
    } catch (error) {
      console.error('Checkout error:', error);
      message.error(`Checkout failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <Empty
              image={<ShoppingCartOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description="Your cart is empty"
              className="py-12"
            >
              <Button 
                type="primary" 
                size="large" 
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
              >
                Continue Shopping
              </Button>
            </Empty>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={onBack}
              className="text-lg"
            />
            <Title level={2} className="mb-0">
              Shopping Cart ({cartItems.length} items)
            </Title>
          </div>
          <Button 
            danger 
            onClick={handleClearCart}
            disabled={cartItems.length === 0}
          >
            Clear Cart
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {/* Cart Items */}
          <Col xs={24} lg={16}>
            <Card title="Cart Items" className="h-fit">
              <Space direction="vertical" className="w-full" size="large">
                {cartItems.map((item) => (
                  <div key={item.productId} className="border border-gray-200 rounded-lg p-4">
                    <Row gutter={[16, 16]} align="middle">
                      {/* Product Image */}
                      <Col xs={24} sm={4}>
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📱
                            </div>
                          )}
                        </div>
                      </Col>

                      {/* Product Info */}
                      <Col xs={24} sm={12}>
                        <div>
                          <Title level={5} className="mb-2">{item.name}</Title>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Brand: {item.brand}</div>
                            <div>Category: {item.category}</div>
                            <div>Condition: <Tag color="blue">{item.condition}</Tag></div>
                          </div>
                        </div>
                      </Col>

                      {/* Quantity & Price */}
                      <Col xs={24} sm={8}>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Qty:</span>
                            <InputNumber
                              min={1}
                              max={item.stock}
                              value={item.quantity}
                              onChange={(value) => handleQuantityChange(item.productId, value)}
                              size="small"
                              className="w-20"
                            />
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatPrice(item.price)} each
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* Remove Button */}
                      <Col xs={24} sm={4}>
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.productId)}
                          className="w-full"
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col xs={24} lg={8}>
            <Card title="Order Summary" className="h-fit sticky top-4">
              <Space direction="vertical" className="w-full" size="large">
                {/* Cart Total */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>Subtotal:</Text>
                    <Text>{formatPrice(cartTotal)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Shipping:</Text>
                    <Text>Free</Text>
                  </div>
                  <Divider />
                  <div className="flex justify-between">
                    <Text strong className="text-lg">Total:</Text>
                    <Text strong className="text-lg text-green-600">
                      {formatPrice(cartTotal)}
                    </Text>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  onClick={() => setCheckoutModalVisible(true)}
                  className="w-full"
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                </Button>

                {!isAuthenticated && (
                  <Text type="secondary" className="text-center block">
                    Please login to complete your purchase
                  </Text>
                )}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Checkout Modal */}
        <Modal
          title="Checkout"
          open={checkoutModalVisible}
          onCancel={() => setCheckoutModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={checkoutForm}
            layout="vertical"
            onFinish={handleCheckout}
            initialValues={{
              country: 'United Kingdom',
              paymentMethod: 'credit_card'
            }}
          >
            {/* Shipping Address */}
            <Title level={4} icon={<TruckOutlined />}>Shipping Address</Title>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="street"
                  label="Street Address"
                  rules={[{ required: true, message: 'Please enter street address' }]}
                >
                  <Input placeholder="123 Main Street" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input placeholder="+447911123456" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: 'Please enter city' }]}
                >
                  <Input placeholder="London" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="state"
                  label="State/County"
                  rules={[{ required: true, message: 'Please enter state/county' }]}
                >
                  <Input placeholder="England" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="zipCode"
                  label="Postal Code"
                  rules={[{ required: true, message: 'Please enter postal code' }]}
                >
                  <Input placeholder="SW1A 1AA" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="country"
                  label="Country"
                  rules={[{ required: true, message: 'Please select country' }]}
                >
                  <Select>
                    <Option value="United Kingdom">United Kingdom</Option>
                    <Option value="United States">United States</Option>
                    <Option value="Canada">Canada</Option>
                    <Option value="Australia">Australia</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Payment Method */}
            <Title level={4} icon={<CreditCardOutlined />}>Payment Method</Title>
            <Form.Item
              name="paymentMethod"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select>
                <Option value="credit_card">Credit Card</Option>
                <Option value="paypal">PayPal</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="cash_on_delivery">Cash on Delivery</Option>
              </Select>
            </Form.Item>

            {/* Order Summary */}
            <Divider />
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <Text>Order Total:</Text>
                <Text strong className="text-lg text-green-600">
                  {formatPrice(cartTotal)}
                </Text>
              </div>
              <Text type="secondary" className="text-sm">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </Text>
            </div>

            {/* Submit Button */}
            <div className="text-center mt-6">
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                className="px-8"
              >
                Place Order
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default CartPage;
