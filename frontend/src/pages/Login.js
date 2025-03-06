import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/auth/login', { email, password });
      sessionStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 to-purple-900">
      <form className="bg-white p-8 rounded-lg shadow-lg w-80 space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Login</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
          type="submit"
        >
          Login
        </button>
        <button
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300"
          type="button"
          onClick={handleRegister}
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Login;