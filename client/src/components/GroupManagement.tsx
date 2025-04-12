import { useState } from "react";
import { Group, User, GroupMember } from "../interfaces";
import { FiMoreVertical, FiEdit2, FiTrash2, FiLock, FiUsers, FiSettings, FiUserPlus, FiX, FiSearch, FiChevronLeft } from "react-icons/fi";

interface GroupManagementProps {
  currentUser: User | null;
  group: Group;
  allUsers: User[];
  onEditGroup: (groupId: string, updates: Partial<Group>) => void;
  onDeleteGroup: (groupId: string) => void;
  onManageMembers: (groupId: string, action: 'add' | 'remove' | 'promote' | 'demote', userId: string) => void;
  onClose: () => void;
}

const GroupManagement = ({
  currentUser,
  group,
  allUsers,
  onEditGroup,
  onDeleteGroup,
  onManageMembers,
  onClose
}: GroupManagementProps) => {
  // State for different sections
  const [activeSection, setActiveSection] = useState<'overview' | 'members' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Function to determine user's role in the group
  const getUserRole = (userId: string): 'owner' | 'manager' | 'member' | 'none' => {
    if (group.ownerId === userId) return 'owner';
    
    if (group.memberRoles) {
      const memberRole = group.memberRoles.find(m => m.userId === userId);
      if (memberRole) return memberRole.role;
    }
    
    if (group.members.includes(userId)) return 'member';
    
    return 'none';
  };
  
  // Get current user's role
  const currentUserRole = currentUser ? getUserRole(currentUser.id) : 'none';
  
  // Check if current user can edit the group
  const canEdit = currentUserRole === 'owner' || currentUserRole === 'manager';
  
  // Handle save group info
  const handleSaveGroupInfo = () => {
    if (groupName.trim() && description.trim()) {
      onEditGroup(group.id, { 
        name: groupName,
        description: description
      });
      setIsEditing(false);
    }
  };
  
  // Handle member role change
  const handleRoleChange = (userId: string, newRole: 'manager' | 'member') => {
    if (newRole === 'manager') {
      onManageMembers(group.id, 'promote', userId);
    } else {
      onManageMembers(group.id, 'demote', userId);
    }
  };
  
  // Handle remove member
  const handleRemoveMember = (userId: string) => {
    onManageMembers(group.id, 'remove', userId);
  };
  
  // Handle add member
  const handleAddMember = (userId: string) => {
    onManageMembers(group.id, 'add', userId);
  };
  
  // Get group members with their user data
  const groupMembers = allUsers.filter(user => 
    group.members.includes(user.id)
  );
  
  // Get non-members for adding
  const nonMembers = allUsers.filter(user => 
    !group.members.includes(user.id)
  ).filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Generate random color if not present
  const getGroupColor = () => {
    if (group.avatarColor) return group.avatarColor;
    
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#c026d3'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const groupColor = getGroupColor();
  
  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white mr-3"
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-white flex-1">Group Settings</h2>
      </div>
      
      {/* Tabs */}
      <div className="flex p-2 border-b border-gray-800 bg-gray-800">
        <button
          onClick={() => setActiveSection('overview')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'overview' 
              ? 'bg-white text-black' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSection('members')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'members' 
              ? 'bg-white text-black' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Members
        </button>
        {canEdit && (
          <button
            onClick={() => setActiveSection('settings')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'settings' 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Settings
          </button>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Group Info Card */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4"
                  style={{ backgroundColor: groupColor }}
                >
                  {group.name.charAt(0).toUpperCase()}
                </div>
                
                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-500"
                        placeholder="Enter group name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-500"
                        placeholder="Describe this group"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setGroupName(group.name);
                          setDescription(group.description);
                          setIsEditing(false);
                        }}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveGroupInfo}
                        disabled={!groupName.trim() || !description.trim()}
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                    <p className="text-gray-400 text-center mb-4">{group.description}</p>
                    
                    {/* Group Attributes */}
                    <div className="w-full flex flex-wrap justify-center gap-2 mb-4">
                      <div className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs flex items-center">
                        <FiUsers className="mr-1" />
                        <span>{group.members.length} members</span>
                      </div>
                      
                      {group.hasPassword && (
                        <div className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs flex items-center">
                          <FiLock className="mr-1" />
                          <span>Password Protected</span>
                        </div>
                      )}
                      
                      {/* User Role */}
                      <div className="px-3 py-1 rounded-full bg-white text-black text-xs font-medium">
                        Your Role: {currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}
                      </div>
                    </div>
                    
                    {/* Edit Button */}
                    {canEdit && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        <span>Edit Group Info</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Group Created/Activity */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Group Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created by</span>
                    <span className="text-white">{
                      allUsers.find(user => user.id === group.ownerId)?.username || 'Unknown'
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members</span>
                    <span className="text-white">{group.members.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created on</span>
                    <span className="text-white">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Activity</span>
                    <span className="text-white">{
                      group.lastActivity 
                        ? new Date(group.lastActivity).toLocaleDateString() 
                        : 'No activity'
                    }</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Members Section */}
        {activeSection === 'members' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Members ({groupMembers.length})</h3>
              </div>
              
              <div className="divide-y divide-gray-700">
                {groupMembers.map(member => (
                  <div key={member.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3"
                        style={{ backgroundColor: member.avatarColor || '#4f46e5' }}
                      >
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{member.username}</div>
                        <div className="text-gray-400 text-sm">
                          {getUserRole(member.id) === 'owner' 
                            ? 'Group Owner' 
                            : getUserRole(member.id) === 'manager' 
                              ? 'Group Manager' 
                              : 'Member'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Member Actions */}
                    {(currentUserRole === 'owner' || (currentUserRole === 'manager' && getUserRole(member.id) === 'member')) && 
                     member.id !== currentUser?.id && (
                      <div className="flex space-x-2">
                        {/* Role Change */}
                        {currentUserRole === 'owner' && getUserRole(member.id) !== 'owner' && (
                          <select
                            value={getUserRole(member.id)}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as 'manager' | 'member')}
                            className="bg-gray-700 text-white border border-gray-600 rounded-lg text-sm py-1 px-2"
                          >
                            <option value="manager">Manager</option>
                            <option value="member">Member</option>
                          </select>
                        )}
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Add Members Section (For owners and managers) */}
            {canEdit && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-medium text-white">Add Members</h3>
                  
                  <div className="mt-2 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiSearch className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for users to add..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>
                
                <div className="max-h-56 overflow-y-auto">
                  {nonMembers.length > 0 ? (
                    <div className="divide-y divide-gray-700">
                      {nonMembers.map(user => (
                        <div key={user.id} className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
                              style={{ backgroundColor: user.avatarColor || '#4f46e5' }}
                            >
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-white">{user.username}</div>
                          </div>
                          
                          <button
                            onClick={() => handleAddMember(user.id)}
                            className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      {searchQuery ? "No users found" : "No users available to add"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Settings Section (Owner/Manager Only) */}
        {activeSection === 'settings' && canEdit && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Group Settings</h3>
                
                {/* Group Color */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Group Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#c026d3'].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${groupColor === color ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onEditGroup(group.id, { avatarColor: color })}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Password Protection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">
                      Password Protection
                    </label>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      group.hasPassword ? 'bg-white' : 'bg-gray-700'
                    }`}>
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-gray-900 transition-transform ${
                          group.hasPassword ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={group.hasPassword}
                        onChange={() => {
                          // In a real app, we would prompt for a new password or remove the password
                          onEditGroup(group.id, { hasPassword: !group.hasPassword });
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {group.hasPassword 
                      ? "This group is protected by a password" 
                      : "Anyone can join this group without a password"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Danger Zone - Delete Group */}
            {currentUserRole === 'owner' && (
              <div className="bg-gray-800 rounded-xl border border-red-900/50 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h3>
                  
                  {confirmDelete ? (
                    <div className="bg-red-900/20 p-4 rounded-lg mb-4">
                      <p className="text-white mb-3">Are you sure you want to delete this group? This action cannot be undone.</p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => onDeleteGroup(group.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Yes, Delete Group
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors flex items-center space-x-2"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      <span>Delete Group</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManagement;