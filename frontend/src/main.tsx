import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './Login';
import Callback from './Callback';
import { BrowserRouter, Routes, Route } from 'react-router';
import Quiz from './Quiz';
import Header from './Header';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <BrowserRouter>
    <Header/>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  </BrowserRouter>
);

