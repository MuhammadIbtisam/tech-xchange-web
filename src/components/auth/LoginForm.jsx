import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import authService from '../../services/authService';

const { Title, Text } = Typography;

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    console.log('Form submitted with values:', values);
    setLoading(true);
    try {
      const data = await authService.login({
        email: values.email,
        password: values.password,
      });

      console.log('API response:', data);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
      }
  
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        message.success('Login successful! Welcome back!');
        onLoginSuccess(data);
      } else {
        const errorMessage = data.message || 'Login failed. Please check your credentials.';
        message.error(errorMessage);
        console.warn('Login failed:', data);
      }
    } catch (error) {
      console.error('Login error:', error);
      let userMessage = 'An unexpected error occurred. Please try again.';
    
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timeout. Please try again.';
      } else if (error.message.includes('Invalid response')) {
        userMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Missing authentication')) {
        userMessage = 'Authentication error. Please try again.';
      } else if (error.message) {
        userMessage = error.message;
      }
      message.error(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    console.log('Switch to register clicked!');
    if (onSwitchToRegister) {
      onSwitchToRegister();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <Card className="w-full max-w-sm sm:max-w-lg xl:max-w-xl shadow-2xl border-0 mx-2 sm:mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-3xl sm:text-4xl lg:text-5xl mb-4">🚀</div>
          <Title level={2} className="mb-2 text-gray-800 text-xl sm:text-2xl lg:text-3xl">
            TechXchange
          </Title>
          <Text className="text-gray-600 text-base sm:text-lg">
            Welcome back! Sign in to your account
          </Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          className="space-y-3 sm:space-y-4"
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
              className="h-10 sm:h-12 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
              className="h-10 sm:h-12 rounded-lg"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item className="mb-4 sm:mb-6">
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
              className="w-full h-10 sm:h-12 rounded-lg bg-blue-600 hover:bg-blue-700 border-0 text-white font-medium text-base sm:text-lg transition-all duration-200"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider className="text-gray-400 my-4 sm:my-6">or</Divider>

        <div className="text-center mt-4 sm:mt-6">
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
