import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './Login';
import Callback from './Callback';
import { BrowserRouter, Routes, Route } from 'react-router';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />
    </Routes>
  </BrowserRouter>
);

