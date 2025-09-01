import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  Typography, 
  Space, 
  Divider, 
  message, 
  Spin,
  Row,
  Col,
  Image,
  Tag
} from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  EnvironmentOutlined, 
  CreditCardOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = ({ onBack, onOrderSuccess }) => {
  const { cartItems, clearCart, getTotalPrice } = useCart();
  const { createOrder, loading } = useOrder();
  const { user, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not authenticated or no items in cart
  useEffect(() => {
    if (!isAuthenticated) {
      message.error('Please login to checkout');
      onBack();
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      message.error('Your cart is empty');
      onBack();
      return;
    }
  }, [isAuthenticated, cartItems, onBack]);

  const handleSubmit = async (values) => {
    if (!isAuthenticated || !user) {
      message.error('Please login to continue');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare order data
      const orderData = {
        buyerId: user._id,
        items: cartItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || null
        })),
        totalAmount: getTotalPrice(),
        shippingAddress: {
          fullName: values.fullName,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
          phone: values.phone
        },
        paymentMethod: values.paymentMethod,
        notes: values.notes || ''
      };

      console.log(' Creating order with data:', orderData);

      // Create order using service
      const token = localStorage.getItem('token');
      const newOrder = await orderService.createOrder(orderData, token);

      message.success('Order placed successfully!');
      
      // Clear cart after successful order
      clearCart();
      
      // Call success callback
      if (onOrderSuccess) {
        onOrderSuccess(newOrder);
      }
    } catch (error) {
      console.error(' Error creating order:', error);
      message.error(`Failed to create order: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'processing': 'blue',
      'shipped': 'purple',
      'delivered': 'green',
      'cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Text>Your cart is empty</Text>
        <br />
        <Button type="primary" onClick={onBack}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
          className="mb-4"
        >
          Back to Cart
        </Button>
        <Title level={2} className="mb-2">
          <ShoppingCartOutlined className="mr-2" />
          Checkout
        </Title>
        <Text type="secondary">
          Review your order and complete your purchase
        </Text>
      </div>

      <Row gutter={24}>
        {/* Order Summary */}
        <Col xs={24} lg={12}>
          <Card title="Order Summary" className="mb-4">
            <Space direction="vertical" className="w-full">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded">
                  <Image
                    src={item.product.images?.[0] || 'https://via.placeholder.com/60x60'}
                    alt={item.product.name}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <Text strong className="block">{item.product.name}</Text>
                    <Text type="secondary" className="text-sm">
                      Quantity: {item.quantity}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      Price: £{item.product.price}
                    </Text>
                  </div>
                  <Text strong className="text-lg">
                    £{(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </div>
              ))}
              
              <Divider />
              
              <div className="flex justify-between items-center">
                <Text strong>Subtotal:</Text>
                <Text>£{getTotalPrice().toFixed(2)}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>Shipping:</Text>
                <Text>Free</Text>
              </div>
              <Divider />
              <div className="flex justify-between items-center text-lg">
                <Text strong>Total:</Text>
                <Text strong className="text-blue-600">
                  £{getTotalPrice().toFixed(2)}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Checkout Form */}
        <Col xs={24} lg={12}>
          <Card title="Shipping Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                fullName: user?.fullName || '',
                country: 'United Kingdom',
                paymentMethod: 'card'
              }}
            >
              {/* Personal Information */}
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>

              {/* Address */}
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter your address' }]}
              >
                <TextArea 
                  prefix={<EnvironmentOutlined />} 
                  placeholder="Enter your full address"
                  rows={3}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: 'Please enter your city' }]}
                  >
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="state"
                    label="State/County"
                    rules={[{ required: true, message: 'Please enter your state' }]}
                  >
                    <Input placeholder="State/County" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="zipCode"
                    label="Postal Code"
                    rules={[{ required: true, message: 'Please enter your postal code' }]}
                  >
                    <Input placeholder="Postal Code" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="country"
                    label="Country"
                    rules={[{ required: true, message: 'Please select your country' }]}
                  >
                    <Select placeholder="Select country">
                      <Select.Option value="United Kingdom">United Kingdom</Select.Option>
                      <Select.Option value="United States">United States</Select.Option>
                      <Select.Option value="Canada">Canada</Select.Option>
                      <Select.Option value="Australia">Australia</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Payment Method */}
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{ required: true, message: 'Please select a payment method' }]}
              >
                <Select placeholder="Select payment method">
                  <Select.Option value="card">
                    <Space>
                      <CreditCardOutlined />
                      Credit/Debit Card
                    </Space>
                  </Select.Option>
                  <Select.Option value="paypal">PayPal</Select.Option>
                  <Select.Option value="bank">Bank Transfer</Select.Option>
                </Select>
              </Form.Item>

              {/* Notes */}
              <Form.Item
                name="notes"
                label="Order Notes (Optional)"
              >
                <TextArea 
                  placeholder="Any special instructions or notes for your order"
                  rows={2}
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                  className="w-full h-12 text-lg"
                  icon={<ShoppingCartOutlined />}
                >
                  {submitting ? 'Processing...' : `Place Order - £${getTotalPrice().toFixed(2)}`}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;


