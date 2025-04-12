import { useEffect, useState } from "react";
import { Group, Message, User } from "./interfaces";
import { socket, socketEvents } from "./services/socket";
import Login from "./components/Login";
import { v4 as uuidv4 } from "uuid";
import Header from "./components/Header";
import GroupList from "./components/GroupList";
import GroupChat from "./components/GroupChat";
import Profile from "./components/Profile";
import ChatList from "./components/ChatList";
import CreateGroupModal from "./components/CreateGroupModal";
import JoinGroupModal from "./components/JoinGroupModal";
import JoinGroupByIdModal from "./components/JoinGroupByIdModal";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { ThemeProvider } from "./hooks/use-theme";
import { FiWifiOff, FiMessageCircle } from "react-icons/fi";

function App() {
  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Group state
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [allMessages, setAllMessages] = useState<{ [groupId: string]: Message[] }>({});
  const [unreadCounts, setUnreadCounts] = useState<{ [groupId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // UI state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState<boolean>(false);
  const [joinGroupModalOpen, setJoinGroupModalOpen] = useState<boolean>(false);
  const [joinByIdModalOpen, setJoinByIdModalOpen] = useState<boolean>(false); 
  const [joinGroupError, setJoinGroupError] = useState<string | null>(null);
  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState<Group | null>(null);

  // Connection monitoring
  useEffect(() => {
    const onConnect = () => {
      console.log("Socket connected!");
      setIsConnected(true);
      
      // Reconnect as the current user if we were logged in
      if (currentUser) {
        socket.emit(socketEvents.JOIN, currentUser.username);
      }
    };

    const onDisconnect = () => {
      console.log("Socket disconnected!");
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    
    // If socket is already connected
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [currentUser]);

  // Socket event handlers for users
  useEffect(() => {
    const handleUserList = (userList: User[]) => {
      setUsers(userList);
    };

    const handleUserJoined = (user: User) => {
      setUsers(prevUsers => {
        if (prevUsers.find(u => u.id === user.id)) {
          return prevUsers;
        }
        return [...prevUsers, user];
      });
    };

    const handleUserLeft = (userId: string) => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    };

    socket.on(socketEvents.USER_LIST, handleUserList);
    socket.on(socketEvents.USER_JOINED, handleUserJoined);
    socket.on(socketEvents.USER_LEFT, handleUserLeft);

    return () => {
      socket.off(socketEvents.USER_LIST, handleUserList);
      socket.off(socketEvents.USER_JOINED, handleUserJoined);
      socket.off(socketEvents.USER_LEFT, handleUserLeft);
    };
  }, []);

  // Socket event handlers for groups
  useEffect(() => {
    const handleGroupList = (groupList: Group[]) => {
      setGroups(groupList);
    };

    const handleNewGroup = (group: Group) => {
      setGroups(prevGroups => [...prevGroups, group]);
    };

    const handleGroupUpdate = (updatedGroup: Group) => {
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === updatedGroup.id ? updatedGroup : group
        )
      );
      
      // Update active group if it's the one that was updated
      if (activeGroup && activeGroup.id === updatedGroup.id) {
        setActiveGroup(updatedGroup);
      }
    };

    socket.on(socketEvents.GROUP_LIST, handleGroupList);
    socket.on('newGroup', handleNewGroup);
    socket.on('groupUpdate', handleGroupUpdate);

    return () => {
      socket.off(socketEvents.GROUP_LIST, handleGroupList);
      socket.off('newGroup', handleNewGroup);
      socket.off('groupUpdate', handleGroupUpdate);
    };
  }, [activeGroup]);

  // Socket event handlers for messages
  useEffect(() => {
    const handleMessageHistory = (groupId: string, history: Message[]) => {
      setAllMessages(prev => ({
        ...prev,
        [groupId]: history
      }));
      
      // Clear unread count when viewing message history
      if (activeGroup && activeGroup.id === groupId) {
        setUnreadCounts(prev => ({
          ...prev,
          [groupId]: 0
        }));
      }
    };

    const handleNewMessage = (message: Message) => {
      // Add message to the appropriate group's message list
      setAllMessages(prev => {
        const groupMessages = prev[message.groupId] || [];
        return {
          ...prev,
          [message.groupId]: [...groupMessages, message]
        };
      });
      
      // Update unread count if not viewing this group
      if (!activeGroup || activeGroup.id !== message.groupId) {
        // Don't count your own messages as unread
        if (message.user.id !== currentUser?.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [message.groupId]: (prev[message.groupId] || 0) + 1
          }));
        }
      }
    };

    socket.on(socketEvents.MESSAGE_HISTORY, handleMessageHistory);
    socket.on(socketEvents.NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(socketEvents.MESSAGE_HISTORY, handleMessageHistory);
      socket.off(socketEvents.NEW_MESSAGE, handleNewMessage);
    };
  }, [activeGroup, currentUser]);

  // Handle login
  const handleLogin = (userData: {username: string; email: string; password: string}) => {
    // Generate a random avatar color
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#c026d3'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newUser: User = {
      id: socket.id || `temp-${uuidv4()}`,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      avatarColor: randomColor
    };
    
    setCurrentUser(newUser);
    socket.emit(socketEvents.JOIN, userData.username);
    
    // Request the initial group list
    socket.emit(socketEvents.GROUP_LIST);
  };

  // Handle profile update
  const handleUpdateProfile = (userData: {username?: string; email?: string; password?: string}) => {
    if (!currentUser) return;
    
    const updatedUser: User = {
      ...currentUser,
      ...userData
    };
    
    setCurrentUser(updatedUser);
    socket.emit('updateProfile', updatedUser);
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    try {
      // Send DELETE request to delete user account
      await fetch('/api/user', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // If successful, logout the user
      handleLogout();
    } catch (error) {
      console.error('Error deleting account:', error);
      // Show error in a toast or notification (not implemented in this example)
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (currentUser) {
      socket.emit(socketEvents.USER_LEFT, currentUser.id);
      setCurrentUser(null);
      setActiveGroup(null);
      setGroups([]);
      setAllMessages({});
      setUnreadCounts({});
    }
  };

  // Group related functions
  const handleSelectGroup = (group: Group) => {
    // If group requires password and user is not a member, show join modal
    if (group.hasPassword && !group.members.includes(currentUser?.id || '')) {
      setSelectedGroupToJoin(group);
      setJoinGroupModalOpen(true);
      return;
    }
    
    setActiveGroup(group);
    socket.emit(socketEvents.JOIN_GROUP, group.id);
    socket.emit(socketEvents.MESSAGE_HISTORY, group.id);
    
    // Reset unread count
    setUnreadCounts(prev => ({
      ...prev,
      [group.id]: 0
    }));
    
    // Switch to chat tab
    setActiveTab(1);
  };
  
  // Group management functions
  const handleEditGroup = (groupId: string, updates: Partial<Group>) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !currentUser) return;
    
    // Check if user has permission (owner or manager)
    const isOwner = group.ownerId === currentUser.id;
    const isManager = group.memberRoles?.some(
      member => member.userId === currentUser.id && member.role === 'manager'
    );
    
    if (!isOwner && !isManager) return;
    
    // Send update to server
    socket.emit('updateGroup', { groupId, updates });
  };
  
  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !currentUser) return;
    
    // Only owner can delete
    if (group.ownerId !== currentUser.id) return;
    
    // Send delete to server
    socket.emit('deleteGroup', groupId);
    
    // If the deleted group was active, reset active group
    if (activeGroup?.id === groupId) {
      setActiveGroup(null);
    }
  };
  
  const handleManageGroupMember = (
    groupId: string, 
    action: 'add' | 'remove' | 'promote' | 'demote', 
    userId: string
  ) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !currentUser) return;
    
    // Check permissions based on action
    const isOwner = group.ownerId === currentUser.id;
    const isManager = group.memberRoles?.some(
      member => member.userId === currentUser.id && member.role === 'manager'
    );
    
    // Owner can do anything, manager can only add/remove regular members
    if (!isOwner && !isManager) return;
    if (!isOwner && (action === 'promote' || action === 'demote')) return;
    
    // Send action to server
    socket.emit('manageGroupMember', { groupId, action, userId });
  };

  const handleCreateGroup = () => {
    setCreateGroupModalOpen(true);
  };

  const handleSubmitCreateGroup = (name: string, description: string, password: string, hasPassword: boolean) => {
    if (!currentUser) return;
    
    const newGroup: Omit<Group, 'id'> = {
      name,
      description,
      hasPassword,
      members: [currentUser.id],
      ownerId: currentUser.id
    };
    
    socket.emit(socketEvents.CREATE_GROUP, { ...newGroup, password });
    setCreateGroupModalOpen(false);
  };

  const handleJoinGroup = (password: string) => {
    if (!currentUser || !selectedGroupToJoin) return;
    
    setJoinGroupError(null);
    
    socket.emit(socketEvents.JOIN_GROUP, {
      groupId: selectedGroupToJoin.id,
      password
    });
    
    // Listen for response
    const handleJoinResponse = (response: { success: boolean; error?: string; group?: Group }) => {
      if (response.success && response.group) {
        setActiveGroup(response.group);
        setJoinGroupModalOpen(false);
        setSelectedGroupToJoin(null);
        // Switch to chat tab
        setActiveTab(1);
      } else if (!response.success) {
        setJoinGroupError(response.error || "Failed to join group");
      }
    };
    
    socket.once('joinGroupResponse', handleJoinResponse);
  };
  
  // Handle joining a group directly by ID
  const handleJoinGroupById = (groupId: string, password: string) => {
    if (!currentUser) return;
    
    setJoinGroupError(null);
    
    socket.emit(socketEvents.JOIN_GROUP, {
      groupId,
      password
    });
    
    // Listen for response
    const handleJoinResponse = (response: { success: boolean; error?: string; group?: Group }) => {
      if (response.success && response.group) {
        setActiveGroup(response.group);
        setJoinByIdModalOpen(false);
        // Switch to chat tab
        setActiveTab(1);
      } else if (!response.success) {
        setJoinGroupError(response.error || "Failed to join group with provided ID");
      }
    };
    
    socket.once('joinGroupResponse', handleJoinResponse);
  };

  const handleSendMessage = (content: string) => {
    if (!currentUser || !activeGroup) return;
    
    const newMessage: Omit<Message, 'id' | 'timestamp'> = {
      user: currentUser,
      groupId: activeGroup.id,
      content
    };
    
    socket.emit(socketEvents.SEND_MESSAGE, newMessage);
  };

  // Filter groups based on search query
  const filteredGroups = searchQuery
    ? groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups;

  // Get current group messages
  const currentGroupMessages = activeGroup ? (allMessages[activeGroup.id] || []) : [];

  // Disconnection screen
  if (!isConnected && currentUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="bg-gray-800 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center">
            <FiWifiOff className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Connection lost</h1>
          <p className="text-gray-400">Attempting to reconnect to chat server...</p>
          <div className="mt-4 flex justify-center">
            <div className="typing-dot w-2 h-2 rounded-full bg-white"></div>
            <div className="typing-dot w-2 h-2 rounded-full bg-white mx-2"></div>
            <div className="typing-dot w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider user={currentUser}>
      {currentUser ? (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <Header 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            <ThemeSwitcher className="ml-2" />
          </Header>
          
          {/* Main Content */}
          <main className="flex-1 flex overflow-hidden">
            {/* Tab Content */}
            <div className="flex-1 flex flex-col">
              {/* Tab 0: Group List */}
              {activeTab === 0 && (
                <GroupList 
                  groups={filteredGroups}
                  currentUser={currentUser}
                  activeGroup={activeGroup}
                  onSelectGroup={handleSelectGroup}
                  onCreateGroup={handleCreateGroup}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}
              
              {/* Tab 1: Chat List & Group Chat */}
              {activeTab === 1 && (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  {/* Chat List - Show on mobile when no active group, show on desktop always */}
                  <div className={`${activeGroup ? 'hidden md:block md:w-1/3' : 'w-full'} border-r border-gray-800`}>
                    <ChatList 
                      groups={groups}
                      currentUser={currentUser}
                      activeGroup={activeGroup}
                      messages={allMessages}
                      unreadCounts={unreadCounts}
                      onSelectGroup={handleSelectGroup}
                      onEditGroup={handleEditGroup}
                      onDeleteGroup={handleDeleteGroup}
                      onManageMember={handleManageGroupMember}
                      onOpenJoinById={() => setJoinByIdModalOpen(true)}
                      allUsers={users}
                    />
                  </div>
                  
                  {/* Group Chat - Show when a group is selected */}
                  {activeGroup && (
                    <div className="flex-1">
                      <GroupChat
                        currentUser={currentUser}
                        activeGroup={activeGroup}
                        messages={currentGroupMessages}
                        onSendMessage={handleSendMessage}
                      />
                    </div>
                  )}
                  
                  {/* Empty state - Only show on desktop when no active group */}
                  {!activeGroup && (
                    <div className="flex-1 hidden md:flex items-center justify-center bg-gray-900">
                      <div className="text-center p-4">
                        <div className="bg-gray-800 p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                          <FiMessageCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No chat selected</h3>
                        <p className="text-gray-400 max-w-md">
                          Select a chat from the list or join a new group to start messaging
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Tab 2: Profile */}
              {activeTab === 2 && (
                <Profile
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onUpdateProfile={handleUpdateProfile}
                  onDeleteAccount={handleDeleteAccount}
                />
              )}
            </div>
          </main>
          
          {/* Modals */}
          {createGroupModalOpen && (
            <CreateGroupModal
              isOpen={createGroupModalOpen}
              onClose={() => setCreateGroupModalOpen(false)}
              onCreate={handleSubmitCreateGroup}
            />
          )}
          
          {joinGroupModalOpen && selectedGroupToJoin && (
            <JoinGroupModal
              group={selectedGroupToJoin}
              isOpen={joinGroupModalOpen}
              onClose={() => {
                setJoinGroupModalOpen(false);
                setSelectedGroupToJoin(null);
                setJoinGroupError(null);
              }}
              onJoin={handleJoinGroup}
              error={joinGroupError}
            />
          )}
          
          {joinByIdModalOpen && (
            <JoinGroupByIdModal
              isOpen={joinByIdModalOpen}
              onClose={() => {
                setJoinByIdModalOpen(false);
                setJoinGroupError(null);
              }}
              onJoin={handleJoinGroupById}
              error={joinGroupError}
            />
          )}
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}

export default App;