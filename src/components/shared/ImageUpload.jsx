import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Button, 
  message, 
  Progress, 
  Image, 
  Space, 
  Typography,
  Card,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import imageUploadService from '../../services/imageUploadService';

const { Dragger } = Upload;
const { Text } = Typography;

const ImageUpload = ({ 
  productId, 
  onUploadSuccess, 
  onUploadError,
  maxFiles = 10,
  maxSize = 5, // MB
  existingImages = [],
  showPreview = true,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (info) => {
    const { fileList } = info;
    
    // Filter out files that are still uploading
    const newFiles = fileList.filter(file => file.status !== 'uploading');
    
    // Validate file count
    if (newFiles.length > maxFiles) {
      message.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const validFiles = [];
    for (const file of newFiles) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        message.error(`${file.name} is not an image file`);
        continue;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        message.error(`${file.name} is too large. Maximum size is ${maxSize}MB`);
        continue;
      }

      validFiles.push(file);
    }

    setPreviewImages(validFiles);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!productId) {
      message.error('Product ID is required');
      return;
    }

    if (previewImages.length === 0) {
      message.error('Please select images to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Extract actual file objects
      const fileObjects = previewImages.map(file => {
        // Handle different file object structures
        if (file.originFileObj) {
          return file.originFileObj;
        } else if (file instanceof File) {
          return file;
        } else {
          console.error('Invalid file object:', file);
          throw new Error('Invalid file object');
        }
      });

      console.log('📁 File objects to upload:', fileObjects);
      console.log('📁 File types:', fileObjects.map(f => f.type));
      console.log('📁 File sizes:', fileObjects.map(f => f.size));

      const response = await imageUploadService.uploadProductImages(
        productId, 
        fileObjects, 
        token
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        message.success(`${response.images.length} image(s) uploaded successfully`);
        setPreviewImages([]);
        
        if (onUploadSuccess) {
          onUploadSuccess(response.images);
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload images';
      if (error.message.includes('Authentication token not found')) {
        errorMessage = 'Please login to upload images';
      } else if (error.message.includes('Product ID is required')) {
        errorMessage = 'Product ID is missing';
      } else if (error.message.includes('No images provided')) {
        errorMessage = 'Please select images to upload';
      } else if (error.message.includes('Only image files are allowed')) {
        errorMessage = 'Please select only image files';
      } else if (error.message.includes('too large')) {
        errorMessage = 'File size too large. Maximum 5MB per file';
      } else if (error.message.includes('Too many files')) {
        errorMessage = 'Too many files. Maximum 10 files allowed';
      } else if (error.message.includes('Upload failed with status 404')) {
        errorMessage = 'Upload endpoint not found. Please check if the backend is running';
      } else if (error.message.includes('Upload failed with status 500')) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.message.includes('Upload failed with status 401')) {
        errorMessage = 'Authentication failed. Please login again';
      } else if (error.message.includes('Upload failed with status 403')) {
        errorMessage = 'You are not authorized to upload images for this product';
      } else {
        errorMessage = error.message || 'Failed to upload images';
      }
      
      message.error(errorMessage);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle remove preview image
  const handleRemovePreview = (file) => {
    setPreviewImages(prev => prev.filter(f => f.uid !== file.uid));
  };

  // Handle delete existing image
  const handleDeleteExisting = async (imageUrl) => {
    try {
      const token = localStorage.getItem('token');
      await imageUploadService.deleteProductImage(productId, imageUrl, token);
      message.success('Image deleted successfully');
      
      if (onUploadSuccess) {
        onUploadSuccess(); // Trigger refresh
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete image');
    }
  };

  const uploadProps = {
    name: 'images',
    multiple: true,
    accept: 'image/*',
    beforeUpload: () => false, // Prevent auto upload
    onChange: handleFileChange,
    showUploadList: false,
    disabled: disabled || uploading
  };

  return (
    <div className="image-upload">
      {/* Upload Area */}
      <Card title="Upload Product Images" className="mb-4">
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag images to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for multiple images. Maximum {maxFiles} files, {maxSize}MB each.
            <br />
            Supported formats: JPG, PNG, GIF, WebP
          </p>
        </Dragger>

        {/* Upload Button */}
        {previewImages.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleUpload}
              loading={uploading}
              disabled={disabled}
              size="large"
            >
              Upload {previewImages.length} Image(s)
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <Progress 
              percent={uploadProgress} 
              status={uploadProgress === 100 ? 'success' : 'active'}
            />
            <Text type="secondary" className="block text-center mt-2">
              Uploading images...
            </Text>
          </div>
        )}
      </Card>

      {/* Preview Images */}
      {showPreview && previewImages.length > 0 && (
        <Card title="Preview Images" className="mb-4">
          <Row gutter={[16, 16]}>
            {previewImages.map((file) => (
              <Col xs={12} sm={8} md={6} lg={4} key={file.uid}>
                <Card
                  size="small"
                  cover={
                    <Image
                      src={file.thumbUrl || URL.createObjectURL(file.originFileObj || file)}
                      alt={file.name}
                      className="w-full h-24 object-cover"
                    />
                  }
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemovePreview(file)}
                      size="small"
                    />
                  ]}
                >
                  <Text className="text-xs" ellipsis>
                    {file.name}
                  </Text>
                  <br />
                  <Text type="secondary" className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <Card title="Current Images">
          <Row gutter={[16, 16]}>
            {existingImages.map((imageUrl, index) => (
              <Col xs={12} sm={8} md={6} lg={4} key={index}>
                <Card
                  size="small"
                  cover={
                    <Image
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => window.open(imageUrl, '_blank')}
                      size="small"
                    />,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteExisting(imageUrl)}
                      size="small"
                    />
                  ]}
                >
                  <Text className="text-xs">
                    Image {index + 1}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;
