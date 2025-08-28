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

const { Title, Text } = Typography;
const { Option } = Select;

const CartPage = ({ onBack }) => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart, checkout } = useCart();
  const { isAuthenticated, user } = useAuth();
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

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication token not found');
        return;
      }

      const orderData = {
        shippingAddress: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country
        },
        paymentMethod: values.paymentMethod
      };

      const result = await checkout(orderData, token);
      if (result.success) {
        message.success('Order placed successfully!');
        setCheckoutModalVisible(false);
        checkoutForm.resetFields();
        onBack && onBack();
      } else {
        message.error(result.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      message.error('Checkout failed. Please try again.');
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
                <Option value="debit_card">Debit Card</Option>
                <Option value="paypal">PayPal</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
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
