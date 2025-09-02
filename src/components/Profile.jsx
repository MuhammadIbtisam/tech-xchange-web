import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Row, Col, Input, message, Spin, Avatar, Space, Divider } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const { Title, Text } = Typography;

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Refs for input fields
  const displayNameRef = useRef(null);
  const emailRef = useRef(null);

  const [profile, setProfile] = useState({
    displayName: user?.fullName || '',
    email: user?.email || '',
  });

  const [originalProfile, setOriginalProfile] = useState({
    displayName: user?.fullName || '',
    email: user?.email || '',
  });

  console.log(' Profile component render:', { 
    user: user ? { fullName: user.fullName, email: user.email } : null, 
    token: !!token,
    profile,
    editing
  });
  
  // Load user data on component mount
  useEffect(() => {
    if (user && token) {
      loadUserData();
    }
  }, [user, token]);

  // Update profile when user context changes
  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.fullName || '',
        email: user.email || '',
      });
      setOriginalProfile({
        displayName: user.fullName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setInitialLoading(true);
      
      console.log('🔄 Loading user profile data...');
      console.log(' User context:', { fullName: user?.fullName, email: user?.email });
      
      // Set initial profile data from user context
      setProfile({
        displayName: user?.fullName || '',
        email: user?.email || '',
      });
      setOriginalProfile({
        displayName: user?.fullName || '',
        email: user?.email || '',
      });
      
      // Try to load additional data from API
      if (token) {
        try {
          const profileData = await userService.getUserProfile(token);
          console.log('📥 API profile data:', profileData);
          
          if (profileData?.user) {
            const userData = {
              displayName: profileData.user.fullName || user?.fullName || '',
              email: profileData.user.email || user?.email || '',
            };
            setProfile(userData);
            setOriginalProfile(userData);
          }
        } catch (apiError) {
          console.log('⚠️ API profile loading failed, using context data:', apiError.message);
          // Continue with user context data - this is fine
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      // Keep the fallback data from user context
    } finally {
      setInitialLoading(false);
    }
  };

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditing(false);
  };

  const handleSave = async () => {
    console.log('🚀 Save profile button clicked!');
    console.log(' Current profile state:', profile);
    
    if (!token) {
      message.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      
      // Update profile
      console.log('📤 Updating profile...');
      const profileData = {
        fullName: profile.displayName,
        email: profile.email
      };
      
      console.log(' Profile data to send:', profileData);
      const profileResponse = await userService.updateProfile(profileData, token);
      console.log('📥 Profile response:', profileResponse);
      
      if (profileResponse?.success) {
        // Check if this is a mock response (offline mode)
        if (profileResponse.message && profileResponse.message.includes('offline mode')) {
          message.warning('Profile updated locally (backend endpoint not available)');
        } else {
          message.success('Profile updated successfully!');
        }
        
        // Update local state with the response data
        if (profileResponse.user) {
          const updatedProfile = {
            displayName: profileResponse.user.fullName || profile.displayName,
            email: profileResponse.user.email || profile.email,
          };
          
          setProfile(updatedProfile);
          setOriginalProfile(updatedProfile);
          setEditing(false);
          console.log('✅ Local state updated with saved data:', updatedProfile);
          
          // Update global user state in AuthContext
          const updatedUser = {
            ...user,
            fullName: profileResponse.user.fullName,
            email: profileResponse.user.email,
          };
          
          updateUser(updatedUser);
          console.log('✅ Global user state updated:', updatedUser);
        }
      } else {
        throw new Error('Profile update failed');
      }
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      
      // Provide more user-friendly error messages
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        message.warning('Profile updated locally (backend service not available)');
        
        // Still update the local state even if backend fails
        const updatedProfile = {
          displayName: profile.displayName,
          email: profile.email,
        };
        
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);
        setEditing(false);
        
        // Update global user state in AuthContext
        const updatedUser = {
          ...user,
          fullName: profile.displayName,
          email: profile.email,
        };
        
        updateUser(updatedUser);
      } else {
        message.error(`Failed to save profile: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) {
      message.error('Not authenticated');
      return;
    }

    try {
      setInitialLoading(true);
      await loadUserData();
      message.success('Profile refreshed successfully!');
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
      message.error('Failed to refresh profile');
    } finally {
      setInitialLoading(false);
    }
  };

  const hasChanges = () => {
    return profile.displayName !== originalProfile.displayName || 
           profile.email !== originalProfile.email;
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
        <Text className="ml-3">Loading your profile...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            className="bg-blue-500 text-white text-2xl"
          />
          <div className="flex-1">
            <Title level={2} className="mb-2">
              {user?.fullName || 'User Profile'}
            </Title>
            <Text type="secondary" className="text-lg">
              {user?.email}
            </Text>
            <div className="mt-2">
              <Text className="capitalize">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.role}
                </span>
              </Text>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshProfile}
              disabled={loading}
            >
              Refresh
            </Button>
            {!editing ? (
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
            ) : (
              <Space>
                <Button onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSave}
                  loading={loading}
                  disabled={!hasChanges()}
                >
                  Save Changes
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card title="Profile Information">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {editing ? (
                <Input 
                  placeholder="Enter your full name" 
                  value={profile.displayName || ''}
                  onChange={(e) => handleProfileChange('displayName', e.target.value)}
                  ref={displayNameRef}
                  size="large"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded border text-lg">
                  {profile.displayName || 'Not set'}
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              {editing ? (
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={profile.email || ''}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  ref={emailRef}
                  size="large"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded border text-lg">
                  {profile.email || 'Not set'}
                </div>
              )}
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
                {user?._id || 'Not available'}
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="p-3 bg-gray-50 rounded border text-lg capitalize">
                {user?.role || 'Not set'}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Account Statistics */}
      <Card title="Account Information">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Member Since</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                Active
              </div>
              <div className="text-sm text-gray-600">Account Status</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 capitalize">
                {user?.role || 'User'}
              </div>
              <div className="text-sm text-gray-600">Account Type</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile;
