import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';  // Added Link import
import axios from 'axios';

function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', formData);
      
      if (response.data.success) {
        // Store the token and admin data
        localStorage.setItem('adminToken', response.data.access_token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        // Redirect to admin dashboard
        navigate('/admin-dashboard');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/admin-register" className="text-purple-600 hover:underline">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;