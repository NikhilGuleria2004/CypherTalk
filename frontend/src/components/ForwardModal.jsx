import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';

const ForwardModal = ({ imageUrl, textMessage, videoUrl, onClose }) => {
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const { authUser } = useAuthStore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/messages/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleForward = async () => {
    if (!selectedRecipient) {
      alert("Please select a recipient");
      return;
    }

    try {
      await axiosInstance.post(`/messages/send/${selectedRecipient._id}`, {
        ...(imageUrl && { image: imageUrl }),
        ...(videoUrl && { video: videoUrl }),
        ...(textMessage && { text: textMessage }),
      });

      alert("Message forwarded successfully");
      onClose();
    } catch (error) {
      console.error("Failed to forward message:", error);
      alert(`Failed to forward message: ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Forward Message</h2>

        {imageUrl && (
          <div className="mb-4">
            <img src={imageUrl} alt="Image to forward" className="max-w-full h-auto rounded-md mb-2" />
          </div>
        )}

        {videoUrl && (
          <div className="mb-4">
            <video src={videoUrl} controls className="max-w-full h-auto rounded-md mb-2" />
          </div>
        )}

        {textMessage && (
          <div className="mb-4 p-2 bg-gray-100 rounded">
            <p>{textMessage}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Select Recipient</label>
          <select
            value={selectedRecipient?._id || ''}
            onChange={(e) => {
              const recipient = users.find((user) => user._id === e.target.value);
              setSelectedRecipient(recipient);
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a user</option>
            {users
              .filter((user) => user._id !== authUser._id)
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullName}
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={!selectedRecipient}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
