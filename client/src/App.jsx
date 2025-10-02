import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import ResponsiveTestPage from './components/ResponsiveTestPage';
import './styles/globals.css';

function App() {
  // Show test page in development for component verification
  const showTestPage = process.env.NODE_ENV === 'development' && window.location.search.includes('test=components');
  
  if (showTestPage) {
    return <ResponsiveTestPage />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
