import { useState } from "react";
import { FiUser, FiEdit2, FiLogOut, FiSave, FiX, FiMail, FiLock, FiKey, FiCheck, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { User } from "../interfaces";

interface ProfileProps {
  currentUser: User | null;
  onLogout: () => void;
  onUpdateProfile: (userData: {username?: string; email?: string; password?: string}) => void;
  onDeleteAccount?: () => void;
}

const Profile = ({ currentUser, onLogout, onUpdateProfile, onDeleteAccount }: ProfileProps) => {
  // State for profile sections
  const [activeSection, setActiveSection] = useState<string>("profile");
  
  // Profile form state
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(currentUser?.username || "");
  
  // Email form state
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(currentUser?.email || "");
  
  // Password form state
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Handle username update
  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim() || username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    
    onUpdateProfile({ username });
    setIsEditingUsername(false);
    setSuccessMessage("Username updated successfully!");
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle email update
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    onUpdateProfile({ email });
    setIsEditingEmail(false);
    setSuccessMessage("Email updated successfully!");
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle password change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // In a real app, we would verify the current password against stored password
    // But for this prototype, we'll just check that it's not empty
    if (!currentPassword.trim()) {
      setError("Current password is required");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    // In a real app, we would hash the password before sending it
    onUpdateProfile({ password: newPassword });
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccessMessage("Password changed successfully!");
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Cancel forms
  const cancelEditUsername = () => {
    setUsername(currentUser?.username || "");
    setIsEditingUsername(false);
    setError(null);
  };
  
  const cancelEditEmail = () => {
    setEmail(currentUser?.email || "");
    setIsEditingEmail(false);
    setError(null);
  };
  
  const cancelChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChangingPassword(false);
    setError(null);
  };

  // If no user is logged in
  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <p className="text-gray-400">Please log in first</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 p-4 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg mb-6">
          <div className="p-6 text-center">
            <div 
              className="inline-flex items-center justify-center w-24 h-24 text-4xl font-bold rounded-full mb-4"
              style={{ backgroundColor: currentUser.avatarColor || "#4f46e5", color: "white" }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">{currentUser.username}</h2>
            <p className="text-gray-400 text-sm mb-4">{currentUser.email || "No email set"}</p>
            
            {/* Success message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-900/20 text-green-400 rounded-lg flex items-center">
                <FiCheck className="h-4 w-4 mr-2" />
                <span>{successMessage}</span>
              </div>
            )}
            
            {/* Section tabs */}
            <div className="flex bg-gray-700 rounded-lg p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveSection("profile")}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                  activeSection === "profile" ? "bg-white text-black font-medium" : "text-gray-300"
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("security")}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                  activeSection === "security" ? "bg-white text-black font-medium" : "text-gray-300"
                }`}
              >
                Security
              </button>
            </div>
          </div>
        </div>
        
        {/* Profile Section */}
        {activeSection === "profile" && (
          <div className="space-y-6">
            {/* Username Section */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Username</h3>
                
                {isEditingUsername ? (
                  <form onSubmit={handleUsernameSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FiUser className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-500 transition-all"
                        placeholder="Enter new username"
                        autoFocus
                      />
                    </div>
                    
                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={cancelEditUsername}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                      >
                        <FiX className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                      >
                        <FiSave className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white">{currentUser.username}</p>
                        <p className="text-gray-400 text-sm">This is how others will see you</p>
                      </div>
                      <button
                        onClick={() => setIsEditingUsername(true)}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Email Section */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Email Address</h3>
                
                {isEditingEmail ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FiMail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-500 transition-all"
                        placeholder="Enter your email address"
                        autoFocus
                      />
                    </div>
                    
                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={cancelEditEmail}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                      >
                        <FiX className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                      >
                        <FiSave className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white">{currentUser.email || "Not set"}</p>
                        <p className="text-gray-400 text-sm">Used for account recovery</p>
                      </div>
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* User Stats */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-2xl font-bold text-white">0</h3>
                    <p className="text-gray-400 text-sm">Groups Joined</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-2xl font-bold text-white">0</h3>
                    <p className="text-gray-400 text-sm">Messages Sent</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 shadow-lg"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
        
        {/* Security Section */}
        {activeSection === "security" && (
          <div className="space-y-6">
            {/* Password Section */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                
                {isChangingPassword ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-white mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FiKey className="h-4 w-4" />
                          </div>
                          <input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-500 transition-all"
                            placeholder="Enter your current password"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-white mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FiLock className="h-4 w-4" />
                          </div>
                          <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-500 transition-all"
                            placeholder="Enter your new password"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-white mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FiLock className="h-4 w-4" />
                          </div>
                          <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-500 transition-all"
                            placeholder="Confirm your new password"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={cancelChangePassword}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                      >
                        <FiX className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                      >
                        <FiSave className="h-4 w-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-gray-400 mb-4">
                      For security reasons, you should use a strong password and change it periodically.
                    </p>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiKey className="h-4 w-4" />
                      <span>Change Password</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Security Info */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Security Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Last Login</div>
                    <div className="text-white">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Account Created</div>
                    <div className="text-white">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Last Password Change</div>
                    <div className="text-white">Never</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delete Account Section */}
            {onDeleteAccount && (
              <div className="bg-gray-800 rounded-xl border border-red-900/50 overflow-hidden shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Delete Account</h3>
                  
                  {showDeleteConfirm ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <FiAlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-white font-medium">This action cannot be undone</h4>
                            <p className="text-gray-300 text-sm mt-1">
                              Deleting your account will remove all your data, including messages,
                              group memberships, and profile information from our servers permanently.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={onDeleteAccount}
                          className="px-4 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          <span>Permanently Delete Account</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 mb-4">
                        When you delete your account, all of your data will be permanently removed.
                        This action cannot be undone.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full px-4 py-3 bg-red-900/50 text-white rounded-lg border border-red-800 hover:bg-red-800/50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Back to Profile button */}
            <button
              onClick={() => setActiveSection("profile")}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 shadow-lg"
            >
              <FiUser className="h-4 w-4" />
              <span>Back to Profile</span>
            </button>
          </div>
        )}
        
        {/* App Info */}
        <div className="text-center mt-6 text-gray-500 text-xs">
          <p>Group Chat App • Version 1.0.0</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;