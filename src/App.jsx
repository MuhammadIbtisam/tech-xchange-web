import React, { useState } from 'react';
import { Layout, Menu, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, HomeOutlined, FormOutlined, SettingOutlined } from '@ant-design/icons';
import './App.css';
import ContactForm from './components/ContactForm';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

function App() {
  const [selectedKey, setSelectedKey] = useState('1');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <FormOutlined />,
      label: 'Contact Form',
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <Dashboard />;
      case '2':
        return <ContactForm />;
      case '3':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        className="bg-white shadow-lg"
        theme="light"
      >
        <div className="p-4">
          <Title level={4} className="text-center mb-0">
            {collapsed ? 'TX' : 'Tech Exchange'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
          className="border-r-0"
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
          <Title level={3} className="mb-0">
            {selectedKey === '1' && 'Dashboard'}
            {selectedKey === '2' && 'Contact Form'}
            {selectedKey === '3' && 'Settings'}
          </Title>
          <Space>
            <Button type="text" icon={<UserOutlined />}>
              Profile
            </Button>
          </Space>
        </Header>
        
        <Content className="p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
