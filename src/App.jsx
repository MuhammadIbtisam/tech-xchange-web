import React from 'react';
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown } from 'antd';
import { UserOutlined, HomeOutlined, ShoppingOutlined, SettingOutlined, LogoutOutlined, ShopOutlined, MenuOutlined, CloseOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import ProductsPage from './components/products/ProductsPage';
import CartPage from './components/cart/CartPage';
import ProductDetailPage from './components/products/ProductDetailPage';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// Main App Content Component
const AppContent = () => {
  const { user, isAuthenticated, isSeller, isBuyer, logout, login, register } = useAuth();
  const { cartItemCount } = useCart();
  const [selectedKey, setSelectedKey] = React.useState('1');
  const [collapsed, setCollapsed] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = React.useState(false);
  const [showCart, setShowCart] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);

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
    if (showCart) {
      return <CartPage onBack={() => setShowCart(false)} />;
    }
    
    if (selectedProduct) {
      return (
        <ProductDetailPage 
          product={selectedProduct} 
          onBack={() => setSelectedProduct(null)}
          onRefresh={() => {
            // Refresh products if needed
            setSelectedProduct(null);
          }}
        />
      );
    }
    
    switch (selectedKey) {
      case '1':
        return <Dashboard />;
      case '2':
        return <ProductsPage onProductView={setSelectedProduct} />;
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
      {/* Mobile Sidebar Overlay */}
      {sidebarVisible && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarVisible(false)}
        />
      )}
      
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        className={`bg-gradient-to-b from-white to-gray-50 shadow-xl transition-transform duration-300 ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:relative fixed left-0 top-0 h-full z-50`}
        theme="light"
        width={256}
      >
        <div className="p-6 text-center relative">
          {/* Mobile Close Button */}
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setSidebarVisible(false)}
            className="lg:hidden absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            size="small"
          />
          
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
          onClick={({ key }) => {
            setSelectedKey(key);
            // Close sidebar on mobile when menu item is clicked
            if (window.innerWidth < 1024) {
              setSidebarVisible(false);
            }
          }}
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
          
          {/* Mobile Menu Toggle */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="lg:hidden text-white hover:text-blue-200 hover:bg-white/10"
            size="large"
          />
          
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
            {/* Cart Icon */}
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              onClick={() => setShowCart(true)}
              className="text-white hover:text-blue-200 hover:bg-white/10 relative"
              size="large"
            >
              {cartItemCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </div>
              )}
            </Button>
            
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
          <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 pt-6">
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
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
