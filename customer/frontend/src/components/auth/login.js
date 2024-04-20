import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/login', { email, password });
      if (response.status === 200) {
        const { customer} = response.data;
        // Save only customer ID, name, and email in local storage
        localStorage.setItem('customerId', customer.customer_id);
        localStorage.setItem('customerName', customer.customer_name);
        localStorage.setItem('customerEmail', customer.email);
        toast.success('Login successful!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          navigate('/home');
        }, 2000); // Redirect to home after 2 seconds
      }
    } catch (error) {
      console.error('Login failed', error);
      toast.error('Login failed. Please check your credentials.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // Delete local storage when current route is '/'
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register' ) {
      localStorage.removeItem('customerEmail');
      localStorage.removeItem('customerId');
      localStorage.removeItem('customerName');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email:</label>
            <input
              type="email"
              className="form-input mt-1 block w-full rounded-full px-4 py-2 bg-gray-100 focus:outline-none focus:bg-gray-200"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password:</label>
            <input
              type="password"
              className="form-input mt-1 block w-full rounded-full px-4 py-2 bg-gray-100 focus:outline-none focus:bg-gray-200"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-full w-full">Login</button>
        </form>
        <p className="mt-3 text-sm text-center">Don't have an account? <Link to="/register" className="text-blue-500">Register here</Link>.</p>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
