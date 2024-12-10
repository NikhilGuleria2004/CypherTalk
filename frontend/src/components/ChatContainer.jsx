import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ForwardModal from "./ForwardModal";
import { axiosInstance } from "../lib/axios";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [imageToForward, setImageToForward] = useState(null);
  const [messageToForward, setMessageToForward] = useState(null);
  const [videoToForward, setVideoToForward] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageDownload = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch the file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = url.split("/").pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading the file: ", error);
    }
  };

  const handleForwardImage = (imageUrl) => {
    setImageToForward(imageUrl);
    setMessageToForward(null);
    setVideoToForward(null);
  };

  const handleForwardMessage = (messageText) => {
    setMessageToForward(messageText);
    setImageToForward(null);
    setVideoToForward(null);
  };

  const handleForwardVideo = (videoUrl) => {
    setVideoToForward(videoUrl);
    setImageToForward(null);
    setMessageToForward(null);
  };

  const closeForwardModal = () => {
    setImageToForward(null);
    setMessageToForward(null);
    setVideoToForward(null);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await axiosInstance.delete(`/messages/${messageId}`);
      console.log("Delete response:", response);

      useChatStore.setState((state) => ({
        messages: state.messages.filter((message) => message._id !== messageId),
      }));
    } catch (error) {
      console.error("Error deleting message:", error);

      if (error.response) {
        alert(`Failed to delete the message: ${error.response.data.message || "Unknown error"}`);
      } else if (error.request) {
        alert("No response from server. Check your network connection.");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <div>
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleImageDownload(message.image)}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-600 transition-all duration-300 ease-in-out"
                    >
                      Download
                    </button>
                    {message.senderId === authUser._id && (
                      <button
                        onClick={() => handleForwardImage(message.image)}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-600 transition-all duration-300 ease-in-out"
                      >
                        Forward
                      </button>
                    )}
                  </div>
                </div>
              )}
              {message.text && (
                <div>
                  <p>{message.text}</p>
                  <div className="flex gap-2 mt-2">
                    {message.senderId === authUser._id && (
                      <button
                        onClick={() => handleForwardMessage(message.text)}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-600 transition-all duration-300 ease-in-out"
                      >
                        Forward
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(message._id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-red-600 transition-all duration-300 ease-in-out"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              {message.video && (
                <div>
                  <video
                    src={message.video}
                    controls
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleImageDownload(message.video)}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-600 transition-all duration-300 ease-in-out"
                    >
                      Download
                    </button>
                    {message.senderId === authUser._id && (
                      <button
                        onClick={() => handleForwardVideo(message.video)}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-600 transition-all duration-300 ease-in-out"
                      >
                        Forward
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
      {(imageToForward || messageToForward || videoToForward) && (
        <ForwardModal
          imageUrl={imageToForward}
          textMessage={messageToForward}
          videoUrl={videoToForward}
          onClose={closeForwardModal}
        />
      )}
    </div>
  );
};

export default ChatContainer;
