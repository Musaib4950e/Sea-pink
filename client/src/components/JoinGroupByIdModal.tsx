import { useState } from "react";
import { FiHash, FiKey, FiAlertCircle } from "react-icons/fi";

interface JoinGroupByIdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (groupId: string, password: string) => void;
    error: string | null;
}

const JoinGroupByIdModal = ({ isOpen, onClose, onJoin, error }: JoinGroupByIdModalProps) => {
    const [groupId, setGroupId] = useState("");
    const [password, setPassword] = useState("");
    
    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupId.trim()) return;
        onJoin(groupId.trim(), password.trim());
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg w-full max-w-md overflow-hidden shadow-xl">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Join a Group by ID</h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Group ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <FiHash className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={groupId}
                                    onChange={(e) => setGroupId(e.target.value)}
                                    placeholder="Enter group ID"
                                    className="bg-gray-800 text-white pl-10 pr-4 py-2 w-full rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Password (if required)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <FiKey className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter group password"
                                    className="bg-gray-800 text-white pl-10 pr-4 py-2 w-full rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-white flex items-center">
                                <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!groupId.trim()}
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

export default JoinGroupByIdModal;