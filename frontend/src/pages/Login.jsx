import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        success('Login successful! Welcome back.');
        // Add a small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          Sign in to your account
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
          Or <Link to="/register">create a new account</Link>
        </Typography.Paragraph>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Email address" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign in
          </Button>
        </Form>

        <Divider>Or</Divider>
        <Button onClick={loginWithGoogle} block>
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default Login; 