import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaHospital, FaSignInAlt, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'admin' // Default role
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Use the regular login endpoint (your backend handles role checking)
            const response = await axios.post('http://localhost:5000/api/login', formData);

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            // Check if user has admin or technician role
            if (response.data.user && (formData.role === 'admin' || formData.role === 'technician')) {
                // Store tokens and user info
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                setSuccess('Login successful! Redirecting...');

                // Redirect based on role
                setTimeout(() => {
                    navigate('/dashboard'); // Both admin and technician go to same dashboard
                }, 1500);
            } else {
                setError('Access denied. Please check your credentials and role.');
            }
        } catch (err) {
            console.log('ERROR OBJECT:', err);
            console.log('ERROR RESPONSE:', err.response);
            console.log('ERROR DATA:', err.response?.data);
            console.log('ERROR STATUS:', err.response?.status);

            // Show the actual error message from server
            const errorMsg = err.response?.data?.msg || err.message || 'Login failed. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">


                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-12 h-12 bg-linear-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            <FaUserShield className="text-white text-xl" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                        Staff Login
                    </h2>
                    <p className="text-gray-600 text-center mb-8">
                        Access the blood bank management system
                    </p>

                    {/* Role Selector */}
                    <div className="flex mb-6 bg-red-50 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'admin' })}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${formData.role === 'admin'
                                ? 'bg-white text-red-700 shadow-sm'
                                : 'text-gray-700 hover:text-red-600'
                                }`}
                        >
                            Administrator
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'technician' })}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${formData.role === 'technician'
                                ? 'bg-white text-red-700 shadow-sm'
                                : 'text-gray-700 hover:text-red-600'
                                }`}
                        >
                            Technician
                        </button>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-700 text-center">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-green-700 text-center">{success}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-red-500" />
                                    <span>Email Address</span>
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 pl-12 bg-red-50 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="staff@mega.org"
                                />
                                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <FaLock className="text-red-500" />
                                    <span>Password</span>
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 pl-12 pr-12 bg-red-50 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                />
                                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    Login as {formData.role === 'admin' ? 'Administrator' : 'Technician'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Additional Info */}


                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-600">
                        Having trouble logging in? Contact system administrator
                    </p>
                    <a
                        href="mailto:admin@mega.org"
                        className="text-red-600 hover:text-red-700 text-sm font-medium mt-2 inline-block"
                    >
                        admin@mega.org
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;