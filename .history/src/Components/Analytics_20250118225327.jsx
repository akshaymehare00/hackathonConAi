import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://13.127.144.141:3004/api/interviews/get-interview_by_id/?interview_id=${localStorage.getItem('cvResponse')}`);
        // console.log("🚀 ~ fetchData ~ response.data.Interview:", response.data.data.Interview)
        setInterviewData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch interview data');
        setLoading(false);
      }
        
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-xl">No interview data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Interview Analysis</h1>
        <p className="text-gray-600">Comprehensive evaluation of interview performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Candidate Profile */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white">
                {interviewData.candidate.full_name.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-semibold">{interviewData.candidate.full_name}</h2>
            <p className="text-gray-600">Candidate</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{interviewData.candidate.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{interviewData.candidate.phone_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Interview Date</p>
                <p className="font-medium">{new Date(interviewData.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-600">
              {interviewData.jd}
            </pre>
          </div>
        </div>
      </div>

      {/* Additional sections can be added here as the API provides more data */}
    </div>
  );
};

export default Analytics;