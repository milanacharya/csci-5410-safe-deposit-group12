import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Withdraw from './pages/Withdraw';
import ViewMessages from './pages/ViewMessages';
import SendMessages from './pages/SendMessages';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/withdraw" element={<Withdraw />} />
        <Route exact path="/view" element={<ViewMessages />} />
        <Route exact path="/send" element={<SendMessages />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
