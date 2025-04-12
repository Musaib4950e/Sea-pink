import { NotificationProps } from "../../interfaces"
import { FiUserCheck, FiUserMinus, FiMessageCircle } from "react-icons/fi"

const Notification = ({ text, type }: NotificationProps) => {
    
    const getNotificationStyles = () => {
        switch (type) {
            case "join":
                return {
                    bgColor: "bg-green-500",
                    textColor: "text-white",
                    icon: <FiUserCheck className="h-4 w-4 text-white" />
                }
            case "leave":
                return {
                    bgColor: "bg-yellow-500",
                    textColor: "text-white",
                    icon: <FiUserMinus className="h-4 w-4 text-white" />
                }
            case "message":
                return {
                    bgColor: "bg-white",
                    textColor: "text-black",
                    icon: <FiMessageCircle className="h-4 w-4 text-black" />
                }
        }
    }

    const { bgColor, textColor, icon } = getNotificationStyles()

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center notification-container pointer-events-none">
            <div className={`${bgColor} px-4 py-2 rounded-lg shadow-lg mt-4 max-w-md flex items-center space-x-2`}>
                <div className="bg-black bg-opacity-20 rounded-full p-1">
                    {icon}
                </div>
                <p className={`${textColor} text-sm font-medium`}>{text}</p>
            </div>
        </div>
    )
}

export default Notification