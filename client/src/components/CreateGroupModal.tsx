import { useState } from "react";
import { CreateGroupModalProps } from "../interfaces";
import { FiX, FiUsers, FiLock, FiUnlock } from "react-icons/fi";

const CreateGroupModal = ({ isOpen, onClose, onCreate }: CreateGroupModalProps) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    if (hasPassword && !password.trim()) {
      setError("Password is required if protection is enabled");
      return;
    }

    // Reset form after submission
    onCreate(name, description, password, hasPassword);
    setName("");
    setDescription("");
    setPassword("");
    setHasPassword(false);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Create New Group</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-white mb-1">
                Group Name *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiUsers className="h-4 w-4" />
                </div>
                <input
                  id="group-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-600 transition-all"
                  maxLength={30}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="group-description" className="block text-sm font-medium text-white mb-1">
                Description
              </label>
              <textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this group about?"
                className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-600 transition-all"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/200 characters
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="has-password"
                type="checkbox"
                checked={hasPassword}
                onChange={(e) => setHasPassword(e.target.checked)}
                className="h-4 w-4 text-white bg-gray-700 border-gray-600 rounded focus:ring-0"
              />
              <label htmlFor="has-password" className="ml-2 text-sm font-medium text-white">
                Password protection
              </label>
            </div>

            {hasPassword && (
              <div>
                <label htmlFor="group-password" className="block text-sm font-medium text-white mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {password ? <FiLock className="h-4 w-4" /> : <FiUnlock className="h-4 w-4" />}
                  </div>
                  <input
                    id="group-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter group password"
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-600 transition-all"
                    required={hasPassword}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Others will need this password to join the group
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
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
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;