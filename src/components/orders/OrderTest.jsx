import React, { useState } from 'react';
import { Button, Card, Typography, Space, message, Input, Form, InputNumber, Select } from 'antd';
import { ShoppingOutlined, CheckOutlined } from '@ant-design/icons';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const OrderTest = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestOrder = async (values) => {
    setLoading(true);
    try {
      // Test with a real product ID from your backend
      const productId = '68af3cfa18206ea57992f41e'; // iPhone 15 Pro
      
      const orderData = {
        quantity: values.quantity,
        shippingAddress: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
          phone: values.phone
        },
        paymentMethod: values.paymentMethod,
        shippingMethod: 'standard',
        shippingCost: 0,
        notes: values.notes || ''
      };

      console.log(' Testing order creation with:', {
        productId,
        orderData
      });

      // Get token from localStorage (user must be logged in)
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login first to test order creation');
        setLoading(false);
        return;
      }

      // Test the order creation
      const result = await orderService.createOrder(productId, orderData, token);
      
      setTestResult({
        success: true,
        data: result,
        message: 'Order created successfully!'
      });
      
      message.success('Order test successful!');
      form.resetFields();
      
    } catch (error) {
      console.error(' Order test failed:', error);
      setTestResult({
        success: false,
        error: error.message,
        message: 'Order test failed'
      });
      message.error(`Order test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <Title level={3} className="mb-4">
          <ShoppingOutlined className="mr-2" />
          Order System Test
        </Title>
        
        <Text type="secondary" className="block mb-6">
          Test the order creation system with the correct backend API structure
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleTestOrder}
          initialValues={{
            quantity: 1,
            country: 'United Kingdom',
            paymentMethod: 'credit_card'
          }}
        >
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} max={10} className="w-full" />
          </Form.Item>

          <Form.Item
            name="street"
            label="Street Address"
            rules={[{ required: true, message: 'Please enter street address' }]}
          >
            <Input placeholder="123 Test Street" />
          </Form.Item>

          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Please enter city' }]}
          >
            <Input placeholder="London" />
          </Form.Item>

          <Form.Item
            name="state"
            label="State/County"
            rules={[{ required: true, message: 'Please enter state/county' }]}
          >
            <Input placeholder="England" />
          </Form.Item>

          <Form.Item
            name="zipCode"
            label="Postal Code"
            rules={[{ required: true, message: 'Please enter postal code' }]}
          >
            <Input placeholder="SW1A 1AA" />
          </Form.Item>

          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please select country' }]}
          >
            <Select>
              <Select.Option value="United Kingdom">United Kingdom</Select.Option>
              <Select.Option value="United States">United States</Select.Option>
              <Select.Option value="Canada">Canada</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input placeholder="+447911123456" />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select>
              <Select.Option value="credit_card">Credit Card</Select.Option>
              <Select.Option value="paypal">PayPal</Select.Option>
              <Select.Option value="bank_transfer">Bank Transfer</Select.Option>
              <Select.Option value="cash_on_delivery">Cash on Delivery</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Order Notes (Optional)"
          >
            <TextArea 
              placeholder="Any special instructions for this test order"
              rows={2}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CheckOutlined />}
              size="large"
              className="w-full"
            >
              {loading ? 'Testing Order Creation...' : 'Test Order Creation'}
            </Button>
          </Form.Item>
        </Form>

        {/* Test Results */}
        {testResult && (
          <div className="mt-6 p-4 border rounded">
            <Title level={4} className={`mb-2 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.success ? ' Test Successful' : ' Test Failed'}
            </Title>
            <Text className="block mb-2">{testResult.message}</Text>
            
            {testResult.success && testResult.data && (
              <div className="mt-3 p-3 bg-green-50 rounded">
                <Text strong>Order Details:</Text>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
            
            {!testResult.success && testResult.error && (
              <div className="mt-3 p-3 bg-red-50 rounded">
                <Text strong>Error Details:</Text>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                  {testResult.error}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <Title level={5} className="mb-2">Test Instructions:</Title>
          <Space direction="vertical" className="w-full">
            <Text className="block">1. Make sure you're logged in as a buyer</Text>
            <Text className="block">2. Fill out the form above</Text>
            <Text className="block">3. Click "Test Order Creation"</Text>
            <Text className="block">4. Check the results below</Text>
            <Text className="block">5. Check browser console for detailed logs</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default OrderTest;





