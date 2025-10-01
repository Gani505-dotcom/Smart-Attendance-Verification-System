import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <div className="space-y-4">
          <Link
            to="/student-login"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Login as Student
          </Link>
          <Link
            to="/admin-login"
            className="block w-full bg-purple-600 text-white py-3 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
