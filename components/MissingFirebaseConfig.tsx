import React from 'react';

const MissingFirebaseConfig: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full text-center border-t-4 border-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-3xl font-bold text-slate-800 mt-4">Configuration Needed</h1>
        <p className="text-slate-600 mt-2">
          Your Firebase configuration is missing or incomplete. To run the application, you must provide your own Firebase project credentials.
        </p>
        <div className="text-left bg-slate-50 p-4 rounded-md mt-6">
          <h2 className="font-semibold text-slate-700">Action Required:</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-sm text-slate-600">
            <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-medium">Firebase Console</a> and create a new project.</li>
            <li>In your project, create a new Web App to get your configuration keys.</li>
            <li>Open the file <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono">firebase.ts</code> in your editor.</li>
            <li>Replace the placeholder values in the `firebaseConfig` object with the keys from your Firebase project.</li>
            <li>Enable **Email/Password** authentication and the **Firestore Database** (in test mode) in your Firebase project console.</li>
          </ol>
        </div>
        <p className="text-xs text-slate-400 mt-6">After updating the file, the application will automatically reload.</p>
      </div>
    </div>
  );
};

export default MissingFirebaseConfig;