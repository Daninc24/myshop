import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, Input, Button, Typography, Alert } from 'antd';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordPolicy.test(formData.password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.');
      setLoading(false);
      return;
    }
    const result = await register(formData.name, formData.email, formData.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          Create your account
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
          Or <Link to="/login">sign in to your existing account</Link>
        </Typography.Paragraph>

        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" />
          </Form.Item>
          <Form.Item label="Email address" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" />
          </Form.Item>
          <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true }]}>
            <Input.Password name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create account
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Register; 