import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiTrash2, FiEdit2, FiCamera, FiLogOut, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [loading, setLoading] = useState({
    students: false,
    submit: false,
    delete: false,
    reports: false,
    capturing: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_number: '',
    course: 'CS',
    password: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [courses] = useState(['CS', 'EE', 'ME', 'CE', 'ECE']);
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceEncoding, setFaceEncoding] = useState(null);
  const navigate = useNavigate();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter attendance reports
  const filteredReports = attendanceReports.filter(report => {
    const matchesSearch = report.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         report.student.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? report.date === dateFilter : true;
    const matchesCourse = courseFilter ? report.student.course === courseFilter : true;
    return matchesSearch && matchesDate && matchesCourse;
  });

  // Fetch data based on active tab
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin-login');
        return;
      }

      setLoading(prev => ({ ...prev, [activeTab === 'students' ? 'students' : 'reports']: true }));

      const endpoint = activeTab === 'students' 
        ? '/api/admin/students' 
        : '/api/admin/attendance-reports';
      
      const response = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (activeTab === 'students') {
        setStudents(response.data?.students || []);
      } else {
        setAttendanceReports(response.data?.reports || []);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(prev => ({ ...prev, [activeTab === 'students' ? 'students' : 'reports']: false }));
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const handleApiError = (err) => {
    console.error('API Error:', err);
    const errorMessage = err.response?.data?.message || 
                       err.response?.data?.error ||
                       err.message || 
                       'Operation failed';
    
    toast.error(errorMessage);
    
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      navigate('/admin-login');
    }
  };

  const handleStudentChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generatePassword = () => {
    const randomPassword = Math.random().toString(36).slice(-8);
    setFormData({
      ...formData,
      password: randomPassword
    });
  };

  const startCamera = async () => {
    try {
      setCapturing(true);
      setCameraReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please ensure you have granted camera permissions.');
      setCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCapturing(false);
    setCameraReady(false);
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setLoading(prev => ({ ...prev, capturing: true }));
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });
      
      // Create FormData and append the image blob
      const formDataObj = new FormData();
      formDataObj.append('image', blob, 'face_capture.jpg');
      
      // Send to backend for face encoding
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        'http://localhost:5000/api/admin/capture-face-encoding', 
        formDataObj,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setFaceEncoding(response.data.face_encoding);
        toast.success('Face captured successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to capture face encoding');
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(prev => ({ ...prev, capturing: false }));
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin-login');
        return;
      }

      if (editMode) {
        // Handle student update
        const response = await axios.put(
          `http://localhost:5000/api/admin/students/${currentStudentId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          toast.success('Student updated successfully!');
          await fetchData();
          resetForm();
        }
      } else {
        // Handle new student creation
        if (!faceEncoding) {
          toast.error('Please capture the student face first');
          return;
        }

        const studentData = {
          ...formData,
          face_encoding: faceEncoding
        };

        // If we have a captured image, use multipart form data
        if (canvasRef.current) {
          const formDataObj = new FormData();
          formDataObj.append('name', formData.name);
          formDataObj.append('email', formData.email);
          formDataObj.append('roll_number', formData.roll_number);
          formDataObj.append('course', formData.course);
          formDataObj.append('password', formData.password);
          
          // Append the captured face image
          const canvas = canvasRef.current;
          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.95);
          });
          formDataObj.append('photo', blob, 'face_capture.jpg');

          const response = await axios.post(
            'http://localhost:5000/api/admin/students',
            formDataObj,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          if (response.data.success) {
            toast.success('Student added successfully with face encoding!');
            await fetchData();
            resetForm();
            stopCamera();
          }
        } else {
          // Fallback to JSON if no image
          const response = await axios.post(
            'http://localhost:5000/api/admin/students',
            studentData,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            toast.success('Student added successfully!');
            await fetchData();
            resetForm();
          }
        }
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      roll_number: '',
      course: 'CS',
      password: '',
    });
    setEditMode(false);
    setCurrentStudentId(null);
    setFaceEncoding(null);
    setCapturing(false);
    stopCamera();
  };

  const handleEditStudent = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      roll_number: student.roll_number,
      course: student.course,
      password: '',
    });
    setEditMode(true);
    setCurrentStudentId(student.id);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setLoading(prev => ({ ...prev, delete: true }));
        const token = localStorage.getItem('adminToken');
        await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Student deleted successfully!');
        await fetchData();
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setCourseFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium transition-colors ${activeTab === 'students' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('students')}
          >
            Student Management
          </button>
          <button
            className={`py-2 px-4 font-medium transition-colors ${activeTab === 'reports' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('reports')}
          >
            Attendance Reports
          </button>
        </div>

        {loading.students || loading.reports ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'students' ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Student Management</h2>
                
                <form onSubmit={handleStudentSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    {editMode ? 'Edit Student' : 'Add New Student'}
                  </h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      {!editMode && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Face Capture {faceEncoding && <span className="text-green-500">✓</span>}
                          </label>
                          
                          {!capturing ? (
                            <button
                              type="button"
                              onClick={startCamera}
                              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                            >
                              Start Camera
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <div className="relative bg-gray-200 rounded-md overflow-hidden border border-gray-300">
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline
                                  className="w-full h-auto"
                                />
                                <canvas 
                                  ref={canvasRef} 
                                  className="hidden"
                                />
                              </div>
                              
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={captureFace}
                                  disabled={!cameraReady || loading.capturing}
                                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  {loading.capturing ? (
                                    <span className="flex items-center justify-center">
                                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                      Processing...
                                    </span>
                                  ) : (
                                    'Capture Face'
                                  )}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                >
                                  Stop Camera
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-2/3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name*</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleStudentChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email*</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleStudentChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Roll Number*</label>
                          <input
                            type="text"
                            name="roll_number"
                            value={formData.roll_number}
                            onChange={handleStudentChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Course*</label>
                          <select
                            name="course"
                            value={formData.course}
                            onChange={handleStudentChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          >
                            {courses.map(course => (
                              <option key={course} value={course}>{course}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {editMode ? 'New Password (leave blank to keep current)' : 'Password*'}
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={handleStudentChange}
                            placeholder={editMode ? "Leave blank to keep current password" : "Enter password"}
                            required={!editMode}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={generatePassword}
                            className="mt-1 bg-gray-200 px-3 py-2 rounded-r-md hover:bg-gray-300 transition-colors"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          type="submit"
                          disabled={loading.submit}
                          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading.submit ? (
                            <span className="flex items-center justify-center">
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                              Processing...
                            </span>
                          ) : editMode ? (
                            'Update Student'
                          ) : (
                            'Add Student'
                          )}
                        </button>
                        
                        {(editMode || capturing) && (
                          <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Student Records</h3>
                    <span className="text-sm text-gray-500">
                      {students.length} {students.length === 1 ? 'student' : 'students'}
                    </span>
                  </div>
                  
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiUser className="text-gray-400 text-2xl" />
                      </div>
                      <p className="text-gray-500">No students found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                    {student.photo_url ? (
                                      <img 
                                        src={`http://localhost:5000/uploads/${student.photo_url}`} 
                                        alt={student.name}
                                        className="h-full w-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <FiUser />
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.roll_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.course}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  student.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {student.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditStudent(student)}
                                    disabled={loading.delete}
                                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                    title="Edit"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(student.id)}
                                    disabled={loading.delete}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    title="Delete"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold">Attendance Reports</h2>
                  
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by name or roll number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <FiFilter />
                      Filters
                    </button>
                    
                    {(searchTerm || dateFilter || courseFilter) && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <FiX />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {showFilters && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <select
                          value={courseFilter}
                          onChange={(e) => setCourseFilter(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">All Courses</option>
                          {courses.map(course => (
                            <option key={course} value={course}>{course}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">
                    Showing {filteredReports.length} of {attendanceReports.length} records
                    {(searchTerm || dateFilter || courseFilter) && ' (filtered)'}
                  </span>
                </div>
                
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FiUser className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-500">
                      {attendanceReports.length === 0 ? 
                        'No attendance records found' : 
                        'No records match your search criteria'}
                    </p>
                    {(searchTerm || dateFilter || courseFilter) && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReports.map(report => (
                          <tr key={report.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                  {report.student.photo_url ? (
                                    <img 
                                      src={`http://localhost:5000/uploads/${report.student.photo_url}`} 
                                      alt={report.student.name}
                                      className="h-full w-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <FiUser />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{report.student.name}</div>
                                  <div className="text-sm text-gray-500">{report.student.roll_number}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(report.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(report.time)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                report.confidence >= 80 ? 'bg-green-100 text-green-800' :
                                report.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {report.confidence?.toFixed(2) || 'N/A'}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {report.student.course}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;