import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/select.css';
import './styles/sweetalert2.css';
import './styles/tooltip.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
