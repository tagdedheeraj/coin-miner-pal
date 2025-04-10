
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/firebase.ts' // Import Firebase initialization

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

// Wrap render in a try-catch to help with debugging
try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  console.error('Failed to render application:', error)
}
