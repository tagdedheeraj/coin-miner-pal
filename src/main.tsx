
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Starting application initialization...');

try {
  console.log('Finding root element...');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Failed to find the root element');
    document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error</h1><p>Application failed to initialize. Root element not found.</p></div>';
  } else {
    console.log('Root element found, rendering app...');
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered to DOM');
  }
} catch (error) {
  console.error('Failed to render application:', error);
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error</h1><p>Application failed to initialize. Please check console for details.</p></div>';
}
