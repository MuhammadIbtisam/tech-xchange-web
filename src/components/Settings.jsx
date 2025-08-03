import React, { useState } from 'react';
import { Card, Switch, Slider, Select, Button, Typography, Space, Divider, Row, Col, Input, message } from 'antd';
import { SettingOutlined, BellOutlined, EyeOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    darkMode: false,
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false,
      analytics: true,
    },
    language: 'en',
    timezone: 'UTC',
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAccessibilityChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    message.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card title="Profile Settings" icon={<UserOutlined />}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <Input placeholder="Enter your display name" />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input type="email" placeholder="Enter your email" />
            </div>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <Select
                value={settings.language}
                onChange={(value) => handleSettingChange('language', value)}
                className="w-full"
              >
                <Option value="en">English</Option>
                <Option value="es">Spanish</Option>
                <Option value="fr">French</Option>
                <Option value="de">German</Option>
                <Option value="zh">Chinese</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <Select
                value={settings.timezone}
                onChange={(value) => handleSettingChange('timezone', value)}
                className="w-full"
              >
                <Option value="UTC">UTC</Option>
                <Option value="EST">Eastern Time</Option>
                <Option value="PST">Pacific Time</Option>
                <Option value="GMT">GMT</Option>
                <Option value="CET">Central European Time</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Notification Settings */}
      <Card title="Notification Settings" icon={<BellOutlined />}>
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Push Notifications</Text>
              <br />
              <Text type="secondary">Receive notifications on your device</Text>
            </div>
            <Switch
              checked={settings.notifications}
              onChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>
          
          <Divider />
          
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Email Notifications</Text>
              <br />
              <Text type="secondary">Receive notifications via email</Text>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <Divider />
          
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Dark Mode</Text>
              <br />
              <Text type="secondary">Use dark theme for better visibility</Text>
            </div>
            <Switch
              checked={settings.darkMode}
              onChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
        </Space>
      </Card>

      {/* Accessibility Settings */}
      <Card title="Accessibility Settings" icon={<EyeOutlined />}>
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <Text strong>High Contrast Mode</Text>
              <br />
              <Text type="secondary">Increase contrast for better visibility</Text>
            </div>
            <Switch
              checked={settings.accessibility.highContrast}
              onChange={(checked) => handleAccessibilityChange('highContrast', checked)}
            />
          </div>
          
          <Divider />
          
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Large Text</Text>
              <br />
              <Text type="secondary">Use larger text for better readability</Text>
            </div>
            <Switch
              checked={settings.accessibility.largeText}
              onChange={(checked) => handleAccessibilityChange('largeText', checked)}
            />
          </div>
          
          <Divider />
          
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Reduced Motion</Text>
              <br />
              <Text type="secondary">Reduce animations and transitions</Text>
            </div>
            <Switch
              checked={settings.accessibility.reducedMotion}
              onChange={(checked) => handleAccessibilityChange('reducedMotion', checked)}
            />
          </div>
          
          <Divider />
          
          <div>
            <Text strong>Text Size</Text>
            <br />
            <Text type="secondary">Adjust text size for better readability</Text>
            <div className="mt-4">
              <Slider
                min={12}
                max={24}
                defaultValue={16}
                marks={{
                  12: 'Small',
                  16: 'Medium',
                  20: 'Large',
                  24: 'Extra Large'
                }}
                className="w-full"
              />
            </div>
          </div>
        </Space>
      </Card>

      {/* Privacy Settings */}
      <Card title="Privacy Settings" icon={<LockOutlined />}>
        <Space direction="vertical" className="w-full">
          <div>
            <Text strong>Profile Visibility</Text>
            <br />
            <Text type="secondary">Control who can see your profile</Text>
            <div className="mt-2">
              <Select
                value={settings.privacy.profileVisibility}
                onChange={(value) => handlePrivacyChange('profileVisibility', value)}
                className="w-full"
              >
                <Option value="public">Public</Option>
                <Option value="friends">Friends Only</Option>
                <Option value="private">Private</Option>
              </Select>
            </div>
          </div>
          
          <Divider />
          
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Data Sharing</Text>
              <br />
              <Text type="secondary">Allow sharing of your data for research</Text>
            </div>
            <Switch
              checked={settings.privacy.dataSharing}
              onChange={(checked) => handlePrivacyChange('dataSharing', checked)}
            />
          </div>
          
          <Divider />
          
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Analytics</Text>
              <br />
              <Text type="secondary">Help us improve by sharing usage analytics</Text>
            </div>
            <Switch
              checked={settings.privacy.analytics}
              onChange={(checked) => handlePrivacyChange('analytics', checked)}
            />
          </div>
        </Space>
      </Card>

      {/* Save Button */}
      <div className="text-center">
        <Button
          type="primary"
          size="large"
          onClick={handleSave}
          className="px-8"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings; 