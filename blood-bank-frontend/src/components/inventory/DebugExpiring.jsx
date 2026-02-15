// components/inventory/DebugExpiring.jsx
import React, { useState } from 'react';
import axios from 'axios';

const DebugExpiring = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runDebug = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/inventory/debug/expiring', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDebugData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/inventory/test/create-expiring', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Test data created!');
      runDebug(); // Refresh debug data
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Expiring Units</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={runDebug}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Run Debug
        </button>
        <button
          onClick={createTestData}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Create Test Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      {debugData && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-bold mb-2">Statistics:</h2>
            <pre className="text-sm">
              {JSON.stringify(debugData.stats, null, 2)}
            </pre>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg">
            <h2 className="font-bold mb-2">Expiring Units ({debugData.expiringCount}):</h2>
            <pre className="text-sm">
              {JSON.stringify(debugData.expiringUnits, null, 2)}
            </pre>
          </div>

          <div className="bg-blue-100 p-4 rounded-lg">
            <h2 className="font-bold mb-2">All Units:</h2>
            <pre className="text-sm max-h-96 overflow-auto">
              {JSON.stringify(debugData.allUnits, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugExpiring;