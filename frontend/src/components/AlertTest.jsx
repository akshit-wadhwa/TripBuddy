import React from 'react';
import { useSimpleAlert } from './SimpleAlert';

const AlertTest = () => {
  const { showSuccess, showError, showWarning, showInfo, AlertComponent } = useSimpleAlert();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🚨 Simple Alert System Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Test Different Alerts</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => showSuccess('Success!', 'Your ride has been published successfully')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Show Success Alert
            </button>
            
            <button
              onClick={() => showError('Error!', 'Failed to save ride. Please try again.')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Show Error Alert
            </button>
            
            <button
              onClick={() => showWarning('Warning!', 'Please fill in all required fields')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Show Warning Alert
            </button>
            
            <button
              onClick={() => showInfo('Info', 'Your ride is being processed')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Show Info Alert
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">TripBuddy Specific Examples:</h3>
            <div className="space-y-2">
              <button
                onClick={() => showSuccess('Ride Booked!', 'Your ride from Mumbai to Pune is confirmed')}
                className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-left transition-colors"
              >
                Ride Booking Success
              </button>
              
              <button
                onClick={() => showError('Payment Failed', 'Unable to process payment. Please try again.')}
                className="block w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-left transition-colors"
              >
                Payment Error
              </button>
              
              <button
                onClick={() => showWarning('Driver Arriving', 'Your driver will arrive in 5 minutes')}
                className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-left transition-colors"
              >
                Driver Notification
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertComponent />
    </div>
  );
};

export default AlertTest;