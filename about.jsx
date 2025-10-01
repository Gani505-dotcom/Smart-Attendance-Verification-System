import { useState, useEffect } from 'react';

function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const timeline = [
    {
      year: "2020",
      title: "Project Inception",
      description: "Started development of AI-powered attendance system",
      icon: "🚀"
    },
    {
      year: "2021", 
      title: "Beta Testing",
      description: "Successful pilot program with 500+ students",
      icon: "🧪"
    },
    {
      year: "2022",
      title: "Full Deployment",
      description: "College-wide implementation across all departments",
      icon: "🎯"
    },
    {
      year: "2023",
      title: "AI Enhancement",
      description: "Advanced machine learning algorithms integrated",
      icon: "🤖"
    },
    {
      year: "2024",
      title: "Analytics Dashboard",
      description: "Real-time reporting and insights platform launched",
      icon: "📊"
    }
  ];

  const team = [
    {
      name: "Dr. Anand Prakash",
      role: "Project Director",
      description: "Leading the vision and strategic development of the smart attendance system",
      avatar: "👨‍💼",
      expertise: ["AI Systems", "Educational Technology", "Project Management"]
    },
    {
      name: "Prof. Sneha Reddy",
      role: "Technical Lead",
      description: "Overseeing the technical architecture and machine learning implementations",
      avatar: "👩‍💻",
      expertise: ["Machine Learning", "Computer Vision", "System Architecture"]
    },
    {
      name: "Rohit Kumar",
      role: "Lead Developer",
      description: "Frontend and backend development, ensuring seamless user experience",
      avatar: "👨‍💻",
      expertise: ["Full Stack Development", "React", "Node.js"]
    },
    {
      name: "Priya Sharma",
      role: "AI Research Specialist",
      description: "Developing and optimizing facial recognition algorithms",
      avatar: "👩‍🔬",
      expertise: ["Deep Learning", "Computer Vision", "Python"]
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "Pushing the boundaries of educational technology",
      icon: "💡",
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "Security",
      description: "Protecting student data with enterprise-grade security",
      icon: "🔒",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Reliability",
      description: "99.9% uptime ensuring consistent performance",
      icon: "⚡",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "User-Centric",
      description: "Designing with students and faculty in mind",
      icon: "👥",
      color: "from-purple-500 to-pink-600"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📷</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Anurag Engineering College</h1>
                <p className="text-xs text-gray-600">Smart Attendance System</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="#" className="text-blue-600 font-semibold">About</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isMenuOpen ? <span className="text-xl">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
                <a href="#" className="text-blue-600 font-semibold">About</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg w-full">
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="container mx-auto px-6">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              About Our
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Smart System
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing attendance management through cutting-edge AI technology, 
              designed specifically for the modern educational environment at Anurag Engineering College.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To transform traditional attendance systems through innovative AI technology, 
                creating a seamless, secure, and efficient experience for students and faculty 
                while maintaining the highest standards of privacy and accuracy.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Vision 2030</h3>
                <p className="text-gray-600">
                  To become the leading smart attendance solution across educational institutions 
                  in India, setting new standards for educational technology and student experience.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm opacity-90">Accuracy Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <div className="text-2xl font-bold">&lt;2s</div>
                    <div className="text-sm opacity-90">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">👥</div>
                    <div className="text-2xl font-bold">5000+</div>
                    <div className="text-sm opacity-90">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">Security</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide our development and operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              From concept to reality - the evolution of our smart attendance system
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center mb-12 last:mb-0">
                <div className="flex-shrink-0 w-24 text-right mr-8">
                  <span className="text-2xl font-bold text-blue-600">{item.year}</span>
                </div>
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="ml-8 flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              The brilliant minds behind our innovative attendance system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.description}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {member.expertise.map((skill, skillIndex) => (
                    <span key={skillIndex} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Technology Stack</h2>
            <p className="text-xl text-gray-600">
              Built with cutting-edge technologies for optimal performance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Python", icon: "🐍" },
              { name: "TensorFlow", icon: "🧠" },
              { name: "OpenCV", icon: "👁️" },
              { name: "React", icon: "⚛️" },
              { name: "Node.js", icon: "🚀" },
              { name: "MongoDB", icon: "🍃" }
            ].map((tech, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {tech.icon}
                </div>
                <p className="text-sm font-semibold text-gray-800">{tech.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the revolution in attendance management. Contact us to learn more about implementing our system.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">📷</span>
                </div>
                <span className="font-bold text-lg">AEC Attendance</span>
              </div>
              <p className="text-gray-400">
                Smart face recognition attendance system for modern education.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
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
                <p>Anurag Engineering College</p>
                <p>Hyderabad, Telangana</p>
                <p>info@anuragengineering.edu</p>
                <p>+91 40 1234 5678</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Anurag Engineering College. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;