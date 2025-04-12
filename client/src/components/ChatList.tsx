import { useState } from "react";
import { Group, Message, User, GroupMember } from "../interfaces";
import { 
  FiUsers, FiMessageCircle, FiSearch, FiMoreVertical, 
  FiFilter, FiPlus, FiSettings, FiHash, FiKey 
} from "react-icons/fi";
import GroupManagement from "./GroupManagement";

interface ChatListProps {
  groups: Group[];
  currentUser: User | null;
  activeGroup: Group | null;
  messages: { [groupId: string]: Message[] };
  unreadCounts: { [groupId: string]: number };
  onSelectGroup: (group: Group) => void;
  onEditGroup?: (groupId: string, updates: Partial<Group>) => void;
  onDeleteGroup?: (groupId: string) => void;
  onManageMember?: (groupId: string, action: 'add' | 'remove' | 'promote' | 'demote', userId: string) => void;
  onOpenJoinById?: () => void;
  allUsers?: User[];
}

const ChatList = ({ 
  groups, 
  currentUser, 
  activeGroup,
  messages,
  unreadCounts, 
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
  onManageMember,
  onOpenJoinById,
  allUsers = []
}: ChatListProps) => {
  // State
  const [filter, setFilter] = useState<'all' | 'unread' | 'latest'>('all');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [managedGroup, setManagedGroup] = useState<Group | null>(null);
  
  // Filter only joined groups
  const joinedGroups = groups.filter(group => 
    currentUser && group.members.includes(currentUser.id)
  );

  // Helper to get latest message for a group
  const getLatestMessage = (groupId: string): Message | null => {
    const groupMessages = messages[groupId] || [];
    if (groupMessages.length > 0) {
      return groupMessages[groupMessages.length - 1];
    }
    return null;
  };

  // Helper to format time
  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const diff = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  // Group avatar color generator
  const getGroupColor = (group: Group) => {
    if (group.avatarColor) return group.avatarColor;
    
    // Generate based on name (for consistency)
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#c026d3'];
    const colorIndex = group.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };
  
  // Function to determine user's role in a group
  const getUserRole = (group: Group, userId: string): 'owner' | 'manager' | 'member' | 'none' => {
    if (group.ownerId === userId) return 'owner';
    
    if (group.memberRoles) {
      const memberRole = group.memberRoles.find(m => m.userId === userId);
      if (memberRole) return memberRole.role;
    }
    
    if (group.members.includes(userId)) return 'member';
    
    return 'none';
  };

  // Filter and sort groups
  let filteredGroups = [...joinedGroups];
  
  // Apply search filter
  if (searchQuery) {
    filteredGroups = filteredGroups.filter(group => 
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply type filter
  if (filter === 'unread') {
    filteredGroups = filteredGroups.filter(group => (unreadCounts[group.id] || 0) > 0);
  }
  
  // Sort groups by latest message time
  filteredGroups.sort((a, b) => {
    if (filter === 'latest') {
      // For latest filter, sort by most recent first regardless of unread status
      const messageA = getLatestMessage(a.id);
      const messageB = getLatestMessage(b.id);
      
      if (!messageA && !messageB) return 0;
      if (!messageA) return 1;
      if (!messageB) return -1;
      
      return new Date(messageB.timestamp).getTime() - new Date(messageA.timestamp).getTime();
    } else {
      // Default sorting: unread first, then by most recent message
      const unreadA = unreadCounts[a.id] || 0;
      const unreadB = unreadCounts[b.id] || 0;
      
      // First sort by unread status
      if (unreadA > 0 && unreadB === 0) return -1;
      if (unreadA === 0 && unreadB > 0) return 1;
      
      // Then by recency
      const messageA = getLatestMessage(a.id);
      const messageB = getLatestMessage(b.id);
      
      if (!messageA && !messageB) return 0;
      if (!messageA) return 1;
      if (!messageB) return -1;
      
      return new Date(messageB.timestamp).getTime() - new Date(messageA.timestamp).getTime();
    }
  });
  
  // Handle group actions if management capabilities are provided
  const handleGroupAction = (group: Group) => {
    if (onEditGroup && onDeleteGroup && onManageMember) {
      setManagedGroup(group);
    } else {
      // If management functions not provided, just select the group
      onSelectGroup(group);
    }
  };
  
  // Show group management UI
  if (managedGroup) {
    return (
      <GroupManagement
        currentUser={currentUser}
        group={managedGroup}
        allUsers={allUsers}
        onEditGroup={onEditGroup || (() => {})}
        onDeleteGroup={onDeleteGroup || (() => {})}
        onManageMembers={onManageMember || (() => {})}
        onClose={() => setManagedGroup(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <div className="flex space-x-2">
            {onOpenJoinById && (
              <button 
                onClick={onOpenJoinById}
                className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                title="Join by ID"
              >
                <FiHash className="h-5 w-5" />
              </button>
            )}
            <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white">
              <FiFilter className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white">
              <FiPlus className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <FiSearch className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in chats..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 placeholder:text-gray-500"
          />
        </div>
        
        {/* Filters */}
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'all' ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700 transition-colors'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'unread' ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700 transition-colors'
            }`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'latest' ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700 transition-colors'
            }`}
            onClick={() => setFilter('latest')}
          >
            Latest
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-gray-800 p-3 rounded-full mb-3">
              <FiMessageCircle className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">
              {searchQuery 
                ? "No chats match your search" 
                : filter === 'unread'
                  ? "No unread messages"
                  : "No chats yet"}
            </h3>
            <p className="text-gray-400 text-sm">
              {searchQuery
                ? "Try a different search term"
                : filter === 'unread'
                  ? "All caught up! Check back later"
                  : "Join a group from the Groups tab to start chatting"}
            </p>
          </div>
        ) : (
          <div>
            {filteredGroups.map(group => {
              const latestMessage = getLatestMessage(group.id);
              const unreadCount = unreadCounts[group.id] || 0;
              const userRole = currentUser ? getUserRole(group, currentUser.id) : 'none';
              const groupColor = getGroupColor(group);
              
              return (
                <div
                  key={group.id}
                  className={`p-3 border-b border-gray-800 hover:bg-gray-800 transition-all ${
                    activeGroup?.id === group.id
                      ? "bg-gray-800"
                      : "bg-gray-900"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Group Avatar */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
                      style={{ backgroundColor: groupColor }}
                      onClick={() => onSelectGroup(group)}
                    >
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Group Info */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectGroup(group)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">{group.name}</h3>
                        {latestMessage && (
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatMessageTime(latestMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${unreadCount > 0 ? "text-white font-medium" : "text-gray-400"}`}>
                          {latestMessage ? (
                            <>
                              <span className="mr-1">
                                {latestMessage.user.id === currentUser?.id ? 'You:' : `${latestMessage.user.username}:`}
                              </span>
                              {latestMessage.content}
                            </>
                          ) : (
                            "No messages yet"
                          )}
                        </p>
                        
                        {unreadCount > 0 && (
                          <div className="flex-shrink-0 ml-2 bg-white text-black rounded-full h-5 min-w-5 flex items-center justify-center text-xs font-medium px-1">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {(userRole === 'owner' || userRole === 'manager') && onEditGroup && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupAction(group);
                        }}
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        <FiSettings className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;