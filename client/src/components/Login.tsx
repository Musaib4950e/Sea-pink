import { useState } from "react";
import { LoginProps } from "../interfaces";
import { FiUser, FiLogIn, FiMail, FiLock, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { socket } from "../services/socket";

const Login = ({ onLogin }: LoginProps) => {
    // Form state
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    
    // UI state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const validateForm = () => {
        // Clear previous errors
        setError(null);
        
        // Common validation
        if (!username.trim()) {
            setError("Username cannot be empty");
            return false;
        }
        
        if (!password.trim()) {
            setError("Password cannot be empty");
            return false;
        }
        
        // Sign up specific validation
        if (isSignUp) {
            if (!email.trim()) {
                setError("Email cannot be empty");
                return false;
            }
            
            if (!/\S+@\S+\.\S+/.test(email)) {
                setError("Please enter a valid email address");
                return false;
            }
            
            if (password.length < 6) {
                setError("Password must be at least 6 characters long");
                return false;
            }
            
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return false;
            }
        }
        
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        
        try {
            if (isSignUp) {
                // Create a promise to check if username exists via socket
                const checkUsernameExists = () => {
                    return new Promise<boolean>((resolve) => {
                        // Emit check username event
                        socket.emit('checkUsername', username);
                        
                        // Listen for the response
                        const handleResponse = (exists: boolean) => {
                            socket.off('usernameCheckResult', handleResponse);
                            resolve(exists);
                        };
                        
                        socket.on('usernameCheckResult', handleResponse);
                        
                        // Timeout after 3 seconds in case server doesn't respond
                        setTimeout(() => {
                            socket.off('usernameCheckResult', handleResponse);
                            resolve(false); // Assume username is available if no response
                        }, 3000);
                    });
                };
                
                // Check if username exists
                const usernameExists = await checkUsernameExists();
                
                if (usernameExists) {
                    setError("Username already taken. Please choose another one.");
                    setIsLoading(false);
                    return;
                }
                
                // Register new user
                onLogin({ username, email, password });
            } else {
                // Login
                onLogin({ username, email, password });
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsSignUp(!isSignUp);
        setError(null);
    };

    const getRandomAvatarColor = () => {
        const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#c026d3'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-xl shadow-gray-800/50 overflow-hidden border border-gray-800">
                {/* Header line */}
                <div className="h-2 bg-white"></div>

                <div className="px-8 py-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">
                            <span className="text-[#ff9a9e]">Sea</span> - <span className="text-pink-500">pink</span>
                        </h1>
                        <p className="mt-2 text-gray-400">
                            {isSignUp ? 'Create your account' : 'Sign in to your account'}
                        </p>
                    </div>

                    {/* Auth mode toggle */}
                    <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                                !isSignUp ? 'bg-white text-black font-medium' : 'text-gray-400'
                            }`}
                            onClick={() => setIsSignUp(false)}
                        >
                            Log In
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                                isSignUp ? 'bg-white text-black font-medium' : 'text-gray-400'
                            }`}
                            onClick={() => setIsSignUp(true)}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Login/Signup form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FiUser className="h-5 w-5" />
                                </div>
                                <input 
                                    type="text" 
                                    id="username" 
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-gray-600 transition-all duration-200 placeholder:text-gray-500" 
                                    required 
                                />
                            </div>
                        </div>
                        
                        {isSignUp && (
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiMail className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-gray-600 transition-all duration-200 placeholder:text-gray-500" 
                                        required={isSignUp}
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FiLock className="h-5 w-5" />
                                </div>
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-gray-600 transition-all duration-200 placeholder:text-gray-500" 
                                    required 
                                />
                            </div>
                        </div>
                        
                        {isSignUp && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiLock className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="password" 
                                        id="confirmPassword" 
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-gray-600 transition-all duration-200 placeholder:text-gray-500" 
                                        required={isSignUp}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {error && (
                            <div className="flex items-center space-x-2 text-red-400 p-3 bg-red-900/20 rounded-lg">
                                <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        
                        <button 
                            disabled={isLoading} 
                            type="submit" 
                            className="w-full px-4 py-3 text-black font-medium bg-white rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{isSignUp ? 'Creating account...' : 'Logging in...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Create Account' : 'Log In'}</span>
                                    <FiArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                        
                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={toggleAuthMode}
                                className="text-gray-400 hover:text-white text-sm mt-2 transition-colors"
                            >
                                {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
                            </button>
                        </div>
                    </form>

                    {/* Features section */}
                    <div className="mt-10 pt-6 border-t border-gray-800">
                        <h3 className="text-white font-medium mb-4">Features:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <div className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center text-xs mr-2 mt-0.5">✓</div>
                                <span className="text-gray-400 text-sm">Browse and search for groups</span>
                            </li>
                            <li className="flex items-start">
                                <div className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center text-xs mr-2 mt-0.5">✓</div>
                                <span className="text-gray-400 text-sm">Join groups with passwords</span>
                            </li>
                            <li className="flex items-start">
                                <div className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center text-xs mr-2 mt-0.5">✓</div>
                                <span className="text-gray-400 text-sm">Create your own chat groups</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;