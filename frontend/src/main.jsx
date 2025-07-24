import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router } from 'react-router-dom';

const helmetContext = {};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <HelmetProvider context={helmetContext}>
        <App />
      </HelmetProvider>
    </Router>
  </StrictMode>,
)
