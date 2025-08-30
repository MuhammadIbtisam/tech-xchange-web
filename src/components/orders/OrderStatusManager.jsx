import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  DatePicker, 
  Button, 
  Space, 
  message, 
  Typography,
  Tag,
  Divider
} from 'antd';
import { 
  EditOutlined, 
  CheckOutlined, 
  TruckFilled, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'orange', icon: <ClockCircleOutlined /> },
  processing: { label: 'Processing', color: 'blue', icon: <ShoppingOutlined /> },
  shipped: { label: 'Shipped', color: 'cyan', icon: <TruckFilled /> },
  delivered: { label: 'Delivered', color: 'green', icon: <CheckOutlined /> },
  cancelled: { label: 'Cancelled', color: 'red', icon: <CloseCircleOutlined /> }
};

const OrderStatusManager = ({ 
  order, 
  visible, 
  onCancel, 
  onSubmit, 
  loading = false 
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && order) {
      form.setFieldsValue({
        status: order.status,
        trackingNumber: order.trackingNumber || '',
        estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : null,
        notes: order.notes || ''
      });
    }
  }, [visible, order, form]);

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  const getStatusOptions = (currentStatus) => {
    const options = [];
    
    // Always allow current status
    options.push({
      value: currentStatus,
      label: ORDER_STATUS[currentStatus]?.label,
      icon: ORDER_STATUS[currentStatus]?.icon
    });

    // Add next logical statuses
    switch (currentStatus) {
      case 'pending':
        options.push(
          { value: 'processing', label: 'Processing', icon: <ShoppingOutlined /> },
          { value: 'cancelled', label: 'Cancelled', icon: <CloseCircleOutlined /> }
        );
        break;
      case 'processing':
        options.push(
          { value: 'shipped', label: 'Shipped', icon: <TruckFilled /> },
          { value: 'cancelled', label: 'Cancelled', icon: <CloseCircleOutlined /> }
        );
        break;
      case 'shipped':
        options.push(
          { value: 'delivered', label: 'Delivered', icon: <CheckOutlined /> }
        );
        break;
      case 'delivered':
        // No further status changes allowed
        break;
      case 'cancelled':
        // No further status changes allowed
        break;
      default:
        // Allow all statuses for unknown current status
        Object.entries(ORDER_STATUS).forEach(([key, value]) => {
          if (key !== currentStatus) {
            options.push({ value: key, label: value.label, icon: value.icon });
          }
        });
    }

    return options;
  };

  if (!order) return null;

  const statusOptions = getStatusOptions(order.status);

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <span>Update Order Status</span>
          <Tag color={ORDER_STATUS[order.status]?.color}>
            Current: {ORDER_STATUS[order.status]?.label}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="mb-4">
        <Text type="secondary">
          Order #{order._id.substring(0, 8)} - {order.productName}
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: order.status,
          trackingNumber: order.trackingNumber || '',
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : null,
          notes: order.notes || ''
        }}
      >
        <Form.Item
          name="status"
          label="New Order Status"
          rules={[{ required: true, message: 'Please select order status' }]}
        >
          <Select 
            placeholder="Select new status"
            showSearch
            optionFilterProp="label"
          >
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <Space>
                  {option.icon}
                  {option.label}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="trackingNumber"
          label="Tracking Number"
          help="Optional: Add tracking number for shipping updates"
        >
          <Input 
            placeholder="Enter tracking number (e.g., DHL123456789)" 
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="estimatedDelivery"
          label="Estimated Delivery Date"
          help="Optional: Set expected delivery date"
        >
          <DatePicker 
            style={{ width: '100%' }} 
            placeholder="Select delivery date"
            disabledDate={(current) => current && current < new Date()}
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Status Update Notes"
          help="Optional: Add notes about this status change"
        >
          <TextArea 
            rows={3} 
            placeholder="Add any notes about this order update..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Divider />

        <div className="mb-4">
          <Text strong>Status Flow:</Text>
          <div className="mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ClockCircleOutlined className="text-orange-500" />
              <span>Pending</span>
              <span>→</span>
              <ShoppingOutlined className="text-blue-500" />
              <span>Processing</span>
              <span>→</span>
              <TruckFilled className="text-cyan-500" />
              <span>Shipped</span>
              <span>→</span>
              <CheckOutlined className="text-green-500" />
              <span>Delivered</span>
            </div>
          </div>
        </div>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              icon={<EditOutlined />}
            >
              Update Status
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderStatusManager;
