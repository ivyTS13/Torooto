import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Star,
  Camera,
  Loader2,
  Save,
  X,
  Edit3,
  Sparkles,
} from "lucide-react";
import PageLayout from "../components/User/UserLayout"; 
import useAuthStore from "../stores/authStore";

const UserProfilePage = () => {
  const { user, updateAvatar, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", birthday: "" });
  const fileInputRef = useRef(null);

  // Sync local form with user data when entering edit mode
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, birthday: user.birthday || "" });
    }
  }, [user, isEditing]);

  const avatarUrl =
    user?.image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=6d28d9&color=fff`;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) await updateAvatar(file);
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) setIsEditing(false);
  };

  if (!user) {
    return (
      <PageLayout currentPath="/profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-purple-400" size={40} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/profile">
      <div className="w-full max-w-5xl mx-auto px-6 md:px-8 pb-16">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-indigo-300 to-purple-200 bg-clip-text text-transparent">
            Your Cosmic Profile
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mt-3 font-mono">
            {user.zodiac_sign ? `Aligned under ${user.zodiac_sign}` : "Mystic Voyager"}
          </p>
        </motion.header>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Avatar & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center shadow-2xl relative overflow-hidden group"
            >
              {/* subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

              {/* Avatar */}
              <div
                className="relative cursor-pointer mb-6"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-500/20 group-hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className={`w-full h-full object-cover ${
                      isLoading
                        ? "opacity-30"
                        : "group-hover:scale-110 transition-transform duration-700"
                    }`}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white w-8 h-8 drop-shadow-lg" />
                </div>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Loader2 className="animate-spin text-purple-400" />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-purple-50 tracking-tight">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-indigo-400 font-serif italic text-sm">
                <Star size={14} /> {user.zodiac_sign || "Unknown Sign"}
              </div>

              {/* Action Buttons */}
              <div className="w-full pt-8 mt-6 border-t border-white/5 space-y-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/40"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-medium text-gray-400 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 bg-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 text-purple-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit3 size={18} /> Edit Profile
                  </button>
                )}
              </div>
            </motion.div>

            {/* Small status card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-xl"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Profile Active
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                Your spiritual journey is protected. All data is kept private.
              </p>
            </motion.div>
          </div>

          {/* RIGHT: Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-8 space-y-6"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Editable Name */}
                <ProfileItem
                  icon={<User />}
                  label="Name"
                  isEditing={isEditing}
                  value={user.name}
                  input={
                    <input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full focus:border-purple-500 outline-none mt-1 text-white"
                    />
                  }
                />

                {/* Email */}
                <ProfileItem
                  icon={<Mail />}
                  label="Email"
                  value={user.email}
                  subValue="Used for account recovery & updates"
                />

                {/* Birthday */}
                <ProfileItem
                  icon={<Calendar />}
                  label="Birthday"
                  isEditing={isEditing}
                  value={user.birthday || "Not set"}
                  input={
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) =>
                        setFormData({ ...formData, birthday: e.target.value })
                      }
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full focus:border-purple-500 outline-none mt-1 text-white color-scheme-dark"
                    />
                  }
                />

                {/* Zodiac Sign */}
                <ProfileItem
                  icon={<Star />}
                  label="Zodiac Sign"
                  value={user.zodiac_sign || "Unknown"}
                  subValue="Calculated from your birthday"
                />
              </div>

              {/* Divider & Additional Info */}
              <div className="mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-purple-400/80">
                  <Sparkles size={16} />
                  <span className="text-sm font-medium">
                    Your Tarot Journey Awaits
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Update your profile to receive more personalized readings and
                  insights.
                </p>
              </div>
            </div>

            {/* Optional: Recent Activity Placeholder */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-lg font-semibold text-purple-200 mb-4">
                Recent Readings
              </h3>
              <div className="text-gray-500 text-sm italic">
                No readings yet. Start a new reading to see your history here.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

// Reusable Profile Item Component
const ProfileItem = ({ icon, label, value, subValue, isEditing, input }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-purple-400/60 mb-2">
      {React.cloneElement(icon, { size: 16 })}
      <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
        {label}
      </span>
    </div>
    {isEditing && input ? (
      input
    ) : (
      <div>
        <p className="text-xl font-medium text-white tracking-tight">
          {value || "—"}
        </p>
        {subValue && (
          <p className="text-[10px] text-gray-500 italic mt-1">{subValue}</p>
        )}
      </div>
    )}
  </div>
);

export default UserProfilePage;