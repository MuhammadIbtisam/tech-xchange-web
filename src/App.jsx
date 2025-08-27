import React from 'react';
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown } from 'antd';
import { UserOutlined, HomeOutlined, ShoppingOutlined, SettingOutlined, LogoutOutlined, ShopOutlined } from '@ant-design/icons';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import ProductsPage from './components/products/ProductsPage';

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
        onLoginSuccess={(userData) => login(userData.user, userData.token)}
        onRegisterSuccess={(userData) => register(userData.user, userData.token)}
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
        return <ProductsPage />;
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
        className="bg-gradient-to-b from-white to-gray-50 shadow-xl"
        theme="light"
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">TX</span>
          </div>
          {!collapsed && (
            <Title level={4} className="text-gray-800 mb-0 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tech Exchange
            </Title>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
          className="border-r-0 px-3"
          style={{
            background: 'transparent',
          }}
        />
      </Sider>
      
      <Layout>
        <Header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg px-6 py-4 flex items-center justify-between min-h-[80px] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
          </div>
          
          {/* Page Title with Icon */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              {selectedKey === '1' && <HomeOutlined className="text-white text-lg" />}
              {selectedKey === '2' && <ShoppingOutlined className="text-white text-lg" />}
              {selectedKey === '3' && <SettingOutlined className="text-white text-lg" />}
              {selectedKey === '4' && <ShopOutlined className="text-white text-lg" />}
            </div>
            <Title level={3} className="mb-0 text-white font-bold">
              {selectedKey === '1' && 'Dashboard'}
              {selectedKey === '2' && 'Products'}
              {selectedKey === '3' && 'Settings'}
              {selectedKey === '4' && 'My Products'}
            </Title>
          </div>
          
          {/* User Profile Section */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="text-right">
              <Text strong className="block text-white text-base leading-tight font-semibold">
                {user?.fullName}
              </Text>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Text className="text-blue-100 text-sm capitalize leading-tight">
                  {user?.role}
                </Text>
              </div>
            </div>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="cursor-pointer group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 group-hover:border-white/50 transition-all duration-300 group-hover:scale-110">
                  <Avatar 
                    size="default"
                    icon={<UserOutlined />}
                    className="bg-transparent text-white"
                  />
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="bg-gray-50">
          <div className="max-w-6xl mx-auto p-6 pt-6">
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
