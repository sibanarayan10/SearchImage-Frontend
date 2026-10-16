import React, { useState } from "react";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";
import {
  Upload as UploadIcon,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Tag as TagIcon,
  FileText,
  Type,
  RefreshCw,
  Trash2,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../config/Security";
import { Button, Input, Tag, Tooltip, Progress } from "antd";
import {
  moderateAndAutoFillPhoto,
  getGeminiApiKey,
} from "../config/geminiService";

const { TextArea } = Input;

// ─── File Validation Constants ─────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit

const validateFile = (file: File): boolean => {
  const extension = "." + (file.name.split(".").pop() || "").toLowerCase();
  const mimeType = (file.type || "").toLowerCase();

  const isAllowed =
    ALLOWED_MIME_TYPES.includes(mimeType) ||
    ALLOWED_EXTENSIONS.includes(extension);

  if (!isAllowed) {
    toast.error(
      "Unsupported file format! Only JPG, JPEG, PNG, and WebP images are allowed."
    );
    return false;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    toast.error("File size exceeds 15MB. Please upload a smaller image.");
    return false;
  }

  return true;
};

// ─── BeforeUpload Component ────────────────────────────────────────

export const BeforeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleSelectFile = (selectedFile: File) => {
    if (!validateFile(selectedFile)) return;

    // Use FileReader to create a persistent base64 DataURL that never revokes
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || "";
      setPreviewUrl(dataUrl);
      setFile(selectedFile);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        toast.info("Single image mode: uploading the first image selected.");
      }
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectFile(e.target.files[0]);
    }
  };

  if (file && previewUrl) {
    return (
      <AfterUpload
        file={file}
        previewUrl={previewUrl}
        onReset={() => {
          setFile(null);
          setPreviewUrl("");
        }}
      />
    );
  }

  return (
    <div className="container mx-auto max-w-screen-2xl flex flex-col w-full items-center justify-center pt-28 pb-20 min-h-screen relative overflow-hidden px-4">
      <ShootingStars />
      <StarsBackground />

      {/* Header */}
      <div className="flex flex-col w-full max-w-2xl items-center z-40 gap-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
          <Sparkles size={14} className="animate-pulse" />
          <span>AI-Powered Photo Studio</span>
        </div>

        <h1 className="text-black dark:text-white text-3xl sm:text-5xl font-bold tracking-tight leading-tight mt-2">
          Publish your photograph
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            with visual intelligence
          </span>
        </h1>

        <p className="text-black/60 dark:text-white/60 text-sm sm:text-base max-w-lg mx-auto mt-1">
          Upload a single photo to automatically screen for safety, generate
          captivating descriptions, and discover optimal search tags.
        </p>
      </div>

      {/* Interactive Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() =>
          (
            document.getElementById("singleFileInput") as HTMLInputElement
          )?.click()
        }
        className={`relative flex flex-col items-center justify-center gap-y-5 w-full max-w-xl mt-8 z-40 border-2 border-dashed rounded-3xl p-10 sm:p-14 cursor-pointer transition-all duration-300 backdrop-blur-xl group ${
          isDragging
            ? "border-primary bg-primary/15 scale-[1.02] shadow-2xl shadow-primary/25"
            : "border-black/15 dark:border-white/15 bg-white/40 dark:bg-zinc-900/40 hover:border-primary/60 dark:hover:border-primary/60 hover:bg-black/5 dark:hover:bg-white/5 shadow-xl"
        }`}
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
            <UploadIcon size={32} className="text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
            <Sparkles size={14} />
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-black dark:text-white font-semibold text-lg sm:text-xl">
            {isDragging ? "Drop your photo now" : "Drag and drop your photo here"}
          </p>
          <p className="text-black/50 dark:text-white/50 text-xs sm:text-sm">
            or <span className="text-primary font-medium underline">browse from your device</span>
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-medium text-black/60 dark:text-white/60">
              JPG • PNG • WEBP
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-medium text-black/60 dark:text-white/60">
              Max 15MB
            </span>
          </div>
        </div>

        <input
          type="file"
          id="singleFileInput"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
        />
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-10 z-40">
        <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-black/10 dark:border-white/10 backdrop-blur-md flex items-start gap-3">
          <div className="p-2 rounded-xl bg-green-500/10 text-green-500 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-black dark:text-white">
              Content Safety Shield
            </h2>
            <p className="text-[11px] text-black/50 dark:text-white/50 mt-0.5 leading-relaxed">
              Detects and prevents vulgar, violent, or inappropriate uploads.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-black/10 dark:border-white/10 backdrop-blur-md flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-black dark:text-white">
              Smart Auto-Fill
            </h2>
            <p className="text-[11px] text-black/50 dark:text-white/50 mt-0.5 leading-relaxed">
              Auto-generates concise titles, tags, and rich descriptions.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-black/10 dark:border-white/10 backdrop-blur-md flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
            <FileCheck size={20} />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-black dark:text-white">
              Strict Verification
            </h2>
            <p className="text-[11px] text-black/50 dark:text-white/50 mt-0.5 leading-relaxed">
              Ensures high-quality JPG, PNG, and WebP format compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── AfterUpload Component (Single Photo Studio) ───────────────────

interface AfterUploadProps {
  file: File;
  previewUrl: string;
  onReset: () => void;
}

const AfterUpload: React.FC<AfterUploadProps> = ({
  file,
  previewUrl,
  onReset,
}) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");

  const [isSafe, setIsSafe] = useState<boolean | null>(null);
  const [safetyReason, setSafetyReason] = useState<string>("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiGenerated, setAiGenerated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Completion calculation
  const completionScore = (): number => {
    let score = 0;
    if (title.trim()) score += 40;
    if (description.trim()) score += 30;
    if (tags.length > 0) score += 30;
    return score;
  };

  // AI Auto-Fill & Moderation
  const handleAiAutoFill = async () => {
    if (isAiAnalyzing) return;

    if (!getGeminiApiKey()) {
      toast.warn("AI service key is not configured.");
      return;
    }

    setIsAiAnalyzing(true);

    try {
      const result = await moderateAndAutoFillPhoto(file);

      if (!result.isSafe) {
        setIsSafe(false);
        setSafetyReason(
          result.safetyReason || "Vulgar or inappropriate content detected."
        );
        toast.error(
          result.safetyReason ||
            "Content flagged: Inappropriate or vulgar material detected.",
          { autoClose: 6000 }
        );
      } else {
        setIsSafe(true);
        setSafetyReason("");
        setAiGenerated(true);

        if (result.title) setTitle(result.title);
        if (result.description) setDescription(result.description);
        if (result.tags && result.tags.length > 0) {
          setTags((prev) => Array.from(new Set([...prev, ...result.tags])));
        }

        toast.success("✨ AI details generated & content verified safe!");
      }
    } catch (err: any) {
      console.error("AI Auto-fill failed:", err);
      toast.error(err?.message || "Could not complete AI analysis.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Tag addition
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (!trimmed) return;

    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.code === "Space") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit to backend
  const handleSubmit = async (): Promise<void> => {
    // 1. Strict vulgarity/moderation block
    if (isSafe === false) {
      toast.error(
        "Upload Blocked: This photo was flagged for inappropriate or vulgar content.",
        { autoClose: 6000 }
      );
      return;
    }

    // 2. Ongoing analysis check
    if (isAiAnalyzing) {
      toast.warn("Please wait for AI analysis to finish before publishing.");
      return;
    }

    // 3. Metadata validation
    if (!title.trim()) {
      toast.warn("Please provide a title for your photograph.");
      return;
    }

    if (!description.trim()) {
      toast.warn("Please provide a short description.");
      return;
    }

    if (tags.length === 0) {
      toast.warn("Please add at least one tag or use Auto-Fill with AI.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("images", file);

    const metaData = [
      {
        title: title.slice(0, 20),
        description: description.slice(0, 100),
        tags: tags,
      },
    ];
    formData.append("metadata", JSON.stringify(metaData));

    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/addImages`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          validateStatus: (status) => status > 0,
        }
      );

      if (res?.status === 401) {
        toast.warn("Please sign in to publish your photo");
        return;
      }

      toast.success("✨ Photograph published successfully!");
      navigate("/");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto max-w-screen-2xl w-full flex flex-col items-center px-4 pt-24 pb-36 relative">
      <ShootingStars />
      <StarsBackground />

      <div className="w-full max-w-4xl flex flex-col items-center gap-y-6 z-40">
        {/* Top Header & Quick Actions */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <h1 className="text-black dark:text-white text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
              <span>Photo Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                1 Selected
              </span>
            </h1>
            <p className="text-black/50 dark:text-white/50 text-xs sm:text-sm mt-1">
              Screen for safety, auto-populate metadata with AI, and personalize before publishing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiAutoFill}
              disabled={isAiAnalyzing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAiAnalyzing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Scanning Photo...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Auto-Fill with AI</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/70 dark:text-white/70 text-xs font-medium border border-black/10 dark:border-white/10 transition-all"
            >
              <RefreshCw size={13} />
              <span>Change Image</span>
            </button>
          </div>
        </div>

        {/* Global Warning Alert if Flagged for Vulgarity */}
        {isSafe === false && (
          <div className="w-full p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 flex items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-500/10 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 shrink-0">
                <ShieldAlert size={22} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Content Safety Violation: Inappropriate Content Detected
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  {safetyReason ||
                    "This image contains vulgar, sexually explicit, or offensive material. Publishing is blocked."}
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Remove Photo</span>
            </button>
          </div>
        )}

        {/* Studio Card (Two Column Layout) */}
        <div className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row">
            {/* Left Column: Image Preview Frame & Safety Status */}
            <div className="lg:w-1/2 bg-black/5 dark:bg-black/40 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {file.type.split("/")[1]?.toUpperCase() || "IMAGE"}
                  </span>
                  <span className="text-black/70 dark:text-white/70 text-xs font-medium truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
                <span className="text-[11px] text-black/40 dark:text-white/40">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              {/* Main Image Frame - Stable Base64 Data URL */}
              <div className="relative w-full min-h-[320px] sm:min-h-[400px] flex items-center justify-center rounded-2xl overflow-hidden bg-black/10 dark:bg-black/60 shadow-inner">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-[400px] w-auto max-w-full object-contain rounded-xl select-none"
                  />
                ) : (
                  <div className="text-black/30 dark:text-white/30 text-sm flex items-center gap-2">
                    <ImageIcon size={24} />
                    <span>No image selected</span>
                  </div>
                )}

                {/* AI Analyzing Shimmer Overlay */}
                {isAiAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white px-4 text-center">
                    <Loader2 size={36} className="text-blue-400 animate-spin" />
                    <div>
                      <p className="text-sm font-semibold">
                        Screening content & generating tags...
                      </p>
                      <p className="text-xs text-white/70 mt-0.5">
                        Gemini Vision is inspecting for safety and composition
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Safety Status Pill below image */}
              <div className="mt-4">
                {isSafe === false ? (
                  <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={18} className="shrink-0 text-red-500" />
                      <span className="text-xs font-semibold">
                        Flagged for vulgar/inappropriate content
                      </span>
                    </div>
                    <button
                      onClick={onReset}
                      className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-medium hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ) : isSafe === true ? (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 flex items-center gap-2.5">
                    <ShieldCheck size={18} className="shrink-0 text-green-500" />
                    <div className="text-xs">
                      <span className="font-semibold">Safety Shield: Passed</span>
                      <span className="opacity-80 ml-1.5">
                        Clean and verified for community guidelines.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center gap-2.5 text-black/50 dark:text-white/50 text-xs">
                    <Sparkles size={16} className="shrink-0 text-primary" />
                    <span>
                      Click &ldquo;Auto-Fill with AI&rdquo; to screen safety and generate metadata.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Metadata Form */}
            <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-5">
                {/* Progress & AI Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                      <span>Photo Details</span>
                      {aiGenerated && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-flex items-center gap-1">
                          <Sparkles size={10} /> AI Enhanced
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24">
                        <Progress
                          percent={completionScore()}
                          size="small"
                          showInfo={false}
                          strokeColor={
                            completionScore() === 100 ? "#10B981" : "#1677FF"
                          }
                          trailColor="rgba(0,0,0,0.1)"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-black/50 dark:text-white/50">
                        {completionScore()}% complete
                      </span>
                    </div>
                  </div>

                  <Tooltip title="Reset details & image">
                    <button
                      onClick={onReset}
                      className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-red-500/10 text-black/40 dark:text-white/40 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Tooltip>
                </div>

                {/* Title Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Type size={14} className="text-primary" /> Title
                    </label>
                    <span className="text-[11px] text-black/40 dark:text-white/40">
                      {title.length}/20 chars
                    </span>
                  </div>
                  <Input
                    placeholder="e.g., Golden Sunset"
                    maxLength={20}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl py-2 px-3 text-sm"
                    size="large"
                  />
                </div>

                {/* Tags Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <TagIcon size={14} className="text-primary" /> Tags
                    </label>
                    <span className="text-[11px] text-black/40 dark:text-white/40">
                      Press Space or Enter to add
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., sunset, nature, ocean..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="rounded-xl py-2 px-3 text-sm flex-1"
                      size="large"
                    />
                    <Button
                      onClick={handleAddTag}
                      type="default"
                      className="rounded-xl h-[40px] px-4 font-medium"
                    >
                      Add
                    </Button>
                  </div>

                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 max-h-24 overflow-y-auto">
                      {tags.map((t, j) => (
                        <Tag
                          key={j}
                          closable
                          onClose={() => removeTag(j)}
                          color="blue"
                          className="rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 flex items-center gap-1"
                        >
                          #{t}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-black/40 dark:text-white/40 italic mt-0.5">
                      No tags yet. Auto-Fill with AI or type and press Enter.
                    </p>
                  )}
                </div>

                {/* Description Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} className="text-primary" /> Description
                    </label>
                    <span className="text-[11px] text-black/40 dark:text-white/40">
                      {description.length}/100 chars
                    </span>
                  </div>
                  <TextArea
                    placeholder="Write a captivating description of this photograph..."
                    rows={3}
                    maxLength={100}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl p-3 text-sm resize-none"
                  />
                </div>
              </div>

              {/* Ready Indicator */}
              <div className="pt-2">
                {completionScore() === 100 && isSafe !== false ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium">
                    <CheckCircle2 size={16} />
                    <span>All details complete and ready for publishing!</span>
                  </div>
                ) : (
                  <p className="text-xs text-black/40 dark:text-white/40">
                    Fill title, description, and tags before publishing.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-black/10 dark:border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ImageIcon size={16} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-black dark:text-white truncate max-w-[180px] sm:max-w-xs">
                {file.name}
              </p>
              <p className="text-[11px] text-black/50 dark:text-white/50">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {completionScore()}% ready
              </p>
            </div>
          </div>

          {/* Safety Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-black/10 dark:border-white/10">
            {isSafe === false ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold">
                <AlertTriangle size={12} />
                <span>Flagged Content</span>
              </span>
            ) : isAiAnalyzing ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
                <Loader2 size={12} className="animate-spin" />
                <span>AI scanning...</span>
              </span>
            ) : isSafe === true ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">
                <ShieldCheck size={12} />
                <span>Verified Safe</span>
              </span>
            ) : (
              <span className="text-xs text-black/40 dark:text-white/40">
                Unchecked
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="large"
            onClick={handleSubmit}
            loading={loading}
            disabled={isSafe === false || isAiAnalyzing}
            type="primary"
            icon={<UploadIcon size={16} />}
            className="rounded-xl font-semibold px-6 h-[44px] shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {isSafe === false ? "Cannot Publish Flagged Photo" : "Publish Photo"}
          </Button>
        </div>
      </div>
    </div>
  );
};
