import { Group, User } from "../interfaces";
import { FiUserPlus, FiUserX, FiChevronUp, FiChevronDown, FiStar, FiShield } from "react-icons/fi";

interface MembersListProps {
  activeGroup: Group | null;
  users: User[];
  currentUser: User | null;
}

const MembersList = ({ activeGroup, users, currentUser }: MembersListProps) => {
  if (!activeGroup) {
    return null;
  }

  // Function to determine if the current user is the owner or a manager
  const isOwnerOrManager = () => {
    if (!activeGroup || !currentUser) return false;
    
    // Check if owner
    if (activeGroup.ownerId === currentUser.id) return true;
    
    // Check if manager
    if (activeGroup.memberRoles) {
      return activeGroup.memberRoles.some(
        member => member.userId === currentUser.id && member.role === 'manager'
      );
    }
    
    return false;
  };
  
  // Get user's role in the group
  const getUserRole = (userId: string): 'owner' | 'manager' | 'member' | 'none' => {
    if (activeGroup.ownerId === userId) return 'owner';
    
    if (activeGroup.memberRoles) {
      const memberRole = activeGroup.memberRoles.find(m => m.userId === userId);
      if (memberRole) return memberRole.role;
    }
    
    if (activeGroup.members.includes(userId)) return 'member';
    
    return 'none';
  };
  
  // Get members with their full user data
  const members = users.filter(user => 
    activeGroup.members.includes(user.id)
  );
  
  // Sort members by role: owner first, then managers, then regular members
  const sortedMembers = [...members].sort((a, b) => {
    const roleA = getUserRole(a.id);
    const roleB = getUserRole(b.id);
    
    // Custom sort order
    const roleOrder: Record<string, number> = {
      'owner': 0,
      'manager': 1,
      'member': 2,
      'none': 3
    };
    
    return roleOrder[roleA] - roleOrder[roleB];
  });

  return (
    <div className="p-4 border-t border-gray-800">
      <h3 className="text-lg font-medium text-white mb-4">Members ({members.length})</h3>
      
      <div className="space-y-3">
        {sortedMembers.map(member => (
          <MemberCard 
            key={member.id} 
            member={member} 
            isCurrentUser={member.id === currentUser?.id}
            isOwner={getUserRole(member.id) === 'owner'}
          />
        ))}
      </div>
    </div>
  );
};

interface MemberCardProps {
  member: User;
  isCurrentUser: boolean;
  isOwner: boolean;
}

const MemberCard = ({ member, isCurrentUser, isOwner }: MemberCardProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
          style={{ backgroundColor: member.avatarColor || '#4f46e5' }}
        >
          {member.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center">
            <span className="text-white font-medium">
              {member.username}
              {isCurrentUser && <span className="text-gray-400 ml-1">(You)</span>}
            </span>
            {isOwner && (
              <span className="ml-2 flex items-center text-yellow-500">
                <FiStar className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          {member.email && (
            <div className="text-gray-400 text-xs">{member.email}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersList;