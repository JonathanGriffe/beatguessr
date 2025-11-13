import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './App';
import Callback from './Callback';
import Header from './Header';
import './index.css';
import Login from './Login';
import Quiz from './Quiz';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <BrowserRouter>
    <div className="flex flex-col h-screen">
      <div className="absolute top-0 w-full">
        <Header />
      </div>
      <div className="flex flex-col h-full">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </div>
    </div>
  </BrowserRouter>
);

