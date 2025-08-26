import React from 'react';
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown } from 'antd';
import { UserOutlined, HomeOutlined, ShoppingOutlined, SettingOutlined, LogoutOutlined, ShopOutlined } from '@ant-design/icons';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// Main App Content Component
const AppContent = () => {
  const { user, isAuthenticated, isSeller, isBuyer, logout, login, register } = useAuth();
  const [selectedKey, setSelectedKey] = React.useState('1');
  const [collapsed, setCollapsed] = React.useState(false);

  // If not authenticated, show auth page
  if (!isAuthenticated) {
    return (
      <AuthPage 
        onLoginSuccess={(userData) => login(userData, userData.token)}
        onRegisterSuccess={(userData) => register(userData, userData.token)}
      />
    );
  }

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <ShoppingOutlined />,
      label: 'Products',
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  // Add seller-specific menu items
  if (isSeller) {
    menuItems.push({
      key: '4',
      icon: <ShopOutlined />,
      label: 'My Products',
    });
  }

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <Dashboard />;
      case '2':
        return <div className="p-6">Products page coming soon...</div>;
      case '3':
        return <Settings />;
      case '4':
        return <div className="p-6">My Products page coming soon...</div>;
      default:
        return <Dashboard />;
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

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
            {selectedKey === '2' && 'Products'}
            {selectedKey === '3' && 'Settings'}
            {selectedKey === '4' && 'My Products'}
          </Title>
          <Space>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <Text strong className="block">{user?.fullName}</Text>
                <Text type="secondary" className="text-sm capitalize">{user?.role}</Text>
              </div>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Avatar 
                  size="large" 
                  icon={<UserOutlined />}
                  className="cursor-pointer hover:opacity-80"
                />
              </Dropdown>
            </div>
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
};

// Main App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
