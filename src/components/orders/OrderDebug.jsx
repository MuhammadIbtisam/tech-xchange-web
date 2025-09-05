import React, { useState } from 'react';
import { Button, Card, Typography, Space, message, Input, Form, InputNumber, Select, Divider, Radio } from 'antd';
import { BugOutlined, ShoppingOutlined, ExperimentOutlined } from '@ant-design/icons';
import orderService from '../../services/orderService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const OrderDebug = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testMode, setTestMode] = useState('standard');

  const testProducts = [
    { id: '68af3cfa18206ea57992f41e', name: 'iPhone 15 Pro', price: 161 },
    { id: '68af3cfa18206ea57992f420', name: 'MacBook Pro 16"', price: 1379 },
    { id: '68af3cfa18206ea57992f42c', name: 'Spectre x360 14', price: 1435 }
  ];

  const handleTestOrder = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login first to test order creation');
        setLoading(false);
        return;
      }

      // Test with the selected product
      const productId = values.productId;
      const selectedProduct = testProducts.find(p => p.id === productId);
      
      let orderData;

      // Test different data structures based on mode
      if (testMode === 'minimal') {
        // Minimal required fields only
        orderData = {
          buyerId: user._id, // Add buyerId as required by backend
          quantity: Number(values.quantity),
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
      } else if (testMode === 'extended') {
        // Extended with optional fields
        orderData = {
          buyerId: user._id, // Add buyerId as required by backend
          quantity: Number(values.quantity),
          shippingAddress: {
            street: values.street.trim(),
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: values.zipCode.trim(),
            country: values.country.trim(),
            phone: values.phone.trim()
          },
          paymentMethod: values.paymentMethod,
          shippingMethod: 'standard',
          shippingCost: 0,
          notes: values.notes?.trim() || ''
        };
      } else {
        // Standard mode - match backend docs exactly
        orderData = {
          buyerId: user._id, // Add buyerId as required by backend
          quantity: Number(values.quantity),
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
      }

      console.log(' Debug order creation:', {
        testMode,
        productId,
        productName: selectedProduct?.name,
        orderData: JSON.stringify(orderData, null, 2)
      });

      // Test the order creation
      const result = await orderService.createOrder(productId, orderData, token);
      
      setTestResult({
        success: true,
        data: result,
        message: `Order created successfully for ${selectedProduct?.name}! (${testMode} mode)`
      });
      
      message.success('Order test successful!');
      form.resetFields();
      
    } catch (error) {
      console.error(' Order debug failed:', error);
      setTestResult({
        success: false,
        error: error.message,
        message: `Order test failed (${testMode} mode)`
      });
      message.error(`Order test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <Title level={3} className="mb-4">
          <BugOutlined className="mr-2" />
          Order System Debug
        </Title>
        
        <Text type="secondary" className="block mb-6">
          Debug order creation with different products and data structures
        </Text>

        {/* Test Mode Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <Title level={5} className="mb-3">Test Mode:</Title>
          <Radio.Group value={testMode} onChange={(e) => setTestMode(e.target.value)}>
            <Space direction="vertical">
              <Radio value="minimal">
                <Text strong>Minimal Mode</Text> - Only required fields
              </Radio>
              <Radio value="standard">
                <Text strong>Standard Mode</Text> - Match backend docs exactly
              </Radio>
              <Radio value="extended">
                <Text strong>Extended Mode</Text> - Include optional fields
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleTestOrder}
          initialValues={{
            productId: '68af3cfa18206ea57992f41e',
            quantity: 1,
            country: 'United Kingdom',
            paymentMethod: 'credit_card'
          }}
        >
          <Form.Item
            name="productId"
            label="Test Product"
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            <Select>
              {testProducts.map(product => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name} - £{product.price}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} max={10} className="w-full" />
          </Form.Item>

          <Divider>Shipping Information</Divider>

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
              icon={<ExperimentOutlined />}
              size="large"
              className="w-full"
            >
              {loading ? 'Testing Order Creation...' : `Debug Order Creation (${testMode} mode)`}
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

        {/* Debug Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <Title level={5} className="mb-2">Debug Instructions:</Title>
          <Space direction="vertical" className="w-full">
            <Text className="block">1. Make sure you're logged in as a buyer</Text>
            <Text className="block">2. Select different test modes to isolate the issue</Text>
            <Text className="block">3. Try different products to see if it's product-specific</Text>
            <Text className="block">4. Check browser console for detailed logs</Text>
            <Text className="block">5. Compare results between modes and products</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default OrderDebug;
