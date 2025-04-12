export interface User {
    id: string;
    username: string;
    email?: string;
    password?: string; // Note: This should not be returned to the client in a real app
    avatarColor?: string;
}

export interface GroupMember {
    userId: string;
    role: 'owner' | 'manager' | 'member';
}

export interface Group {
    id: string;
    name: string;
    description: string;
    hasPassword: boolean;
    members: string[]; // Array of user IDs (for backward compatibility)
    memberRoles?: GroupMember[]; // Array of members with roles
    ownerId: string; // For backward compatibility
    avatarColor?: string;
    lastActivity?: Date;
}

export interface Message {
    id?: string;
    user: User;
    groupId: string;
    content: string;
    timestamp: Date;
}

export interface LoginProps {
    onLogin: (userData: {username: string; email: string; password: string}) => void;
}

export interface ChatProps {
    currentUser: User | null;
    onLogout: () => void;
}

export interface HeaderProps {
    currentUser: User | null;
    onLogout: () => void;
    activeTab: number;
    setActiveTab: (index: number) => void;
}

export interface SidebarProps {
    currentUser: User | null;
    groups: Group[];
    activeGroup: Group | null;
    onSelectGroup: (group: Group) => void;
    onCreateGroup: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export interface MessageProps {
    message: Message;
    isCurrentUser: boolean;
}

export interface TabsProps {
    activeTab: number;
    setActiveTab: (index: number) => void;
}

export interface GroupListProps {
    groups: Group[];
    currentUser: User | null;
    activeGroup: Group | null;
    onSelectGroup: (group: Group) => void;
    onCreateGroup: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export interface GroupChatProps {
    currentUser: User | null;
    activeGroup: Group | null;
    messages: Message[];
    onSendMessage: (content: string) => void;
}

export interface MembersListProps {
    activeGroup: Group | null;
    users: User[];
    currentUser: User | null;
}

export interface JoinGroupModalProps {
    group: Group;
    isOpen: boolean;
    onClose: () => void;
    onJoin: (password: string) => void;
    error: string | null;
}

export interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string, password: string, hasPassword: boolean) => void;
}