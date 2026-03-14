import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Edit2,
  Check,
  X,
  Mail,
  Phone,
  Globe,
  MapPin,
  Settings,
  LogOut,
  Heart,
  Bookmark,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Tooltip, Switch, Modal } from "antd";
import {
  AppstoreOutlined,
  CloudUploadOutlined,
  CompressOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";

// ─── Types ──────────────────────────────────────────────────────────────────

interface UserData {
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  location: string;
  role: string;
  avatar: string;
  followers: number;
  following: number;
  uploads: number;
}

interface ImageService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  likes: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const defaultUser: UserData = {
  name: "Arjun Mehta",
  username: "arjunmehta",
  email: "arjun.mehta@studio.io",
  phone: "+91 98765 43210",
  website: "arjunmehta.dev",
  bio: "Creative photographer & digital artist. Capturing the world one frame at a time.",
  location: "Mumbai, India",
  role: "Senior Photographer",
  avatar: "",
  followers: 1284,
  following: 312,
  uploads: 84,
};

const defaultServices: ImageService[] = [
  {
    id: "compress",
    name: "Auto Compress",
    description: "Reduce file size on every upload",
    icon: <CompressOutlined />,
    enabled: true,
  },
  {
    id: "cdn",
    name: "CDN Delivery",
    description: "Serve via global edge network",
    icon: <GlobalOutlined />,
    enabled: true,
  },
  {
    id: "watermark",
    name: "Watermarking",
    description: "Apply brand watermark to images",
    icon: <BgColorsOutlined />,
    enabled: false,
  },
  {
    id: "webp",
    name: "WebP Converter",
    description: "Auto-convert to WebP on upload",
    icon: <FileImageOutlined />,
    enabled: true,
  },
  {
    id: "gallery",
    name: "Smart Gallery",
    description: "AI-powered image tagging & search",
    icon: <AppstoreOutlined />,
    enabled: false,
  },
  {
    id: "backup",
    name: "Cloud Backup",
    description: "Auto-backup to external storage",
    icon: <CloudUploadOutlined />,
    enabled: false,
  },
];

const mockImages: UploadedImage[] = [
  { id: "1", url: "/image1.jpg", name: "Golden Hour", likes: 142 },
  { id: "2", url: "/image1.jpg", name: "Mountain Mist", likes: 89 },
  { id: "3", url: "/image1.jpg", name: "City Lights", likes: 214 },
  { id: "4", url: "/image1.jpg", name: "Ocean Calm", likes: 67 },
];

// ─── EditableField ────────────────────────────────────────────────────────────

const EditableField: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  onSave: (val: string) => void;
  multiline?: boolean;
}> = ({ label, value, icon, onSave, multiline = false }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };
  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-black/5 dark:border-white/5 last:border-b-0">
      <span className="text-primary mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-wider mb-1">
          {label}
        </p>
        {editing ? (
          <div className="flex flex-col gap-2">
            {multiline ? (
              <textarea
                className="w-full rounded-lg px-3 py-2 text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
            ) : (
              <input
                className="w-full rounded-lg px-3 py-2 text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white outline-none focus:ring-2 focus:ring-primary/40"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-secondary transition-all duration-200"
              >
                <Check size={12} /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 text-xs hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-200"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 group/field">
            <p className="text-sm text-black/80 dark:text-white/80 break-all">
              {value}
            </p>
            <button
              onClick={() => {
                setDraft(value);
                setEditing(true);
              }}
              className="opacity-0 group-hover/field:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-black/30 dark:text-white/30 hover:text-primary transition-all duration-200"
            >
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserData>(defaultUser);
  const [services, setServices] = useState<ImageService[]>(defaultServices);
  const [images, setImages] = useState<UploadedImage[]>(mockImages);
  const [activeTab, setActiveTab] = useState<"Info" | "Services" | "Images">(
    "Info"
  );
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name);
  const [addServiceModal, setAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({ name: "", description: "" });
  const [likedImages, setLikedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveName = () => {
    setUser((p) => ({ ...p, name: nameDraft }));
    setEditingName(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUser((p) => ({ ...p, avatar: URL.createObjectURL(file) }));
  };

  const toggleService = (id: string) =>
    setServices((p) =>
      p.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );

  const deleteService = (id: string) =>
    setServices((p) => p.filter((s) => s.id !== id));

  const addService = () => {
    if (!newService.name.trim()) return;
    setServices((p) => [
      ...p,
      {
        id: Date.now().toString(),
        name: newService.name,
        description: newService.description,
        icon: <AppstoreOutlined />,
        enabled: true,
      },
    ]);
    setNewService({ name: "", description: "" });
    setAddServiceModal(false);
  };

  const toggleLike = (id: string) => {
    setLikedImages((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );
    setImages((p) =>
      p.map((img) =>
        img.id === id
          ? {
              ...img,
              likes: likedImages.includes(id) ? img.likes - 1 : img.likes + 1,
            }
          : img
      )
    );
  };

  const removeImage = (id: string) =>
    setImages((p) => p.filter((img) => img.id !== id));

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] transition-all duration-500">
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div
        className="relative w-full h-[320px] bg-cover bg-center bg-no-repeat flex flex-col justify-end overflow-hidden"
        style={{ backgroundImage: "url(./Img/SearchBg.jpg)" }}
      >
        <ShootingStars minDelay={2000} maxDelay={4000} />
        <StarsBackground starDensity={0.0003} />
        <div className="absolute inset-0 bg-black/50" />

        {/* Brand */}
        <div className="absolute top-6 left-8 z-10">
          <Link
            to="/"
            className="primaryIcon text-xl text-white font-semibold hover:opacity-70 transition-all duration-300"
          >
            ImageGallery
          </Link>
        </div>

        {/* Avatar + name anchored to bottom */}
        <div className="relative z-10 container mx-auto max-w-[1460px] px-8 flex items-end gap-5 pb-0">
          {/* Avatar */}
          <div className="relative mb-[-44px]">
            <div className="w-[96px] h-[96px] rounded-full border-4 border-white dark:border-[#111111] overflow-hidden bg-black/30 shadow-xl">
              <img
                src={user.avatar || "./person.png"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-primary hover:bg-secondary text-white flex items-center justify-center shadow-md transition-all duration-200 border-2 border-white dark:border-[#111111]"
            >
              <Camera size={12} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name */}
          <div className="mb-[-30px] pb-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  className="rounded-lg px-3 py-1.5 text-base font-semibold bg-white/10 backdrop-blur border border-white/30 text-white outline-none focus:ring-2 focus:ring-primary/50"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  autoFocus
                />
                <button
                  onClick={saveName}
                  className="p-1.5 rounded-lg bg-primary text-white hover:bg-secondary transition-all"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setNameDraft(user.name);
                    setEditingName(false);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/name">
                <h1 className="text-white font-semibold text-xl">
                  {user.name}
                </h1>
                <button
                  onClick={() => {
                    setNameDraft(user.name);
                    setEditingName(true);
                  }}
                  className="opacity-0 group-hover/name:opacity-100 p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all duration-200"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            )}
            <p className="text-white/60 text-sm">@{user.username}</p>
          </div>
        </div>
      </div>

      {/* ── Sub-header ──────────────────────────────────────── */}
      <div className="container mx-auto max-w-[1460px] px-8">
        {/* Stats + actions row */}
        <div className="flex flex-col min-[600px]:flex-row items-start min-[600px]:items-center justify-between pt-16 pb-5 gap-4 border-b border-black/10 dark:border-white/10">
          <div className="flex gap-7">
            {[
              { label: "Uploads", value: user.uploads },
              { label: "Followers", value: user.followers.toLocaleString() },
              { label: "Following", value: user.following },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-semibold text-black dark:text-white leading-tight">
                  {s.value}
                </p>
                <p className="text-xs text-black/50 dark:text-white/50 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/user/upload"
              className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-medium ring-1 ring-[#111111] dark:ring-white hover:ring-0 text-center px-4 py-2.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
            >
              <Upload size={15} /> Upload
            </Link>
            <button className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/60 dark:text-white/60 transition-all duration-200">
              <Settings size={17} />
            </button>
            <button className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-black/60 dark:text-white/60 hover:text-red-500 transition-all duration-200">
              <LogOut size={17} />
            </button>
          </div>
        </div>

        {/* Role + Location */}
        <div className="flex items-center gap-3 py-4 border-b border-black/10 dark:border-white/10">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {user.role}
          </span>
          <span className="text-black/40 dark:text-white/40 text-sm flex items-center gap-1.5">
            <MapPin size={12} /> {user.location}
          </span>
        </div>

        {/* ── Tab Bar ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1 pt-2 mb-8">
          {(["Info", "Services", "Images"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 relative ${
                activeTab === tab
                  ? "text-black dark:text-white"
                  : "text-black/50 dark:text-white/40 hover:text-black/80 dark:hover:text-white/70"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ══ INFO TAB ════════════════════════════════════════ */}
        {activeTab === "Info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
            {/* Personal Details */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-black dark:text-white mb-4 uppercase tracking-wider text-black/50 dark:text-white/50">
                Personal Details
              </h2>
              <EditableField
                label="Full Name"
                value={user.name}
                icon={<Edit2 size={14} />}
                onSave={(v) => setUser((p) => ({ ...p, name: v }))}
              />
              <EditableField
                label="Email"
                value={user.email}
                icon={<Mail size={14} />}
                onSave={(v) => setUser((p) => ({ ...p, email: v }))}
              />
              <EditableField
                label="Phone"
                value={user.phone}
                icon={<Phone size={14} />}
                onSave={(v) => setUser((p) => ({ ...p, phone: v }))}
              />
              <EditableField
                label="Website"
                value={user.website}
                icon={<Globe size={14} />}
                onSave={(v) => setUser((p) => ({ ...p, website: v }))}
              />
              <EditableField
                label="Location"
                value={user.location}
                icon={<MapPin size={14} />}
                onSave={(v) => setUser((p) => ({ ...p, location: v }))}
              />
            </div>

            <div className="flex flex-col gap-6">
              {/* About */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-black/50 dark:text-white/50 mb-4 uppercase tracking-wider">
                  About
                </h2>
                <EditableField
                  label="Bio"
                  value={user.bio}
                  icon={<Edit2 size={14} />}
                  onSave={(v) => setUser((p) => ({ ...p, bio: v }))}
                  multiline
                />
                <EditableField
                  label="Role / Title"
                  value={user.role}
                  icon={<Sparkles size={14} />}
                  onSave={(v) => setUser((p) => ({ ...p, role: v }))}
                />
              </div>

              {/* Activity */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-black/50 dark:text-white/50 mb-4 uppercase tracking-wider">
                  Activity
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Total Likes",
                      value: "3.2k",
                      icon: <Heart size={14} />,
                    },
                    {
                      label: "Saves",
                      value: "891",
                      icon: <Bookmark size={14} />,
                    },
                    {
                      label: "Photos",
                      value: user.uploads,
                      icon: <ImageIcon size={14} />,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5"
                    >
                      <span className="text-primary">{item.icon}</span>
                      <p className="text-base font-semibold text-black dark:text-white">
                        {item.value}
                      </p>
                      <p className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-wide text-center leading-tight">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SERVICES TAB ════════════════════════════════════ */}
        {activeTab === "Services" && (
          <div className="pb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-black dark:text-white">
                  Image Management Services
                </h2>
                <p className="text-sm text-black/50 dark:text-white/50 mt-0.5">
                  {services.filter((s) => s.enabled).length} of{" "}
                  {services.length} active
                </p>
              </div>
              <button
                onClick={() => setAddServiceModal(true)}
                className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-medium ring-1 ring-[#111111] dark:ring-white hover:ring-0 px-4 py-2.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
              >
                <Plus size={15} /> Add Service
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="appearOnScroll bg-white dark:bg-zinc-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm p-5 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all duration-200"
                      style={{
                        background: svc.enabled
                          ? "#54ca8420"
                          : "rgba(0,0,0,0.05)",
                        color: svc.enabled ? "#54ca84" : "#999",
                      }}
                    >
                      {svc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black dark:text-white leading-tight">
                        {svc.name}
                      </p>
                      <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                        {svc.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          svc.enabled
                            ? "bg-primary"
                            : "bg-black/20 dark:bg-white/20"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          svc.enabled
                            ? "text-primary"
                            : "text-black/40 dark:text-white/40"
                        }`}
                      >
                        {svc.enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        size="small"
                        checked={svc.enabled}
                        onChange={() => toggleService(svc.id)}
                        style={
                          svc.enabled ? { backgroundColor: "#54ca84" } : {}
                        }
                      />
                      <Tooltip title="Remove service">
                        <button
                          onClick={() => deleteService(svc.id)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-black/20 dark:text-white/20 hover:text-red-500 transition-all duration-200"
                        >
                          <Trash2 size={13} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add more card */}
              <button
                onClick={() => setAddServiceModal(true)}
                className="rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-primary dark:hover:border-primary p-5 flex flex-col items-center justify-center gap-2 text-black/30 dark:text-white/30 hover:text-primary transition-all duration-300 min-h-[120px]"
              >
                <Plus size={22} />
                <span className="text-sm font-medium">Add Service</span>
              </button>
            </div>
          </div>
        )}

        {/* ══ IMAGES TAB ══════════════════════════════════════ */}
        {activeTab === "Images" && (
          <div className="pb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-black dark:text-white">
                  Your Uploads
                </h2>
                <p className="text-sm text-black/50 dark:text-white/50 mt-0.5">
                  {images.length} photo{images.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                to="/user/upload"
                className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-medium ring-1 ring-[#111111] dark:ring-white hover:ring-0 px-4 py-2.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
              >
                <Upload size={15} /> Upload Photos
              </Link>
            </div>

            {images.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-primary dark:hover:border-primary py-20 transition-all duration-300 cursor-pointer group"
                onClick={() => (window.location.href = "/user/upload")}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                  <Upload size={26} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-black dark:text-white font-semibold">
                    No photos yet
                  </p>
                  <p className="text-black/40 dark:text-white/40 text-sm mt-1">
                    Click to upload your first photo
                  </p>
                </div>
                <span className="px-5 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all duration-300">
                  Browse Files
                </span>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
                {images.map((img) => {
                  const isLiked = likedImages.includes(img.id);
                  return (
                    <div
                      key={img.id}
                      className="appearOnScroll rounded-xl overflow-hidden relative group cursor-pointer break-inside-avoid"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-auto block rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/image1.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl pointer-events-none" />

                      {/* Top-right actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        <button
                          onClick={() => removeImage(img.id)}
                          className="p-2 rounded-lg bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600 transition-all duration-200"
                        >
                          <Trash2 size={15} />
                        </button>
                        <button
                          onClick={() => toggleLike(img.id)}
                          className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                            isLiked
                              ? "bg-pink-500/90 text-white"
                              : "bg-black/30 text-white hover:bg-black/50"
                          }`}
                        >
                          <Heart
                            size={15}
                            className={isLiked ? "fill-white" : ""}
                          />
                        </button>
                      </div>

                      {/* Bottom bar */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm font-medium drop-shadow">
                            {img.name}
                          </span>
                          <span className="flex items-center gap-1 text-white text-sm">
                            <Heart
                              size={13}
                              className={
                                isLiked
                                  ? "fill-pink-400 text-pink-400"
                                  : "text-white/80"
                              }
                            />
                            {img.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add more tile */}
                <Link
                  to="/user/upload"
                  className="flex items-center justify-center rounded-xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-primary dark:hover:border-primary text-black/30 dark:text-white/30 hover:text-primary transition-all duration-300 break-inside-avoid"
                  style={{ minHeight: 180 }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plus size={26} />
                    <span className="text-sm font-medium">Add More</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ Add Service Modal ════════════════════════════════ */}
      <Modal
        open={addServiceModal}
        onCancel={() => setAddServiceModal(false)}
        footer={null}
        centered
        styles={{
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          },
        }}
        title={
          <span className="text-white font-semibold">Add New Service</span>
        }
      >
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Service Name
            </label>
            <input
              className="rounded-lg px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-white/30"
              placeholder="e.g. Smart Resize"
              value={newService.name}
              onChange={(e) =>
                setNewService((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="rounded-lg px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-white/30 resize-none"
              placeholder="What does this service do?"
              rows={3}
              value={newService.description}
              onChange={(e) =>
                setNewService((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={addService}
              disabled={!newService.name.trim()}
              className="flex-1 bg-primary hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={15} /> Add Service
            </button>
            <button
              onClick={() => setAddServiceModal(false)}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
