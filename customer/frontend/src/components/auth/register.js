import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const Register = () => {
  const [customer_name, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Access the navigate function

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/auth/register', {
        email,
        password,
        customer_name
      });

      if (response.status === 201) {
 
        await Swal.fire({
          icon: 'success',
          title: 'Registered Successfully!',
          showCancelButton: true,
          confirmButtonText: 'Continue',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            // Navigate to login page
            navigate('/login');
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // Show error message using SweetAlert if registration fails
      await Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'Please try again later.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">Name:</label>
            <input
              type="text"
              className="form-input mt-1 block w-full rounded-full px-4 py-2 bg-gray-100 focus:outline-none focus:bg-gray-200"
              id="name"
              value={customer_name}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
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
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded w-full">Register</button>
        </form>
        <p className="mt-3 text-sm text-center">Already have an account? <Link to="/login" className="text-blue-500">Login here</Link>.</p>
      </div>
    </div>
  );
};

export default Register;
