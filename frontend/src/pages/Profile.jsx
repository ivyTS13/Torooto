import React, { useState, useRef, useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { User, Mail, Calendar, Star, ShieldCheck, Camera, Loader2, Save, X, Edit3 } from "lucide-react";

const Profile = () => {
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

  const avatarUrl = user?.image_url || `https://ui-avatars.com/api/?name=${user?.name}&background=6d28d9&color=fff`;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) await updateAvatar(file);
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) setIsEditing(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-500" size={40} />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <header className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 to-indigo-400 bg-clip-text text-transparent">
          Disciple's Records
        </h1>
        <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mt-2 font-mono">Vault Identification: {user.id?.split('-')[0]}</p>
      </header>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
            
            <div 
              className="relative cursor-pointer mb-6"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-500/20 group-hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <img src={avatarUrl} alt="Avatar" className={`w-full h-full object-cover ${isLoading ? "opacity-30" : "group-hover:scale-110 transition-transform duration-700"}`} />
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

            <h2 className="text-2xl font-bold text-purple-50 tracking-tight">{user.name}</h2>
            <div className="flex items-center gap-2 mt-2 text-indigo-400 font-serif italic text-sm">
              <Star size={14} /> {user.zodiac_sign}
            </div>

            <div className="w-full pt-8 mt-6 border-t border-white/5 space-y-3">
              {isEditing ? (
                <>
                  <button onClick={handleSave} disabled={isLoading} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/40">
                    <Save size={18} /> Save Changes
                  </button>
                  <button onClick={() => setIsEditing(false)} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-medium text-gray-400 transition-all">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 text-purple-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                  <Edit3 size={18} /> Update Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Detail Scrolls */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              <ProfileItem 
                icon={<User />} 
                label="Mortal Name" 
                isEditing={isEditing}
                value={user.name}
                input={<input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full focus:border-purple-500 outline-none mt-1" />}
              />

              <ProfileItem 
                icon={<Mail />} 
                label="Spirit Tether (Email)" 
                value={user.email} 
                subValue="Cannot be changed"
              />

              <ProfileItem 
                icon={<Calendar />} 
                label="Ascension Date (Birthday)" 
                isEditing={isEditing}
                value={user.birthday}
                input={<input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full focus:border-purple-500 outline-none mt-1 color-scheme-dark" />}
              />

              <ProfileItem 
                icon={<Star />} 
                label="Celestial Alignment" 
                value={user.zodiac_sign} 
                subValue="Calculated from birth"
              />
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4">
              {user.is_active && (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Vessel Active
                </div>
              )}
              {user.is_superuser && (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">
                  <ShieldCheck size={12} /> Arch-Mage Status
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ icon, label, value, subValue, isEditing, input }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-purple-400/60 mb-2">
      {React.cloneElement(icon, { size: 16 })}
      <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>
    </div>
    {isEditing && input ? (
      input
    ) : (
      <div>
        <p className="text-xl font-medium text-white tracking-tight">{value || "Unknown"}</p>
        {subValue && <p className="text-[10px] text-gray-600 italic mt-1">{subValue}</p>}
      </div>
    )}
  </div>
);

export default Profile;