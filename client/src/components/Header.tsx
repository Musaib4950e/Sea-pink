import { HeaderProps } from "../interfaces";
import { FiLogOut, FiUsers, FiMessageSquare, FiList } from "react-icons/fi";
import Tabs from "./Tabs";
import React, { ReactNode } from "react";

interface ExtendedHeaderProps extends HeaderProps {
  children?: ReactNode;
}

const Header = ({ currentUser, onLogout, activeTab, setActiveTab, children }: ExtendedHeaderProps) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-pink-500 to-pink-700 p-2 rounded-lg shadow-lg">
              <FiMessageSquare className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold app-name">Sea - pink</h1>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
              <div className="relative">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-black font-medium">
                  {currentUser?.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <span className="text-sm font-medium text-white">{currentUser?.username}</span>
            </div>

            <div className="flex items-center">
              {children}
              <button 
                onClick={onLogout} 
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-all"
                title="Logout"
                aria-label="Logout"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </header>
  );
};

export default Header;