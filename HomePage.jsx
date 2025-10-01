import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    { number: "5000+", label: "Students Enrolled", icon: "👥" },
    { number: "99.9%", label: "Accuracy Rate", icon: "✅" },
    { number: "< 2s", label: "Recognition Time", icon: "⏱️" },
    { number: "100%", label: "Security Level", icon: "🔒" }
  ];

  const features = [
    { icon: "🎯", title: "AI-Powered Recognition", description: "Advanced facial recognition technology with deep learning algorithms for instant and accurate identification.", color: "from-blue-500 to-blue-600" },
    { icon: "🔐", title: "Enterprise Security", description: "Bank-level encryption and privacy protection. Your biometric data stays secure with us.", color: "from-indigo-500 to-indigo-600" },
    { icon: "📈", title: "Smart Analytics", description: "Real-time attendance tracking, detailed reports, and insights for better academic management.", color: "from-purple-500 to-purple-600" },
    { icon: "👥", title: "Multi-User Support", description: "Seamlessly handles thousands of students and faculty members with role-based access control.", color: "from-pink-500 to-pink-600" },
    { icon: "⚡", title: "Real-Time Processing", description: "Lightning-fast attendance marking with instant notifications and updates.", color: "from-green-500 to-green-600" },
    { icon: "📊", title: "Automated Reports", description: "Generate comprehensive attendance reports with just one click. Export to Excel or PDF.", color: "from-orange-500 to-orange-600" }
  ];

  const testimonials = [
    { name: "Dr. Rajesh Kumar", role: "Department Head, CSE", content: "This system has revolutionized our attendance process. No more manual errors and the accuracy is outstanding!", avatar: "👨‍🏫", rating: 5 },
    { name: "Priya Sharma", role: "Final Year Student", content: "Super convenient! I just walk in and my attendance is marked automatically. It's incredibly fast and reliable.", avatar: "👩‍🎓", rating: 5 },
    { name: "Prof. Meera Singh", role: "Faculty, ECE", content: "The analytics dashboard gives me perfect insights into student attendance patterns. It's a game-changer for educators.", avatar: "👩‍🏫", rating: 5 }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Anurag Engineering College</h1>
                <p className="text-xs text-gray-600">Smart Attendance System</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Testimonials</a>
              <Link to="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium">Login</Link>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              {isMenuOpen ? <span className="text-xl">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Testimonials</a>
                <Link to="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg w-full font-medium">Login</Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 right-40 w-8 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className={`relative z-10 text-center px-6 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-sm mb-6 border border-white/20">
              <span className="text-yellow-400 mr-2">⭐</span>
              Next Generation Attendance System
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Smart Face
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Recognition
              </span>
              <span className="block">Attendance</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Revolutionary attendance system powered by AI. Secure, accurate, and lightning-fast recognition technology for the modern educational environment.
            </p>
            
            
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-2xl backdrop-blur-md transition-all duration-500 border border-white/20 ${
                  index === currentStat ? 'bg-white/20 scale-105' : 'bg-white/10'
                }`}
              >
                <div className="text-3xl mb-3 flex justify-center">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              🚀 Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Built for Modern Education
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how our advanced technology transforms attendance management with cutting-edge AI and seamless integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
                💡 Why Choose Us
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Streamline Your Institution with Smart Technology
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our AI-powered attendance system eliminates manual processes, reduces errors, and provides real-time insights for better decision-making.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Reduce Administrative Burden</h4>
                    <p className="text-gray-600">Automate attendance tracking and report generation, freeing up valuable time for teaching and learning.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Improve Accuracy</h4>
                    <p className="text-gray-600">Eliminate human errors and proxy attendance with our 99.9% accurate facial recognition technology.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Real-Time Insights</h4>
                    <p className="text-gray-600">Get instant access to attendance data and analytics for better academic planning and student support.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 shadow-2xl">
                <div className="bg-white rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 text-lg">Face Recognition Demo</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-semibold text-sm">Live</span>
                    </div>
                  </div>
                  
                  {/* Video Container */}
                  <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="\videos\face video (online-video-cutter.com).mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Overlay UI Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Face Recognition Box */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-40 border-2 border-green-400 rounded-lg animate-pulse">
                        <div className="absolute -top-8 left-0 bg-green-400 text-white px-2 py-1 rounded text-xs font-semibold">
                          Scanning...
                        </div>
                      </div>
                      
                      {/* Corner Markers */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-green-400"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-green-400"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-green-400"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-green-400"></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Recognition Status</h4>
                    <span className="text-green-400 font-bold">98.5%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Student ID:</span>
                      <span className="text-white">AEC2024001</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Name:</span>
                      <span className="text-white">Deepti Sharma</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Time:</span>
                      <span className="text-white">09:15 AM</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Status:</span>
                      <span className="text-green-400 font-semibold">✓ Present</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-4">
              💬 Testimonials
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by thousands of students and faculty members across the institution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">"{testimonial.content}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-lg">⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of educational institutions already using our smart attendance solution. Get started today with a free demo.
          </p>
          
          
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="font-bold text-lg">AEC Attendance</span>
              </div>
              <p className="text-gray-400 mb-4">
                Smart face recognition attendance system for modern education.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="text-gray-400 space-y-2">
                <p>📍 Anurag Engineering College</p>
                <p>📍  Ananthagiri, Kodad, Telangana</p>
                <p>📧 info@anuragengineering.edu</p>
                <p>📞 +91 40 1234 5678</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Anurag Engineering College. All rights reserved. Built with ❤️ for modern education.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
