import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Select, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ShopOutlined } from '@ant-design/icons';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import authService from '../../services/authService';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Form values being sent:', values)
    console.log("Role Value", values.role)
    try {
      const data = await authService.register({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: values.role,
      });

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        message.success(`Registration successful! Welcome to TechXchange, ${data.user.fullName}!`);
        onRegisterSuccess(data.user);
      } else {
        message.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <Card className="w-full max-w-sm sm:max-w-lg xl:max-w-xl shadow-2xl border-0 mx-2 sm:mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-3xl sm:text-4xl lg:text-5xl mb-4">🌟</div>
          <Title level={2} className="mb-2 text-gray-800 text-xl sm:text-2xl lg:text-3xl">
            TechXchange
          </Title>
          <Text className="text-gray-600 text-base sm:text-lg">
            Join our community! Create your account
          </Text>
        </div>

        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          className="space-y-3 sm:space-y-4"
        >
          <Form.Item
            name="fullName"
            rules={[
              { required: true, message: 'Please input your full name!' },
              { min: 2, message: 'Name must be at least 2 characters!' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Full name"
              className="h-10 sm:h-12 rounded-lg"
            />
          </Form.Item>

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
            name="phoneNumber"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^[0-9]{10,15}$/, message: 'Please enter a valid phone number (10-15 digits)!' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Phone number"
              className="h-10 sm:h-12 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number!'
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
              className="h-10 sm:h-12 rounded-lg"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Confirm password"
              className="h-10 sm:h-12 rounded-lg"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item name='role' label="I want to:" className="mb-4 sm:mb-6" rules={[{ required: true, message: 'Please select your role!' }]}>
            <Radio.Group className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Radio.Button 
                  value="buyer" 
                  className="w-full text-center h-10 sm:h-12 flex items-center justify-center border-2 hover:border-blue-500 transition-all duration-200"
                >
                  <UserOutlined className="mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Buy Products</span>
                </Radio.Button>
                <Radio.Button 
                  value="seller" 
                  className="w-full text-center h-10 sm:h-12 flex items-center justify-center border-2 hover:border-blue-500 transition-all duration-200"
                >
                  <ShopOutlined className="mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Sell Products</span>
                </Radio.Button>
              </div>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-10 sm:h-12 rounded-lg bg-blue-600 hover:bg-blue-700 border-0 text-white font-medium text-base sm:text-lg transition-all duration-200"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <Divider className="text-gray-400 my-4 sm:my-6">or</Divider>

        <div className="text-center mt-4 sm:mt-6">
          <Text className="text-gray-600">
            Already have an account?{' '}
          </Text>
          <Button
            type="link"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 p-0 font-medium"
          >
            Sign in now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm;
