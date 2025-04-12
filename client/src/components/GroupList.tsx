import { Group, GroupListProps } from "../interfaces";
import { FiSearch, FiPlus, FiLock, FiUnlock, FiUsers } from "react-icons/fi";

const GroupList = ({
  groups,
  currentUser,
  activeGroup,
  onSelectGroup,
  onCreateGroup,
  searchQuery,
  setSearchQuery
}: GroupListProps) => {
  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      {/* Search and Create Group */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-gray-600 transition-all placeholder:text-gray-500 text-sm"
            />
          </div>
          <button
            onClick={onCreateGroup}
            className="px-3 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
          >
            <FiPlus className="h-4 w-4" />
            <span className="text-sm font-medium">New</span>
          </button>
        </div>
      </div>

      {/* Group List */}
      <div className="flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-gray-800 p-3 rounded-full mb-3">
              <FiUsers className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No groups yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create a new group to get started</p>
            <button
              onClick={onCreateGroup}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <FiPlus className="h-4 w-4" />
              <span>Create Group</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                isActive={activeGroup?.id === group.id}
                isMember={group.members.includes(currentUser?.id || '')}
                onClick={() => onSelectGroup(group)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface GroupCardProps {
  group: Group;
  isActive: boolean;
  isMember: boolean;
  onClick: () => void;
}

const GroupCard = ({ group, isActive, isMember, onClick }: GroupCardProps) => {
  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all user-card ${
        isActive
          ? "bg-white text-black"
          : "bg-gray-800 text-white hover:bg-gray-700"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? "bg-black text-white" : "bg-gray-700 text-gray-300"}`}>
            <FiUsers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">{group.name}</h3>
            <p className={`text-sm truncate max-w-[180px] ${isActive ? "text-gray-700" : "text-gray-400"}`}>
              {group.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          {group.hasPassword && (
            <div className={`p-1 rounded-full ${isActive ? "bg-gray-200 text-black" : "bg-gray-700 text-gray-300"}`} title={isMember ? "Password protected but you're a member" : "Password protected"}>
              {isMember ? <FiUnlock className="h-3 w-3" /> : <FiLock className="h-3 w-3" />}
            </div>
          )}
          <div className={`flex items-center space-x-1 text-xs ${isActive ? "text-gray-700" : "text-gray-400"}`}>
            <FiUsers className="h-3 w-3" />
            <span>{group.members.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupList;