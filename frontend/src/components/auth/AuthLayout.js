import React from 'react';

// Use the provided lab image as the header background
const BG_IMAGE = '/lab-header.jpg'; // Place this image in the public folder
const INSTITUTION_NAME = 'NANA COLLEGE OF NURSING AND HEALTH SCIENCES';

const AuthLayout = ({ children, instructions }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - no top padding */}
      <div
        className="w-full h-48 flex items-center justify-center relative m-0 p-0 pt-0"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-primary-900 bg-opacity-60" />
        <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg">
          {INSTITUTION_NAME}
        </h1>
      </div>
      {/* Scrolling Text */}
      <div className="w-full overflow-hidden bg-primary-900">
        <div className="whitespace-nowrap animate-scroll px-4 py-2 text-white font-semibold text-center text-base">
          Welcome to Nana College of Nursing and Health Sciences... Your home for the 21st Century Nursing Experience
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch justify-center max-w-5xl mx-auto w-full pt-0 pb-8 relative overflow-hidden">
        {/* Faded background image */}
        <img src="/nana-faded-bg.png" alt="Faded Nana Logo" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none" style={{zIndex:0}} />
        {/* Instructions */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-6" style={{zIndex:1}}>
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6 w-full max-w-md">
            {instructions}
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Requirements for Admission:</h3>
              <ul className="list-disc ml-5 text-blue-900 space-y-1">
                <li>JAMB CUT OFF OF 150</li>
                <li>O'LEVEL WITH 5 BASIC SCIENCE SUBJECT</li>
                <li>CANDIDATE MUST BE ABOVE 17 YEARS OLD</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Form */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-6" style={{zIndex:1}}>
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-center mb-6">
              <img src="/nana-logo.png" alt="Nana College of Nursing Logo" className="h-12" />
            </div>
            {children}
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full bg-primary-900 text-white text-center py-4 mt-auto">
        <div className="text-sm">
          &copy; {new Date().getFullYear()} NANA College of Nursing and Health Sciences. All rights reserved.<br />
          Developed by <a href="mailto:admissions@nana.edu.ng" className="underline hover:text-primary-300">Your Developer Name or Team</a>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout; 