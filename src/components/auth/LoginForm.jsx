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
      message.error(error.message || 'Network error. Please try again.');
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
