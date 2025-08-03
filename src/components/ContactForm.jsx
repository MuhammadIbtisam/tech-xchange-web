import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Card, Input, Button, Select, Checkbox, Typography, Space, message, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';
import * as Yup from 'yup';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const ContactForm = () => {
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false,
    terms: false,
  };

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number')
      .min(10, 'Phone number must be at least 10 digits'),
    subject: Yup.string()
      .min(5, 'Subject must be at least 5 characters')
      .required('Subject is required'),
    message: Yup.string()
      .min(10, 'Message must be at least 10 characters')
      .required('Message is required'),
    terms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions'),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', values);
      message.success('Thank you! Your message has been sent successfully.');
      resetForm();
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <div className="text-center mb-8">
          <Title level={2} className="mb-2">
            Contact Us
          </Title>
          <Text className="text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting, handleChange, setFieldValue }) => (
            <Form className="space-y-6">
              {/* Personal Information */}
              <div>
                <Title level={4} className="mb-4">Personal Information</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div className="mb-4">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        prefix={<UserOutlined />}
                        placeholder="Enter your first name"
                        value={values.firstName}
                        onChange={handleChange}
                        className={errors.firstName && touched.firstName ? 'border-red-500' : ''}
                        aria-describedby={errors.firstName && touched.firstName ? 'firstName-error' : undefined}
                      />
                      {errors.firstName && touched.firstName && (
                        <div id="firstName-error" className="text-red-500 text-sm mt-1" role="alert">
                          {errors.firstName}
                        </div>
                      )}
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <div className="mb-4">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        prefix={<UserOutlined />}
                        placeholder="Enter your last name"
                        value={values.lastName}
                        onChange={handleChange}
                        className={errors.lastName && touched.lastName ? 'border-red-500' : ''}
                        aria-describedby={errors.lastName && touched.lastName ? 'lastName-error' : undefined}
                      />
                      {errors.lastName && touched.lastName && (
                        <div id="lastName-error" className="text-red-500 text-sm mt-1" role="alert">
                          {errors.lastName}
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        prefix={<MailOutlined />}
                        placeholder="Enter your email address"
                        value={values.email}
                        onChange={handleChange}
                        className={errors.email && touched.email ? 'border-red-500' : ''}
                        aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                      />
                      {errors.email && touched.email && (
                        <div id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        prefix={<PhoneOutlined />}
                        placeholder="Enter your phone number"
                        value={values.phone}
                        onChange={handleChange}
                        className={errors.phone && touched.phone ? 'border-red-500' : ''}
                        aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && touched.phone && (
                        <div id="phone-error" className="text-red-500 text-sm mt-1" role="alert">
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Message Section */}
              <div>
                <Title level={4} className="mb-4">Message</Title>
                
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <Select
                    id="subject"
                    name="subject"
                    placeholder="Select a subject"
                    value={values.subject}
                    onChange={(value) => setFieldValue('subject', value)}
                    className="w-full"
                    aria-describedby={errors.subject && touched.subject ? 'subject-error' : undefined}
                  >
                    <Option value="general">General Inquiry</Option>
                    <Option value="support">Technical Support</Option>
                    <Option value="billing">Billing Question</Option>
                    <Option value="partnership">Partnership</Option>
                    <Option value="other">Other</Option>
                  </Select>
                  {errors.subject && touched.subject && (
                    <div id="subject-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.subject}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <TextArea
                    id="message"
                    name="message"
                    rows={6}
                    prefix={<MessageOutlined />}
                    placeholder="Enter your message here..."
                    value={values.message}
                    onChange={handleChange}
                    className={errors.message && touched.message ? 'border-red-500' : ''}
                    aria-describedby={errors.message && touched.message ? 'message-error' : undefined}
                  />
                  {errors.message && touched.message && (
                    <div id="message-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <Title level={4} className="mb-4">Preferences</Title>
                
                <Space direction="vertical" className="w-full">
                  <Checkbox
                    id="newsletter"
                    name="newsletter"
                    checked={values.newsletter}
                    onChange={(e) => setFieldValue('newsletter', e.target.checked)}
                  >
                    Subscribe to our newsletter for updates and news
                  </Checkbox>
                  
                  <Checkbox
                    id="terms"
                    name="terms"
                    checked={values.terms}
                    onChange={(e) => setFieldValue('terms', e.target.checked)}
                    className={errors.terms && touched.terms ? 'border-red-500' : ''}
                  >
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800">
                      Privacy Policy
                    </a>{' '}
                    *
                  </Checkbox>
                  {errors.terms && touched.terms && (
                    <div className="text-red-500 text-sm" role="alert">
                      {errors.terms}
                    </div>
                  )}
                </Space>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isSubmitting}
                  className="px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default ContactForm; 