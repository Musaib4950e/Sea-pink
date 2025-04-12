import { RiMessage2Fill } from "react-icons/ri"
import { HeaderProps } from "../../interfaces"
import { GetUserIcon } from "../../helpers"
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"
import { BsCircleFill } from "react-icons/bs"

const Header = ({ 
    currentUser, 
    users, 
    onLogout, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen 
}: HeaderProps) => {
    
    const toggleMobileMenu = () => {
        if (setIsMobileMenuOpen) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        }
    };
    
    return (
        <header className="bg-gray-900 border-b border-gray-800 shadow-lg z-40 relative">
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* App Brand and Mobile Menu Toggle */}
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <FiX className="h-5 w-5" />
                            ) : (
                                <FiMenu className="h-5 w-5" />
                            )}
                        </button>
                        
                        <div className="bg-white p-2 rounded-lg shadow-lg">
                            <RiMessage2Fill className="h-5 w-5 text-black" />
                        </div>
                        <h1 className="text-xl font-bold text-white">TeamSpace</h1>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-3 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                            <div className="relative">
                                <GetUserIcon name={currentUser?.username} size={7} />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></div>
                            </div>
                            <span className="text-sm font-medium text-white">{currentUser?.username}</span>
                        </div>

                        <button 
                            onClick={() => onLogout(currentUser?.username || '')} 
                            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-all"
                            title="Logout"
                        >
                            <FiLogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Online Users Bar */}
            <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center space-x-2 overflow-x-auto">
                <div className="flex -space-x-2 mr-3">
                    {
                        users.slice(0, 5).map((user) => {
                            return (
                                <div key={user.id} className="relative group">
                                    <div className="w-8 h-8 rounded-full ring-2 ring-gray-900">
                                        <GetUserIcon name={user.username} size={8} />
                                    </div>
                                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-gray-900 text-white text-xs px-2 py-1 rounded-md transition-opacity duration-200 whitespace-nowrap">
                                        {user.username}
                                    </div>
                                </div>
                            )
                        })
                    }

                    {
                        users.length > 5 && <div className="w-8 h-8 rounded-full ring-2 ring-gray-900 bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">+{users.length - 5}</span>
                        </div>
                    }
                </div>
                <div className="h-4 w-px bg-gray-700"></div>
                <span className="text-sm text-gray-400 flex items-center">
                    <BsCircleFill className="h-2 w-2 text-green-500 mr-2" />
                    {users.length} online
                </span>
            </div>
        </header>
    )
}

export default Header