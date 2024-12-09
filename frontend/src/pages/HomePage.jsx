import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import VideoChat from "../components/VideoChat";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            <div className="flex flex-col w-full relative">
              {!selectedUser ? (
                <NoChatSelected />
              ) : (
                <ChatContainer />
              )}

              {selectedUser && (
                <VideoChat currentUser={authUser} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
