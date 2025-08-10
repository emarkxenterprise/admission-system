import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // News carousel state
  const [currentNewsSlide, setCurrentNewsSlide] = useState(0);
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Sample images for the slider (you can replace these with your actual images)
  const sliderImages = [
    '/nana-faded-bg.png',
    '/lab-header.jpg',
    '/12.png',
    '/nursing-students.jpg',
    '/ribbon-cutting.jpg',
    '/medical-training.jpg'
  ];

  // News data for carousel
  const newsData = [
    {
      id: 1,
      category: 'Breaking',
      categoryColor: 'red',
      time: '2 hours ago',
      title: 'New Academic Programs Announced for 2024/2025 Session',
      description: 'The university has introduced cutting-edge programs in Artificial Intelligence, Data Science, and Renewable Energy Engineering...'
    },
    {
      id: 2,
      category: 'Event',
      categoryColor: 'green',
      time: '1 day ago',
      title: 'Annual Research Symposium Set for Next Month',
      description: 'Join us for the 15th Annual Research Symposium featuring keynote speakers from leading institutions worldwide...'
    },
    {
      id: 3,
      category: 'Achievement',
      categoryColor: 'blue',
      time: '3 days ago',
      title: 'University Ranks Top 10 in National Rankings',
      description: 'Our institution has been recognized among the top 10 universities in the country for academic excellence...'
    },
    {
      id: 4,
      category: 'Update',
      categoryColor: 'purple',
      time: '4 days ago',
      title: 'New Research Center Opens on Campus',
      description: 'A state-of-the-art research center dedicated to renewable energy and sustainable technologies has been inaugurated...'
    },
    {
      id: 5,
      category: 'Announcement',
      categoryColor: 'orange',
      time: '5 days ago',
      title: 'International Student Exchange Program Launched',
      description: 'We are excited to announce partnerships with universities in Europe and Asia for student exchange programs...'
    },
    {
      id: 6,
      category: 'News',
      categoryColor: 'indigo',
      time: '6 days ago',
      title: 'Faculty Members Receive National Awards',
      description: 'Several of our distinguished faculty members have been recognized with prestigious national awards...'
    }
  ];
  
  // Auto-slide effect for hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  // Auto-slide effect for news carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsSlide((prev) => (prev + 1) % Math.ceil(newsData.length / 3));
    }, 4000); // Change news slide every 4 seconds
    
    return () => clearInterval(timer);
  }, [newsData.length]);
  
  // Manual slide navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  // News carousel navigation
  const goToNewsSlide = (index) => {
    setCurrentNewsSlide(index);
  };

  const nextNewsSlide = () => {
    setCurrentNewsSlide((prev) => (prev + 1) % Math.ceil(newsData.length / 3));
  };

  const prevNewsSlide = () => {
    setCurrentNewsSlide((prev) => (prev - 1 + Math.ceil(newsData.length / 3)) % Math.ceil(newsData.length / 3));
  };

  // Get current news items for display
  const getCurrentNewsItems = () => {
    const startIndex = currentNewsSlide * 3;
    return newsData.slice(startIndex, startIndex + 3);
  };
  
  return (
     <div className="min-h-screen bg-white">
       <style jsx>{`
         .marquee-container {
           overflow: hidden;
         }
         
         .marquee-content {
           animation: marquee 120s linear infinite;
           animation-play-state: running;
         }
         
         .marquee-container:hover .marquee-content {
           animation-play-state: paused;
         }
         
         @keyframes marquee {
           0% {
             transform: translateX(100%);
           }
           100% {
             transform: translateX(-100%);
           }
         }

         /* News Carousel Animations */
         .news-card {
           transition: all 0.5s ease-in-out;
         }
         
         .news-card:hover {
           transform: translateY(-5px);
           box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
         }
         
         .carousel-arrow {
           transition: all 0.3s ease;
         }
         
         .carousel-arrow:hover {
           transform: scale(1.1);
           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
         }
         
         .carousel-indicator {
           transition: all 0.3s ease;
         }
         
         .carousel-indicator:hover {
           transform: scale(1.2);
         }
       `}</style>
      {/* Top Bar */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
                                      {/* Desktop Links */}
             <div className="hidden md:flex items-center space-x-3 text-xs">
               <a href="#" className="hover:text-blue-300 transition-colors">Donations</a>
               <span className="text-gray-400">|</span>
               <a href="#" className="hover:text-blue-300 transition-colors">Enterprises</a>
               <span className="text-gray-400">|</span>
               <a href="#" className="hover:text-blue-300 transition-colors">Photo Gallery</a>
               <span className="text-gray-400">|</span>
               <a href="#" className="hover:text-blue-300 transition-colors">Featured Videos</a>
               <span className="text-gray-400">|</span>
               <a href="#" className="hover:text-blue-300 transition-colors">Downloads</a>
             </div>
             <div className="hidden md:flex items-center space-x-3 text-xs">
               <a href="#" className="hover:text-blue-300 transition-colors">Staff Email</a>
               <span className="text-gray-400">|</span>
               <a href="#" className="hover:text-blue-300 transition-colors">Staff Profile</a>
               <span className="text-gray-400">|</span>
               <a href="#" className="hover:text-blue-300 transition-colors">Contact us</a>
             </div>
             
             {/* Mobile Links - Simplified */}
             <div className="md:hidden flex items-center space-x-2 text-xs">
               <a href="#" className="hover:text-blue-300 transition-colors">Gallery</a>
               <span className="text-gray-400">|</span>
               <a href="#" className="hover:text-blue-300 transition-colors">Videos</a>
               <span className="text-gray-400">|</span>
               <a href="#" className="hover:text-blue-300 transition-colors">Contact</a>
             </div>
          </div>
        </div>
      </div>

             {/* Navigation */}
       <nav className="bg-white shadow-lg border-b shadow-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
                         <div className="flex items-center">
               <img 
                 src="/nana-logo.png" 
                 alt="University Logo" 
                 className="h-12 w-auto"
               />
             </div>
             
                           {/* Primary Navigation Links */}
              <div className="hidden lg:flex items-center space-x-2">
                <a href="#" className="text-gray-700 hover:text-gray-900 px-1 py-2 text-xs font-medium transition-colors flex items-center">
                  Home
                </a>
                
                {/* About Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('about')}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="text-gray-700 hover:text-gray-900 px-1 py-2 text-xs font-medium transition-colors flex items-center"
                  >
                    About
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'about' && (
                    <div
                      onMouseEnter={() => setActiveDropdown('about')}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-1 w-64 bg-white shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-2">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Administration</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mission & Vision</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Our Campus</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Our Core Values</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">The College Anthem</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Awards</a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Academics Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('academics')}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="text-gray-700 hover:text-gray-900 px-1 py-2 text-xs font-medium transition-colors flex items-center"
                  >
                    Academics
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'academics' && (
                    <div
                      onMouseEnter={() => setActiveDropdown('academics')}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-2">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Faculties & Colleges</a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Admissions Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('admissions')}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="text-gray-700 hover:text-gray-900 px-1 py-2 text-xs font-medium transition-colors flex items-center"
                  >
                    Admissions
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'admissions' && (
                    <div
                      onMouseEnter={() => setActiveDropdown('admissions')}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-2">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admission Requirements</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Basic Program</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Diploma Program</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Post-Basic Program</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Undergraduate Programs</a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Students Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('students')}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="text-gray-700 hover:text-gray-900 px-1 py-2 text-xs font-medium transition-colors flex items-center"
                  >
                    Students
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'students' && (
                    <div
                      onMouseEnter={() => setActiveDropdown('students')}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-2">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Undergraduate</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">ND</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">HND</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Post Basic</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Basic</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">College of Health</a>
                      </div>
                    </div>
                  )}
                </div>
                
                <a href="#" className="text-gray-700 hover:text-gray-900 px-1 py-2 text-xs font-medium transition-colors flex items-center">
                  Research
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                
                {/* Campuses Dropdown */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setActiveDropdown('campuses')}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="text-gray-700 hover:text-gray-900 px-1 py-2 text-xs font-medium transition-colors flex items-center"
                  >
                    Campuses
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'campuses' && (
                    <div
                      onMouseEnter={() => setActiveDropdown('campuses')}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-2">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Anyigba Campus</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Okpo Campus</a>
                      </div>
                    </div>
                  )}
                </div>
                <a href="#" className="text-gray-700 hover:text-gray-900 px-1 py-2 text-xs font-medium transition-colors flex items-center">
                  Support Services
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
                         <div className="flex items-center space-x-3">
               {user ? (
                 <Link
                   to="/dashboard"
                   className="bg-blue-600 text-white px-3 py-2 text-xs font-medium hover:bg-blue-700 transition-colors"
                 >
                   Dashboard
                 </Link>
               ) : (
                 <>
                   <Link
                     to="/login"
                     className="text-gray-700 hover:text-gray-900 px-2 py-2 text-xs font-medium transition-colors"
                   >
                     Login
                   </Link>
                   <Link
                     to="/register"
                     className="bg-blue-600 text-white px-3 py-2 text-xs font-medium hover:bg-blue-700 transition-colors"
                   >
                     Apply Now
                   </Link>
                 </>
               )}
             </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white h-[400px]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row h-full">
            {/* First Column - Slider (80% + 20px) */}
            <div className="lg:w-4/5 lg:pr-5 mb-8 lg:mb-0" style={{ width: 'calc(80% + 20px)', height: '400px' }}>
                             <div className="relative h-full overflow-hidden">
                {/* Slider Container */}
                <div className="relative h-full">
                  {sliderImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    </div>
                  ))}
                  
                                     {/* Slider Content */}
                   <div className="absolute inset-0 flex flex-col justify-center items-center">
                     <div className="text-center text-white z-10 w-full">
                       <h1 className="text-2xl md:text-4xl mb-6 uppercase flex items-center justify-center">
                         {/* <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                         </svg> */}
                         Welcome to Our University
                       </h1>
                       <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                         Embark on your academic journey with excellence. Apply for admission and join our community of learners.
                       </p>
                       <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                          <Link
                            to="/apply"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                          >
                            Start Application
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/register"
                              className="bg-white text-blue-600 px-8 py-3 text-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                              Apply Now
                            </Link>
                            <Link
                              to="/login"
                              className="border-2 border-white text-white px-8 py-3 text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                            >
                              Login
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Slider Navigation */}
                                     <button
                     onClick={prevSlide}
                     className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 hover:bg-opacity-75 transition-all z-20"
                   >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                                     <button
                     onClick={nextSlide}
                     className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 hover:bg-opacity-75 transition-all z-20"
                   >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Slider Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {sliderImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                                                 className={`w-3 h-3 transition-all ${
                          index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
                         {/* Second Column - Two Rows (20% + 20px) */}
             <div className="lg:w-1/5" style={{ width: 'calc(20% + 20px)' }}>
               <div className="flex flex-col h-full space-y-2.5">
                                  {/* First Row */}
                                     <div className="flex-1 bg-green-600 p-4 flex flex-col justify-center items-center text-white min-h-0">
                   <div className="text-center">
                     <svg className="w-8 h-8 mx-auto mb-2 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                     </svg>
                     <h3 className="text-sm mb-1 uppercase flex items-center justify-center">
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                       </svg>
                       Academic Excellence
                     </h3>
                     <p className="text-sm text-green-100">World-class education programs</p>
                   </div>
                 </div>
                 
                                   {/* Second Row */}
                                     <div className="flex-1 bg-blue-600 p-4 flex flex-col justify-center items-center text-white min-h-0">
                   <div className="text-center">
                     <svg className="w-8 h-8 mx-auto mb-2 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                     <h3 className="text-sm mb-1 uppercase flex items-center justify-center">
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                       </svg>
                       Expert Faculty
                     </h3>
                     <p className="text-sm text-blue-100">Learn from industry professionals</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
             </div>

       {/* News Headlines Marquee Section */}
       <div className="h-[35px] flex my-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                   {/* First Column - Header */}
          <div className="bg-red-800 text-white px-4 flex items-center justify-center min-w-[200px]">
           <span className="text-sm whitespace-nowrap uppercase flex items-center">
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
             </svg>
             Latest News Headlines
           </span>
         </div>
         
         {/* Second Column - Animated Marquee */}
                   <div className="bg-gray-200 flex-1 overflow-hidden relative">
            <div className="marquee-container h-full flex items-center">
              <div className="marquee-content flex items-center space-x-8 text-sm text-gray-700 whitespace-nowrap">
                <span>New Academic Programs Announced for 2024/2025 Session</span>
                <span>•</span>
                <span>Annual Research Symposium Set for Next Month</span>
                <span>•</span>
                <span>University Ranks Top 10 in National Rankings</span>
                <span>•</span>
                <span>Student Exchange Program Applications Open</span>
                <span>•</span>
                <span>New Library Resources Available Online</span>
                <span>•</span>
                <span>Sports Complex Renovation Completed</span>
                <span>•</span>
                <span>Faculty Development Workshop Series</span>
                <span>•</span>
                <span>International Conference on Medical Sciences</span>
                <span>•</span>
                <span>Scholarship Applications for 2024/2025 Academic Year</span>
                <span>•</span>
                <span>New Research Grant Awarded to Engineering Department</span>
                <span>•</span>
                <span>Campus WiFi Network Upgrade Completed</span>
                <span>•</span>
                <span>Student Leadership Conference Registration Open</span>
                <span>•</span>
                <span>Alumni Reunion Weekend Scheduled for December</span>
                <span>•</span>
                <span>New Academic Programs Announced for 2024/2025 Session</span>
                <span>•</span>
                <span>Annual Research Symposium Set for Next Month</span>
                <span>•</span>
                <span>University Ranks Top 10 in National Rankings</span>
                <span>•</span>
                <span>Student Exchange Program Applications Open</span>
                <span>•</span>
                <span>New Library Resources Available Online</span>
                <span>•</span>
                <span>Sports Complex Renovation Completed</span>
                <span>•</span>
                <span>Faculty Development Workshop Series</span>
                <span>•</span>
                <span>International Conference on Medical Sciences</span>
                <span>•</span>
                <span>Scholarship Applications for 2024/2025 Academic Year</span>
                <span>•</span>
                <span>New Research Grant Awarded to Engineering Department</span>
                <span>•</span>
                <span>Campus WiFi Network Upgrade Completed</span>
                <span>•</span>
                <span>Student Leadership Conference Registration Open</span>
                <span>•</span>
                <span>Alumni Reunion Weekend Scheduled for December</span>
              </div>
            </div>
          </div>
       </div>

                    {/* Welcome Address Section */}
             <div className="bg-white py-16">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                                 <div className="grid lg:grid-cols-10 gap-12">
                {/* First Column - Vice Chancellor Image and Welcome Message (70%) */}
                <div className="lg:col-span-8 flex items-start">
                      {/* Vice Chancellor Image - Floated Left */}
                      <div className="flex-shrink-0">
                        <div className="w-48 overflow-hidden" style={{ height: 'auto' }}>
                          <img 
                            src="/vc.jpg" 
                            alt="Vice Chancellor" 
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Welcome Message - Floated Right */}
                      <div className="flex-1 ml-2">
                        <h2 className="text-lg text-gray-900 mb-4 uppercase flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Welcome Address by the Vice Chancellor
                        </h2>
                        <div className="prose prose-sm text-gray-700 leading-relaxed">
                          <p className="mb-3">
                            On behalf of the entire university community, I extend a warm welcome to all prospective students, current students, faculty, staff, and visitors to our esteemed institution. Our university stands as a beacon of academic excellence, innovation, and character development. We are committed to providing world-class education that prepares our students not just for successful careers, but for meaningful lives that contribute positively to society.
                          </p>
                          <p>
                            As we continue to evolve and adapt to the changing landscape of higher education, we remain steadfast in our mission to foster critical thinking, creativity, and leadership skills in our students. I invite you to explore our programs, engage with our community, and discover the endless possibilities that await you at our university.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                                    {/* Second Column - Quick Links (30%) */}
                <div className="lg:col-span-2">
                      <h3 className="text-base text-gray-900 mb-4 uppercase flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Quick Links
                      </h3>
                      <div className="grid grid-cols-1 gap-1">
                        <a href="#" className="block text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors border-b-2 border-blue-500 hover:border-blue-700">
                          Post UTME Portal
                        </a>
                        <a href="#" className="block text-green-600 hover:text-green-800 text-sm font-medium transition-colors border-b-2 border-green-500 hover:border-green-700">
                          Predegree Portal
                        </a>
                        <a href="#" className="block text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors border-b-2 border-purple-500 hover:border-purple-700">
                          Undergraduate Portal
                        </a>
                        <a href="#" className="block text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors border-b-2 border-orange-500 hover:border-orange-700">
                          Basic Program Portal
                        </a>
                        <a href="#" className="block text-red-600 hover:text-red-800 text-sm font-medium transition-colors border-b-2 border-red-500 hover:border-red-700">
                          Post Basic Portal
                        </a>
                        <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors border-b-2 border-indigo-500 hover:border-indigo-700">
                          College of Health Portal
                        </a>
                        <a href="#" className="block text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors border-b-2 border-teal-500 hover:border-teal-700">
                          Transcript
                        </a>
                        <a href="#" className="block text-pink-600 hover:text-pink-800 text-sm font-medium transition-colors border-b-2 border-pink-500 hover:border-pink-700">
                          ND Portal
                        </a>
                        <a href="#" className="block text-yellow-600 hover:text-yellow-800 text-sm font-medium transition-colors border-b-2 border-yellow-500 hover:border-yellow-700">
                          Latest News & Events
                        </a>
                      </div>
                    </div>
                  </div>
               </div>
             </div>

       {/* News Highlights Section */}
       <div className="bg-gray-100 py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-lg text-gray-900 uppercase flex items-center">
               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
               </svg>
               Latest News & Updates
             </h2>
             <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
               View All News →
             </a>
           </div>
           
                                                          {/* News Carousel Container */}
           <div className="relative">
             {/* Navigation Arrows */}
             <button
               onClick={prevNewsSlide}
               className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 shadow-md border border-gray-200 carousel-arrow"
               style={{ left: '-20px' }}
             >
               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
             </button>
             
             <button
               onClick={nextNewsSlide}
               className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 shadow-md border border-gray-200 carousel-arrow"
               style={{ right: '-20px' }}
             >
               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
             </button>

             {/* News Cards Grid */}
             <div className="grid md:grid-cols-3 gap-6">
               {getCurrentNewsItems().map((news, index) => (
                 <div 
                   key={news.id}
                   className="relative bg-white bg-opacity-80 backdrop-blur-sm p-6 shadow-md border border-gray-100 overflow-hidden news-card"
                   style={{
                     transform: `translateX(${(index - 1) * 20}px)`,
                     opacity: 0.8 + (index * 0.1)
                   }}
                 >
                   <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5" style={{ backgroundImage: 'url(/nana-logo.png)' }}></div>
                   <div className="relative z-10">
                     <div className="flex items-center mb-3">
                       <span className={`bg-${news.categoryColor}-100 text-${news.categoryColor}-800 text-xs font-medium px-2 py-1`}>
                         {news.category}
                       </span>
                       <span className="text-gray-500 text-xs ml-3">{news.time}</span>
                     </div>
                     <h3 className="text-sm text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer uppercase flex items-center">
                       <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                       </svg>
                       {news.title}
                     </h3>
                     <p className="text-gray-600 text-sm mb-4">
                       {news.description}
                     </p>
                     <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                       Read More →
                     </a>
                   </div>
                 </div>
               ))}
             </div>

             {/* Carousel Indicators */}
             <div className="flex justify-center mt-6 space-x-2">
               {Array.from({ length: Math.ceil(newsData.length / 3) }, (_, index) => (
                 <button
                   key={index}
                   onClick={() => goToNewsSlide(index)}
                   className={`w-3 h-3 carousel-indicator ${
                     currentNewsSlide === index 
                       ? 'bg-blue-600 scale-125' 
                       : 'bg-gray-300 hover:bg-gray-400'
                   }`}
                 />
               ))}
             </div>
           </div>

                                               {/* Additional News Items Row */}
             <div className="grid md:grid-cols-4 gap-4 mt-8">
               <div className="relative bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-md border border-gray-100 overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5" style={{ backgroundImage: 'url(/nana-logo.png)' }}></div>
                 <div className="relative z-10">
                   <span className="text-gray-500 text-xs">5 days ago</span>
                   <h4 className="text-sm text-gray-900 mt-1 hover:text-blue-600 transition-colors cursor-pointer uppercase flex items-center">
                     <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                     </svg>
                     Student Exchange Program Applications Open
                   </h4>
                 </div>
               </div>
               <div className="relative bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-md border border-gray-100 overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5" style={{ backgroundImage: 'url(/nana-logo.png)' }}></div>
                 <div className="relative z-10">
                   <span className="text-gray-500 text-xs">1 week ago</span>
                   <h4 className="text-sm text-gray-900 mt-1 hover:text-blue-600 transition-colors cursor-pointer uppercase flex items-center">
                     <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                     </svg>
                     New Library Resources Available Online
                   </h4>
                 </div>
               </div>
               <div className="relative bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-md border border-gray-100 overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5" style={{ backgroundImage: 'url(/nana-logo.png)' }}></div>
                 <div className="relative z-10">
                   <span className="text-gray-500 text-xs">1 week ago</span>
                   <h4 className="text-sm text-gray-900 mt-1 hover:text-blue-600 transition-colors cursor-pointer uppercase flex items-center">
                     <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                     </svg>
                     Sports Complex Renovation Completed
                   </h4>
                 </div>
               </div>
               <div className="relative bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-md border border-gray-100 overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5" style={{ backgroundImage: 'url(/nana-logo.png)' }}></div>
                 <div className="relative z-10">
                   <span className="text-gray-500 text-xs">2 weeks ago</span>
                   <h4 className="text-sm text-gray-900 mt-1 hover:text-blue-600 transition-colors cursor-pointer uppercase flex items-center">
                     <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                     </svg>
                     Faculty Development Workshop Series
                   </h4>
                 </div>
               </div>
             </div>
         </div>
       </div>

       {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl text-gray-900 mb-4 uppercase flex items-center justify-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Why Choose Our University?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience world-class education with modern facilities and expert faculty
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-base text-gray-900 mb-2 uppercase flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Academic Excellence
              </h3>
              <p className="text-gray-600">
                Comprehensive programs designed to prepare you for success in your chosen field
              </p>
            </div>

            <div className="bg-white p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base text-gray-900 mb-2 uppercase flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Expert Faculty
              </h3>
              <p className="text-gray-600">
                Learn from experienced professionals and industry experts
              </p>
            </div>

            <div className="bg-white p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-base text-gray-900 mb-2 uppercase flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Modern Facilities
              </h3>
              <p className="text-gray-600">
                State-of-the-art laboratories and learning environments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Preview */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-xl text-gray-900 mb-6 uppercase flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Experience Our Campus
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our campus provides an ideal environment for learning and personal growth. 
                With modern facilities and a supportive community, you'll have everything 
                you need to succeed in your academic journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Modern laboratories and research facilities</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Comprehensive library and study spaces</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Sports and recreational facilities</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/lab-header.jpg"
                alt="Campus Laboratory"
                className="shadow-lg w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl text-white mb-4 uppercase flex items-center justify-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have chosen our university for their education
          </p>
          {user ? (
            <Link
              to="/apply"
              className="bg-white text-blue-600 px-8 py-3 text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Start Your Application
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Apply Now
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/nana-logo.png" 
                alt="University Logo" 
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-400">
                Empowering students with quality education and opportunities for growth.
              </p>
            </div>
            <div>
              <h3 className="text-base mb-4 uppercase flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Apply</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base mb-4 uppercase flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@university.edu</li>
                <li>Phone: +234 123 456 7890</li>
                <li>Address: University Campus</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base mb-4 uppercase flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                </svg>
                Follow Us
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 University Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
