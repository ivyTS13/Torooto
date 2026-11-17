import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Compass,
  ShieldCheck,
  Camera,
  Loader2,
  Save,
  Edit3,
  Clock,
  Eye,
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import usePileHistoryStore from "../../stores/usePileHistoryStore";
import EngravedAvatar from "../common/EngravedAvatar";

export default function ProfileView({ isAdmin = false }) {
  const navigate = useNavigate();
  const { user, updateAvatar, updateProfile, isLoading: isAuthLoading } = useAuthStore();
  const { piles, isLoading: isPilesLoading, fetchPiles } = usePileHistoryStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", birthday: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) {
      fetchPiles();
    }
  }, [isAdmin, fetchPiles]);

  const handleStartEdit = () => {
    setFormData({
      name: user?.name || "",
      birthday: user?.birthday || "",
    });
    setIsEditing(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await updateAvatar(file);
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const recentPiles = piles.slice(0, 5);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#C5A059]" size={36} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-16 text-[#E8E2D5]">
      <Motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 pb-6 border-b border-[#C5A059]/20 text-center md:text-left"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#C5A059] mb-2">
          {isAdmin ? "Curator Desk" : "Member Folio"}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-[0.06em] text-[#E8E2D5] text-balance">
          {isAdmin ? "Curator Profile" : "Profile & Reading Ledger"}
        </h1>
        <p className="font-mono text-xs text-[#9E9689] mt-2 tabular-nums">
          {isAdmin
            ? `Record ID · ${user.id?.split("-")[0]}`
            : user.zodiac_sign
              ? `Zodiac correspondence · ${user.zodiac_sign}`
              : "Personal Archive"}
        </p>
      </Motion.header>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        aria-label="Upload profile image"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-4 min-w-0 space-y-6">
          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="folio-plate folio-inset rounded-sm p-5 sm:p-7 flex flex-col items-center relative group"
          >
            <button
              type="button"
              aria-label="Change profile picture"
              className="relative cursor-pointer mb-5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative overflow-hidden rounded-sm border border-[#C5A059]/40 bg-[#1C1917]">
                <EngravedAvatar
                  user={user}
                  size={136}
                  textClassName="text-3xl"
                  className={isAuthLoading ? "opacity-35" : ""}
                />
                <span className="absolute inset-0 flex items-center justify-center bg-[#0B0A0E]/65 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                  <Camera className="text-[#C5A059] w-7 h-7" />
                </span>
                <span className="sm:hidden absolute bottom-1.5 right-1.5 rounded-sm border border-[#C5A059]/45 bg-[#0B0A0E]/90 p-1 text-[#C5A059]">
                  <Camera size={12} />
                </span>
                {isAuthLoading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#0B0A0E]/60">
                    <Loader2 className="animate-spin text-[#C5A059]" size={24} />
                  </span>
                )}
              </div>
            </button>

            <h2 className="font-display text-xl tracking-[0.08em] text-[#E8E2D5] text-center">
              {user.name || "Member"}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 font-serif italic text-base text-[#9E9689]">
              <Compass size={14} className="text-[#8A6D3B]" />
              <span>{user.zodiac_sign || "Unassigned"}</span>
            </div>

            <div className="w-full pt-6 mt-6 border-t border-[#C5A059]/20 space-y-2.5">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isAuthLoading}
                    className="w-full py-2.5 px-4 rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] text-[#0B0A0E] font-display text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-colors duration-300 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E8E2D5]"
                  >
                    <Save size={15} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full py-2.5 px-4 rounded-sm border border-[#C5A059]/25 bg-[#1C1917] hover:border-[#C5A059]/50 text-[#9E9689] hover:text-[#E8E2D5] font-display text-xs uppercase tracking-[0.18em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="w-full py-2.5 px-4 rounded-sm border border-[#C5A059]/40 bg-[#1C1917] hover:bg-[#C5A059]/10 hover:border-[#C5A059]/70 text-[#E8E2D5] font-display text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  <Edit3 size={15} className="text-[#C5A059]" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </Motion.div>

          {!isAdmin && (
            <div className="folio-plate rounded-sm p-5">
              <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#C5A059]">
                <span className="h-1.5 w-1.5 rotate-45 bg-[#C5A059]" />
                <span>Private Ledger</span>
              </div>
              <p className="text-xs text-[#9E9689] mt-2.5 leading-relaxed max-w-[65ch]">
                Your saved readings and personal birth correspondence remain scoped strictly to your account.
              </p>
            </div>
          )}
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-8 min-w-0 space-y-6"
        >
          <div className="folio-plate folio-inset rounded-sm p-5 sm:p-7 md:p-9">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <ProfileItem
                icon={User}
                label="Name"
                htmlFor={isEditing ? "profile-name" : undefined}
                isEditing={isEditing}
                value={user.name}
                input={
                  <input
                    id="profile-name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-sm border border-[#C5A059]/30 bg-[#1C1917] px-3.5 py-2 text-sm text-[#E8E2D5] focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
                  />
                }
              />

              <ProfileItem
                icon={Mail}
                label="Email"
                value={user.email}
                subValue={isAdmin ? "Read-only identifier" : "Used for sign-in"}
              />

              <ProfileItem
                icon={Calendar}
                label="Birth Date"
                htmlFor={isEditing ? "profile-birthday" : undefined}
                isEditing={isEditing}
                value={user.birthday || "Not set"}
                isTabular
                input={
                  <input
                    id="profile-birthday"
                    type="date"
                    autoComplete="bday"
                    value={formData.birthday}
                    onChange={(e) =>
                      setFormData({ ...formData, birthday: e.target.value })
                    }
                    className="mt-1 w-full rounded-sm border border-[#C5A059]/30 bg-[#1C1917] px-3.5 py-2 text-sm font-mono tabular-nums text-[#E8E2D5] focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60 [color-scheme:dark]"
                  />
                }
              />

              <ProfileItem
                icon={Compass}
                label="Zodiac Sign"
                value={user.zodiac_sign || "Unassigned"}
                subValue="Derived from your birth date"
              />
            </div>

            {isAdmin ? (
              <div className="mt-10 pt-6 border-t border-[#C5A059]/20 flex flex-wrap gap-3">
                {user.is_active && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#1C1917] border border-[#C5A059]/30 font-mono text-[10px] uppercase tracking-[0.18em] text-[#E8E2D5]">
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#C5A059]" />
                    Active Account
                  </span>
                )}
                {user.is_superuser && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#5E1914]/35 border border-[#8B3A32] font-mono text-[10px] uppercase tracking-[0.18em] text-[#E8E2D5]">
                    <ShieldCheck size={12} className="text-[#C5A059]" />
                    Administrator
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-10 pt-6 border-t border-[#C5A059]/20">
                <p className="font-serif italic text-base text-[#9E9689] max-w-[65ch]">
                  Your profile keeps personal birth correspondence aligned alongside your recorded spreads.
                </p>
              </div>
            )}
          </div>

          {!isAdmin && (
            <div className="folio-plate rounded-sm p-7">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#C5A059]/20">
                <h3 className="font-display text-base uppercase tracking-[0.14em] text-[#E8E2D5]">
                  Recent Readings
                </h3>
                {piles.length > 5 && (
                  <button
                    type="button"
                    onClick={() => navigate("/piles")}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C5A059] hover:text-[#E8E2D5] transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                  >
                    View All
                  </button>
                )}
              </div>

              {isPilesLoading && piles.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-[#C5A059]" size={24} />
                </div>
              ) : recentPiles.length === 0 ? (
                <div className="font-serif italic text-sm text-[#9E9689] py-8 text-center border border-[#C5A059]/15 bg-[#1C1917]/50 rounded-sm">
                  No saved readings yet. Draw a spread in the reading room to begin your archive.
                </div>
              ) : (
                <div className="divide-y divide-[#C5A059]/15 border border-[#C5A059]/15 bg-[#1C1917]/35 rounded-sm">
                  {recentPiles.map((pile) => (
                    <div
                      key={pile.pile_id}
                      className="px-4 py-3.5 flex items-center justify-between hover:bg-[#1C1917] transition-colors duration-200"
                    >
                      <div>
                        <div className="font-mono text-xs text-[#C5A059] tabular-nums">
                          #{pile.pile_id.split("-")[0]}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[#9E9689] text-xs mt-1 font-mono tabular-nums">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={12} className="text-[#8A6D3B]" />
                            {formatDate(pile.drawn_at)}
                          </span>
                          <span className="px-2 py-0.5 border border-[#C5A059]/25 bg-[#141218] text-[#E8E2D5] rounded-sm text-[10px] uppercase tracking-widest">
                            {pile.pile_contents?.length || 0} Card
                            {pile.pile_contents?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/piles/${pile.pile_id}`, { state: { pile } })}
                        className="p-2 text-[#9E9689] hover:text-[#C5A059] hover:bg-[#141218] border border-transparent hover:border-[#C5A059]/30 rounded-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                        title="View Reading"
                        aria-label={`View reading ${pile.pile_id.split("-")[0]}`}
                      >
                        <Eye size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Motion.div>
      </div>
    </div>
  );
}

const ProfileItem = ({
  icon,
  label,
  htmlFor,
  value,
  subValue,
  isEditing,
  isTabular = false,
  input,
}) => {
  const IconComponent = icon;
  return (
    <div className="space-y-1 min-w-0">
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689] mb-1.5"
        >
          <IconComponent size={14} className="text-[#8A6D3B]" />
          <span>{label}</span>
        </label>
      ) : (
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689] mb-1.5">
          <IconComponent size={14} className="text-[#8A6D3B]" />
          <span>{label}</span>
        </div>
      )}
      {isEditing && input ? (
        input
      ) : (
        <div>
          <p
            className={`text-base sm:text-xl font-medium text-[#E8E2D5] tracking-tight break-words ${
              isTabular ? "font-mono tabular-nums" : "font-serif"
            }`}
          >
            {value || "—"}
          </p>
          {subValue && (
            <p className="text-xs font-serif italic text-[#9E9689] mt-0.5">
              {subValue}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
