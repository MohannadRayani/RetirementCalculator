import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';

function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (token) {
      API.get('/user/me')
        .then(res => setUserName(res.data.name))
        .catch(err => console.error('Failed to fetch user data', err));
    }
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white flex justify-between items-center shadow-lg">
      <div className="flex items-center space-x-2">
        <img src="/Logo_Regular.svg" alt="RetireNow" className="h-12 w-12" />
        <Link to="/dashboard" className="text-2xl font-extrabold tracking-widest hover:text-gray-300 transition duration-300">
          RetireNow
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {token ? (
          <>
            <Link to="/dashboard" className="hover:text-gray-300 transition duration-300">Dashboard</Link>
            <Link to="/retirement-comparison" className="hover:text-gray-300 transition duration-300">Retirement Comparison</Link>
            {/* Add the Monte Carlo simulation link */}
            <Link to="/montecarlo" className="hover:text-gray-300 transition duration-300">Monte Carlo</Link>
            <span className="text-lg">{userName}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition duration-300 shadow-md"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-green-500 px-4 py-2 rounded-full hover:bg-green-600 transition duration-300 shadow-md"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;