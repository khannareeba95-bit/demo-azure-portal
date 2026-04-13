import React from 'react';
import { useSearchParams } from 'react-router-dom';
 
export default function Modal() {
  const [searchParams] = useSearchParams();
  const projectTitle = searchParams.get('project') || '';
 
  // Check if the project is IDP (Intelligent Document Processing)
  const isIDP = projectTitle.toLowerCase().includes('intelligent document processing') ||
                projectTitle.toLowerCase().includes('idp');
 
  if (isIDP) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">{projectTitle}</h1>
         
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - YouTube Video */}
            <div className="flex flex-col">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/lh87NNryb4E"
                  title={projectTitle}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
 
            {/* Right side - Project Description */}
            <div className="flex flex-col">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Project Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  This project demonstrates advanced document processing capabilities using AI and machine learning.
                  It can extract, analyze, and process various types of documents with high accuracy and efficiency.
                  The solution leverages AWS services to provide scalable and reliable document processing workflows.
                </p>
              </div>
             
              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto">
                <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Book a Demo
                </button>
                <button  className="bg-[#20629b] w-full hover:scale-110 shadow-lg ring-0 focus:outline-0 border-none text-white py-3 px-4  align-top transition duration-500 ease-in-out">
                  Try for Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
 
  // For all other projects, show blank page
  return (
    <div className="min-h-screen bg-white">
    </div>
  );
}