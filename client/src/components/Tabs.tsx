import { FiUsers, FiMessageSquare, FiUser } from "react-icons/fi";
import { TabsProps } from "../interfaces";

const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
  const tabs = [
    { id: 0, name: "Groups", icon: <FiUsers /> },
    { id: 1, name: "Chats", icon: <FiMessageSquare /> },
    { id: 2, name: "Profile", icon: <FiUser /> }
  ];

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      <div className="container mx-auto">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center justify-center py-3 px-6 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tabs;