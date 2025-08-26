import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [testClicks, setTestClicks] = useState(0);

  const onFinish = async (values) => {
    console.log('Form submitted with values:', values);
    console.log('About to fetch from: http://localhost:3000/api/auth/login');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('API response:', data);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        message.success('Login successful! Welcome back!');
        onLoginSuccess(data.user);
      } else {
        message.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      message.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestClick = () => {
    console.log('Test button clicked!');
    setTestClicks(prev => prev + 1);
    alert(`Test button clicked ${testClicks + 1} times!`);
  };

  const handleSwitchToRegister = () => {
    console.log('Switch to register clicked!');
    if (onSwitchToRegister) {
      onSwitchToRegister();
    }
  };

  const handleHtmlButtonClick = () => {
    console.log('HTML button clicked!');
    alert('HTML button is working!');
  };

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection to: http://localhost:3000/api');
      const response = await fetch('http://localhost:3000/api');
      const data = await response.json();
      console.log('Backend test successful:', data);
      alert('✅ Backend connection working!\n\n' + JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Backend test failed:', error);
      alert('❌ Backend connection failed!\n\nError: ' + error.message);
    }
  };

  const testCors = async () => {
    try {
      console.log('Testing CORS with OPTIONS request');
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('CORS test successful:', response);
      alert('✅ CORS is working!\n\nStatus: ' + response.status);
    } catch (error) {
      console.error('CORS test failed:', error);
      alert('❌ CORS test failed!\n\nError: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚀</div>
          <Title level={2} className="mb-2 text-gray-800">
            TechXchange
          </Title>
          <Text className="text-gray-600 text-lg">
            Welcome back! Sign in to your account
          </Text>
        </div>

        {/* Backend Connection Test */}
        <div className="mb-4 text-center">
          <Button 
            type="primary"
            onClick={testBackendConnection}
            className="mb-2 w-full"
            style={{ backgroundColor: '#10b981' }}
          >
            🔗 Test Backend Connection
          </Button>
        </div>

        {/* CORS Test */}
        <div className="mb-4 text-center">
          <Button 
            type="default"
            onClick={testCors}
            className="mb-2 w-full"
            style={{ backgroundColor: '#f59e0b' }}
          >
            🌐 Test CORS
          </Button>
        </div>

        {/* HTML Button Test */}
        <div className="mb-4 text-center">
          <button 
            type="button"
            onClick={handleHtmlButtonClick}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2"
          >
            🧪 HTML Button Test
          </button>
        </div>

        {/* Ant Design Test Button */}
        <div className="mb-4 text-center">
          <Button 
            type="default" 
            onClick={handleTestClick}
            className="mb-4"
          >
            🧪 Ant Design Button (Clicked: {testClicks})
          </Button>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Email address"
              className="h-12 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
              className="h-12 rounded-lg"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item className="mb-6">
            <div className="flex justify-between items-center">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2" />
                <Text className="text-gray-600">Remember me</Text>
              </label>
              <Button type="link" className="text-blue-600 hover:text-blue-800 p-0">
                Forgot password?
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 border-0 text-white font-medium text-lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider className="text-gray-400">or</Divider>

        <div className="text-center">
          <Text className="text-gray-600">
            Don't have an account?{' '}
          </Text>
          <Button
            type="link"
            onClick={handleSwitchToRegister}
            className="text-blue-600 hover:text-blue-800 p-0 font-medium"
          >
            Sign up now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
