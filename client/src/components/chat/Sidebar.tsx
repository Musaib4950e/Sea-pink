import { GetUserIcon } from "../../helpers"
import { SidebarProps, User } from "../../interfaces"
import { FiUsers, FiSettings, FiClipboard } from "react-icons/fi"

const Sidebar = ({ users, currentUser }: SidebarProps) => {
    return (
        <div className="w-full md:w-64 border-r border-gray-800 bg-gray-900 h-full overflow-y-auto">
            {/* User section */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Members</h3>
                    <div className="bg-gray-800 text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
                        {users.length}
                    </div>
                </div>

                <div className="space-y-1">
                    {
                        users.map((user: User) => (
                            <div 
                                key={user.id} 
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                                    currentUser && user.id === currentUser.id 
                                    ? "bg-white text-black" 
                                    : "text-gray-300 hover:bg-gray-800"
                                }`}
                            >
                                <div className="relative">
                                    <GetUserIcon name={user.username} size={7} />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium truncate max-w-[120px]">
                                        {user.username}
                                        {currentUser && user.id === currentUser.id && " (You)"}
                                    </p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            
            {/* Additional sections */}
            <div className="p-4 border-t border-gray-800">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Menu</h3>
                
                <div className="space-y-1">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <FiUsers className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Group Chat</span>
                    </button>
                    
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <FiClipboard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Shared Files</span>
                    </button>
                    
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <FiSettings className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Settings</span>
                    </button>
                </div>
            </div>
            
            {/* Version information */}
            <div className="p-4 mt-auto">
                <p className="text-xs text-gray-500 text-center">TeamSpace Chat v1.0</p>
            </div>
        </div>
    )
}

export default Sidebar