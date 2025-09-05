import React, { useState } from 'react';
import { Button, Card, Typography, Space, message, Input, Form, InputNumber, Select, Divider, Alert } from 'antd';
import { ShoppingOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const OrderMock = ({ onBack, onOrderSuccess }) => {
  const { cartItems, clearCart, getTotalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not authenticated or no items in cart
  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <Text>Please login to checkout</Text>
        <br />
        <Button type="primary" onClick={onBack}>
          Go Back
        </Button>
      </div>
    );
  }

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

  const handleSubmit = async (values) => {
    if (!isAuthenticated || !user) {
      message.error('Please login to continue');
      return;
    }

    try {
      setSubmitting(true);

      // Simulate order creation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock order data
      const mockOrder = {
        _id: `mock_order_${Date.now()}`,
        orderNumber: `MOCK-${Date.now().toString().slice(-6)}`,
        buyerId: user._id,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: getTotalPrice(),
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          fullName: user.fullName,
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
          phone: values.phone
        },
        paymentMethod: values.paymentMethod,
        notes: values.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🎭 Mock order created:', mockOrder);

      message.success('Mock order placed successfully! (Backend integration pending)');
      
      // Clear cart after successful order
      clearCart();
      
      // Call success callback
      if (onOrderSuccess) {
        onOrderSuccess(mockOrder);
      }
    } catch (error) {
      console.error(' Mock order error:', error);
      message.error('Failed to create mock order');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header with Warning */}
      <div className="mb-6">
        <Alert
          message="Development Mode - Mock Orders"
          description="This is a temporary mock order system while the backend integration is being resolved. Orders created here are for development purposes only."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="mb-4"
        />
        
        <Button 
          onClick={onBack}
          className="mb-4"
        >
          Back to Cart
        </Button>
        
        <Title level={2} className="mb-2">
          <ShoppingOutlined className="mr-2" />
          Mock Checkout
        </Title>
        <Text type="secondary">
          Review your order and complete your purchase (Mock Mode)
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div>
          <Card title="Order Summary" className="mb-4">
            <Space direction="vertical" className="w-full">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded">
                  <img
                    src={item.image || 'https://via.placeholder.com/60x60'}
                    alt={item.name}
                    className="w-15 h-15 rounded object-cover"
                  />
                  <div className="flex-1">
                    <Text strong className="block">{item.name}</Text>
                    <Text type="secondary" className="text-sm">
                      Quantity: {item.quantity}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      Price: {formatPrice(item.price)}
                    </Text>
                  </div>
                  <Text strong className="text-lg">
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </div>
              ))}
              
              <Divider />
              
              <div className="flex justify-between items-center">
                <Text strong>Subtotal:</Text>
                <Text>{formatPrice(getTotalPrice())}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>Shipping:</Text>
                <Text>Free</Text>
              </div>
              <Divider />
              <div className="flex justify-between items-center text-lg">
                <Text strong>Total:</Text>
                <Text strong className="text-blue-600">
                  {formatPrice(getTotalPrice())}
                </Text>
              </div>
            </Space>
          </Card>
        </div>

        {/* Checkout Form */}
        <div>
          <Card title="Shipping Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                fullName: user?.fullName || '',
                country: 'United Kingdom',
                paymentMethod: 'credit_card'
              }}
            >
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>

              <Form.Item
                name="street"
                label="Street Address"
                rules={[{ required: true, message: 'Please enter your street address' }]}
              >
                <Input placeholder="Enter your street address" />
              </Form.Item>

              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter your city' }]}
              >
                <Input placeholder="Enter your city" />
              </Form.Item>

              <Form.Item
                name="state"
                label="State/County"
                rules={[{ required: true, message: 'Please enter your state/county' }]}
              >
                <Input placeholder="Enter your state/county" />
              </Form.Item>

              <Form.Item
                name="zipCode"
                label="Postal Code"
                rules={[{ required: true, message: 'Please enter your postal code' }]}
              >
                <Input placeholder="Enter your postal code" />
              </Form.Item>

              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please select your country' }]}
              >
                <Select placeholder="Select country">
                  <Select.Option value="United Kingdom">United Kingdom</Select.Option>
                  <Select.Option value="United States">United States</Select.Option>
                  <Select.Option value="Canada">Canada</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{ required: true, message: 'Please select a payment method' }]}
              >
                <Select placeholder="Select payment method">
                  <Select.Option value="credit_card">Credit Card</Select.Option>
                  <Select.Option value="paypal">PayPal</Select.Option>
                  <Select.Option value="bank_transfer">Bank Transfer</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label="Order Notes (Optional)"
              >
                <TextArea 
                  placeholder="Any special instructions for your order"
                  rows={2}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                  className="w-full h-12 text-lg"
                  icon={<CheckCircleOutlined />}
                >
                  {submitting ? 'Creating Mock Order...' : `Place Mock Order - ${formatPrice(getTotalPrice())}`}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderMock;






