import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [newUsername, setNewUsername] = useState(authUser?.fullName || "");
  const [error, setError] = useState(""); // Added error state

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
    };
  };

  const handleUsernameChange = (e) => {
    const username = e.target.value;
    setNewUsername(username);
    
    // Basic validation
    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters long");
    } else if (username.trim().length > 50) {
      setError("Username cannot exceed 50 characters");
    } else {
      setError(""); // Clear error when valid
    }
  };

  const handleUsernameUpdate = async () => {
    // Validate before updating
    if (error) {
      return; // Prevent update if there's an error
    }

    // Trim the username to remove leading/trailing whitespace
    const trimmedUsername = newUsername.trim();

    // Check if username is actually different
    if (trimmedUsername === authUser?.fullName) {
      setError("Please enter a different username");
      return;
    }

    // Prepare update payload
    const updatedData = {};

    // If the username has changed, add it to the payload
    updatedData.fullName = trimmedUsername;

    // If a new profile picture is selected, add it to the payload
    if (selectedImg) {
      updatedData.profilePic = selectedImg;
    } else {
      // If no new profile picture, send the existing one to avoid validation errors
      updatedData.profilePic = authUser.profilePic;
    }

    try {
      // Update profile
      await updateProfile(updatedData);
      
      // Optional: Clear any previous errors
      setError("");
    } catch (updateError) {
      // Handle any errors from the update process
      setError(updateError.message || "Failed to update profile");
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Username update section */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={handleUsernameChange}
                    className="px-4 py-2.5 bg-base-200 rounded-lg border"
                    disabled={isUpdatingProfile}
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    className="btn btn-sm bg-blue-500 text-white rounded px-4 py-2"
                    disabled={isUpdatingProfile || !newUsername.trim() || error !== ""}
                  >
                    {isUpdatingProfile ? "Updating..." : "Update"}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            </div>

            {/* Rest of the component remains the same */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;