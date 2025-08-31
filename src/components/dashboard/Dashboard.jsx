import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SellerDashboard from './SellerDashboard';
import BuyerDashboard from './BuyerDashboard';
import AdminDashboard from './AdminDashboard';
import { Spin, Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <div className="mt-4">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You need to be logged in to access the dashboard."
        extra={[
          <Button type="primary" key="login" onClick={() => navigate('/login')}>
            Go to Login
          </Button>,
          <Button key="home" onClick={() => navigate('/')}>
            Go Home
          </Button>
        ]}
      />
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'seller':
      return <SellerDashboard />;
    case 'buyer':
      return <BuyerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <Result
          status="404"
          title="Dashboard Not Found"
          subTitle={`Dashboard for role "${user.role}" is not implemented yet.`}
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/')}>
              Go Home
            </Button>
          ]}
        />
      );
  }
};

export default Dashboard;
