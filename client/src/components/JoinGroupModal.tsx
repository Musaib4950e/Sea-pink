import { useState } from "react";
import { JoinGroupModalProps } from "../interfaces";
import { FiX, FiLock } from "react-icons/fi";

const JoinGroupModal = ({ group, isOpen, onClose, onJoin, error }: JoinGroupModalProps) => {
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoin(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Join {group.name}</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-400 mb-4">
            This group requires a password to join.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="group-password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock className="h-4 w-4" />
                </div>
                <input
                  id="group-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter group password"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-600 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Join Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupModal;