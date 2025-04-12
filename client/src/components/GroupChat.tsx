import { useEffect, useRef, useState } from "react";
import { GroupChatProps, Message, User, Group } from "../interfaces";
import { FiSend, FiInfo, FiUsers, FiSettings, FiArrowLeft, FiX } from "react-icons/fi";
import MessageItem from "./MessageItem";
import MembersList from "./MembersList";

interface ExtendedGroupChatProps extends GroupChatProps {
  users: User[];
}

const GroupChat = ({ currentUser, activeGroup, messages, onSendMessage, users = [] }: ExtendedGroupChatProps) => {
  const [message, setMessage] = useState<string>("");
  const [showMembers, setShowMembers] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when group changes
  useEffect(() => {
    if (activeGroup) {
      inputRef.current?.focus();
    }
  }, [activeGroup]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activeGroup) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  // Helper to get group color
  const getGroupColor = (group: Group) => {
    if (group.avatarColor) return group.avatarColor;
    
    // Generate based on name (for consistency)
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#c026d3'];
    const colorIndex = group.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };
  
  // Get user's role in the group
  const getUserRole = (group: Group, userId: string): 'owner' | 'manager' | 'member' | 'none' => {
    if (!group || !userId) return 'none';
    
    if (group.ownerId === userId) return 'owner';
    
    if (group.memberRoles) {
      const memberRole = group.memberRoles.find(m => m.userId === userId);
      if (memberRole) return memberRole.role;
    }
    
    if (group.members.includes(userId)) return 'member';
    
    return 'none';
  };

  // If no active group is selected
  if (!activeGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gray-800 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FiInfo className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No group selected</h2>
          <p className="text-gray-400 mb-6">
            Select a group from the Groups tab or create a new one to start chatting.
          </p>
        </div>
      </div>
    );
  }
  
  const currentUserRole = currentUser ? getUserRole(activeGroup, currentUser.id) : 'none';
  const isOwnerOrManager = currentUserRole === 'owner' || currentUserRole === 'manager';
  const groupColor = getGroupColor(activeGroup);

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Group Info */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3"
              style={{ backgroundColor: groupColor }}
            >
              {activeGroup.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{activeGroup.name}</h2>
              <p className="text-sm text-gray-400 truncate max-w-[160px] sm:max-w-[240px]">
                {activeGroup.description || "No description"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowMembers(!showMembers)}
              className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title={showMembers ? "Hide members" : "Show members"}
            >
              {showMembers ? <FiX className="h-5 w-5" /> : <FiUsers className="h-5 w-5" />}
            </button>
            {isOwnerOrManager && (
              <button 
                className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Group settings"
              >
                <FiSettings className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main chat area */}
        <div className={`flex-1 flex flex-col ${showMembers ? 'hidden md:flex' : ''}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center p-4">
                  <div className="bg-gray-800 p-4 rounded-lg inline-block mb-4">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-3"
                      style={{ backgroundColor: groupColor }}
                    >
                      {activeGroup.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-white">{activeGroup.name}</h3>
                    <p className="text-gray-400 mt-1">{activeGroup.description}</p>
                  </div>
                  <p className="text-gray-500">No messages yet. Be the first to send a message!</p>
                </div>
              ) : (
                messages.map((msg: Message, index: number) => (
                  <MessageItem 
                    key={msg.id || index} 
                    message={msg} 
                    isCurrentUser={msg.user.id === currentUser?.id} 
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-gray-500 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-3 p-2 text-black bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-200"
                  title="Send message"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Members panel */}
        {showMembers && (
          <div className="w-full md:w-80 border-l border-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Group Members</h3>
              <button 
                onClick={() => setShowMembers(false)}
                className="md:hidden p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <MembersList
              activeGroup={activeGroup}
              users={users}
              currentUser={currentUser}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;