import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import Login from './Login';
import StudentLogin from './StudentLogin';
import StudentRegister from './StudentRegister';
import AdminLogin from './AdminLogin';
import AdminRegister from './AdminRegister';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard'; // ✅ Import StudentDashboard

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegister />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-register" element={<AdminRegister />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      
      {/* ✅ Add the student dashboard route */}
      <Route path="/student-dashboard" element={<StudentDashboard />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
