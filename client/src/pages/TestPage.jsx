import React, { useState, useEffect } from 'react';

const TestPage = () => {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [paymentConfig, setPaymentConfig] = useState(null);

  useEffect(() => {
    testBackend();
  }, []);

  const testBackend = async () => {
    try {
      // Test basic health endpoint
      const healthResponse = await fetch('/api/health');
      if (healthResponse.ok) {
        setBackendStatus('✅ Backend connected!');
      } else {
        setBackendStatus('❌ Backend health check failed');
      }

      // Test payment config
      const configResponse = await fetch('/api/payment/config');
      const configData = await configResponse.json();
      
      if (configData.success) {
        setPaymentConfig('✅ Payment API working!');
      } else {
        setPaymentConfig('❌ Payment API failed');
      }
    } catch (error) {
      setBackendStatus('❌ Cannot connect to backend: ' + error.message);
      setPaymentConfig('❌ Cannot test payment API');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔧 System Test</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Backend Connection</h2>
            <p className="text-lg">{backendStatus}</p>
          </div>
          
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Payment API</h2>
            <p className="text-lg">{paymentConfig}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Server URLs</h2>
            <p><strong>Frontend:</strong> <a href="http://localhost:5173" target="_blank" className="text-blue-600">http://localhost:5173</a></p>
            <p><strong>Backend:</strong> <a href="http://localhost:5000/health" target="_blank" className="text-blue-600">http://localhost:5000</a></p>
          </div>
          
          <div className="pt-4">
            <button 
              onClick={testBackend}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Test Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;