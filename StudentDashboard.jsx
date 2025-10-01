
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { 
  FiUser, 
  FiLogOut, 
  FiCheckCircle,
  FiCamera,
  FiX,
  FiClock,
  FiCalendar,
  FiInfo,
  FiRefreshCw
} from 'react-icons/fi';

const API_BASE = 'http://localhost:5000';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isMarking, setIsMarking] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [cameraReady, setCameraReady] = useState(false);
  
  const webcamRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/student-login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      
      const profileRes = await axios.get(`${API_BASE}/api/students/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setStudent(profileRes.data.student);
      setLoading(false);
      
      await checkTodayAttendance();
      await fetchAttendanceHistory();
      
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('studentToken');
        navigate('/student-login');
      } else {
        setMessage({ text: 'Failed to load data', type: 'error' });
      }
      setLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await axios.get(`${API_BASE}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayAttendance(response.data.attendance || null);
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await axios.get(`${API_BASE}/api/attendance/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceHistory(response.data.attendance_history || []);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  const handleCameraReady = () => {
    setCameraReady(true);
    setMessage({ text: 'Camera ready! You can now capture your photo.', type: 'success' });
  };

  const clearMessages = () => {
    setMessage({ text: '', type: '' });
    setSuggestions([]);
  };

  const capture = useCallback(async () => {
    if (!cameraReady || !webcamRef.current) {
      setMessage({ text: 'Camera is not ready. Please wait.', type: 'error' });
      return;
    }

    setIsMarking(true);
    clearMessages();
    
    try {
      console.log('Capturing image...');
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Failed to capture image from camera');
      }
      
      console.log('Image captured, converting to blob...');
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      console.log('Creating form data...');
      const formData = new FormData();
      formData.append('image', blob, 'webcam.jpg');

      const token = localStorage.getItem('studentToken');
      
      console.log('Sending request to server...');
      const res = await axios.post(
        `${API_BASE}/api/attendance/mark`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );

      console.log('Server response:', res.data);

      if (res.data.success) {
        setMessage({ 
          text: res.data.message,
          type: 'success'
        });
        
        setTodayAttendance(res.data.attendance);
        await fetchAttendanceHistory();
        setShowCamera(false);
        setCameraReady(false);
      } else {
        setMessage({ 
          text: res.data.message,
          type: 'error'
        });
        
        if (res.data.suggestions) {
          setSuggestions(res.data.suggestions);
        }
      }
    } catch (err) {
      console.error('Attendance marking error:', err);
      
      let errorMsg = 'Failed to mark attendance. Please try again.';
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timed out. Please check your connection.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
        if (err.response.data.suggestions) {
          setSuggestions(err.response.data.suggestions);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setMessage({ 
        text: errorMsg,
        type: 'error'
      });
    } finally {
      setIsMarking(false);
    }
  }, [cameraReady]);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigate('/student-login');
  };

  const handleCameraClose = () => {
    setShowCamera(false);
    setCameraReady(false);
    clearMessages();
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
            {suggestions.length > 0 && (
              <div className="mt-2">
                <p className="font-medium mb-1">Suggestions:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome, <span className="text-blue-600">{student?.name}</span>
          </h2>
          <p className="text-gray-600">Manage your attendance and academic information here</p>
        </div>

        {/* Student Information and Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Personal Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FiUser className="mr-2 text-blue-500" />
              Personal Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-gray-800">{student?.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</p>
                <p className="text-gray-800">{student?.roll_number}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Course</p>
                <p className="text-gray-800">{student?.course}</p>
              </div>
              {student?.photo_url && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</p>
                  <img 
                    src={`${API_BASE}/uploads/${student.photo_url}`} 
                    alt="Student" 
                    className="mt-2 w-24 h-24 rounded-full object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Attendance Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Attendance</h3>
            
            {todayAttendance ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center text-green-800">
                  <FiCheckCircle className="mr-2 text-green-600" />
                  <span className="font-medium">Attendance marked for today</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2 text-gray-500" />
                    <span>{new Date(todayAttendance.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-2 text-gray-500" />
                    <span>{todayAttendance.time}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(todayAttendance.confidence)}`}>
                      Confidence: {todayAttendance.confidence?.toFixed(1) || 'N/A'}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setShowCamera(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FiCamera />
                  <span>Mark My Attendance</span>
                </button>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <FiInfo className="mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Instructions:</p>
                      <ul className="text-xs space-y-1 list-disc list-inside ml-2">
                        <li>Ensure good lighting on your face</li>
                        <li>Look directly at the camera</li>
                        <li>Keep a neutral expression</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Mark Attendance</h3>
                <button
                  onClick={handleCameraClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg"
                    onUserMedia={handleCameraReady}
                  />
                  {!cameraReady && (
                    <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading camera...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={capture}
                    disabled={!cameraReady || isMarking}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {isMarking ? (
                      <>
                        <FiRefreshCw className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCamera className="mr-2" />
                        Capture & Submit
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCameraClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance History */}
        {attendanceHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Attendance</h3>
            <div className="space-y-3">
              {attendanceHistory.slice(0, 10).map((record, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <FiCalendar className="text-gray-400" />
                    <span className="text-sm font-medium">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiClock className="text-gray-400" />
                    <span className="text-sm text-gray-600">{record.time}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(record.confidence)}`}>
                      {record.confidence?.toFixed(1) || 'N/A'}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}