
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function StudentRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_number: '',
    course: '',
    password: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { name, email, roll_number, course, password, confirmPassword } = formData;

    if (!name || !email || !roll_number || !course || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await axios.post('http://localhost:5000/api/students/register', registrationData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 201) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/student-login'), 2000);
        setFormData({
          name: '',
          email: '',
          roll_number: '',
          course: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="p-8 bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Student Registration</h1>

        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Roll Number</label>
            <input
              type="text"
              name="roll_number"
              value={formData.roll_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your roll number"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Course</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Business Administration">Business Administration</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create password (min 8 characters)"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg shadow-md transition-colors ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium`}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/student-login" className="text-blue-600 hover:text-blue-800 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentRegister;
