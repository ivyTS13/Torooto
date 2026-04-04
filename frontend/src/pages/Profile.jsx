// pages/Profile.jsx
import React, { useState, useRef } from "react";
import useAuthStore from "../stores/authStore";
import { User, Mail, Calendar, Star, ShieldCheck, Camera ,Loader2} from "lucide-react";

const Profile = () => {
  const { user, updateAvatar, isLoading } = useAuthStore();
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);
  // Fallback avatar if img_url is null
  const avatarUrl =
    user?.image_url ||
    `https://ui-avatars.com/api/?name=${user?.name}&background=random`;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await updateAvatar(file);
    }
  };

  if (!user) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex flex-col items-center">
          <div
            className="relative cursor-pointer group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => fileInputRef.current.click()} // Trigger upload on click
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className={`w-32 h-32 rounded-full object-cover border-4 border-blue-500/50 transition ${isLoading ? "opacity-50" : "group-hover:opacity-75"}`}
            />
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="text-white w-8 h-8 animate-spin" />
              </div>
            ) : (
              isHovering && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="text-white w-8 h-8" />
                </div>
              )
            )}
          </div>

          <h2 className="text-xl font-semibold text-white mt-4">{user.name}</h2>
          <p className="text-blue-400 text-sm">{user.zodiac_sign}</p>

          <button
            disabled={isLoading}
            onClick={() => fileInputRef.current.click()}
            className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition text-sm disabled:opacity-50"
          >
            {isLoading ? "Uploading..." : "Edit Avatar"}
          </button>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <div className="space-y-6">
            <ProfileItem icon={<User />} label="Full Name" value={user.name} />
            <ProfileItem
              icon={<Mail />}
              label="Email Address"
              value={user.email}
            />
            <ProfileItem
              icon={<Calendar />}
              label="Birthday"
              value={user.birthday}
            />
            <ProfileItem
              icon={<Star />}
              label="Zodiac Sign"
              value={user.zodiac_sign}
            />

            <div className="pt-6 border-t border-white/10 flex gap-4">
              {user.is_active && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs border border-green-500/30">
                  Active Account
                </span>
              )}
              {user.is_superuser && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs border border-purple-500/30 flex items-center gap-1">
                  <ShieldCheck size={14} /> Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for clean layout
const ProfileItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className="text-white text-lg">{value || "N/A"}</p>
    </div>
  </div>
);

export default Profile;
