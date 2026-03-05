import React, { useEffect, useState } from "react";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";
import {
  CheckIcon,
  Plus,
  Trash2,
  X,
  Upload,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../config/Security";
import { Button, Input, Tag, Tooltip, Progress, Badge } from "antd";
import {
  PictureOutlined,
  TagOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

/* ─── Before Upload ─────────────────────────────────────────────── */
export const BeforeUpload = () => {
  const [file, setFile] = useState([]);

  if (file.length > 0) return <AfterUpload file={file} setFile={setFile} />;

  return (
    <div className="container mx-auto max-w-screen-2xl flex flex-col w-full items-center justify-center pt-28 pb-16 min-h-screen relative overflow-hidden">
      <ShootingStars />
      <StarsBackground />

      <div className="flex flex-col w-full max-w-3xl items-center z-50 gap-y-4 text-center px-4">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Sparkles size={18} />
          <span className="text-sm font-medium tracking-widest uppercase text-primary/80">
            Share your vision
          </span>
          <Sparkles size={18} />
        </div>
        <h1 className="text-black dark:text-white text-4xl font-semibold leading-tight">
          Share and make others realize
          <br />
          how wonderful the world is
        </h1>
        <p className="text-black/50 dark:text-white/50 text-base mt-1">
          Introduce yourself to the world through your photography
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="relative flex flex-col items-center justify-center gap-y-6 w-full max-w-3xl mt-10 z-50 border-2 border-dashed border-black/20 dark:border-white/20 hover:border-primary dark:hover:border-primary rounded-2xl px-8 py-14 bg-black/5 dark:bg-white/5 hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
        onClick={() => document.getElementById("fileInputBefore").click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
            <Upload size={28} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-black dark:text-white font-semibold text-xl">
              Drop your photos here
            </p>
            <p className="text-black/40 dark:text-white/40 text-sm mt-1">
              or click to browse from your device
            </p>
          </div>
          <span className="px-5 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium cursor-pointer transition-all duration-300">
            Browse Files
          </span>
        </div>
        <input
          type="file"
          id="fileInputBefore"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files[0];
            if (files) setFile((prev) => [...prev, files]);
          }}
        />
      </div>
    </div>
  );
};

/* ─── After Upload ──────────────────────────────────────────────── */
const AfterUpload = ({ file, setFile }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState([
    { file: file[0], title: "", description: "", tags: [] },
  ]);
  const [tagInputs, setTagInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    const { files, metaData } = modifiedValue();
    files.forEach((item) => formData.append("images", item));
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
        toast.warn("Sign-in to continue");
        return;
      }
      toast.success("Photos uploaded successfully!");
      navigate("/");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTagKeyDown = (e, index) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      const val = (tagInputs[index] || "").trim();
      if (!val) return;
      const prevTags = values[index]?.tags || [];
      setFieldValue("tags", [...prevTags, val], index);
      setTagInputs((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const removeTag = (i, j) => {
    const newTags = values[i].tags.filter((_, idx) => idx !== j);
    setValues((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, tags: newTags } : p))
    );
  };

  const modifiedValue = () => {
    const files = values.map((v) => v.file);
    const metaData = values.map((v) => ({
      title: v.title,
      description: v.description,
      tags: v.tags,
    }));
    return { files, metaData };
  };

  const setFieldValue = (name, newValue, index) => {
    setValues((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [name]: newValue } : p))
    );
  };

  const deleteImage = (i) => {
    const updatedFiles = file.filter((_, idx) => idx !== i);
    setFile(updatedFiles);
    const nv = values.filter((_, idx) => idx !== i);
    setValues(nv);
    if (activeCard >= nv.length) setActiveCard(Math.max(0, nv.length - 1));
  };

  const completionScore = (v) => {
    let score = 0;
    if (v.title.trim()) score += 40;
    if (v.description.trim()) score += 30;
    if (v.tags.length > 0) score += 30;
    return score;
  };

  return (
    <div className="min-h-screen container mx-auto max-w-screen-2xl w-full flex flex-col items-center px-4 pt-24 pb-32 relative">
      <ShootingStars />
      <StarsBackground />

      <div className="w-full max-w-5xl flex flex-col items-center gap-y-6 z-50">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-black dark:text-white text-3xl font-semibold">
            Make your photos easy to find
          </h1>
          <p className="text-black/50 dark:text-white/50 text-sm mt-2 max-w-lg mx-auto">
            Add tags, titles, and descriptions to help others discover your
            photos
          </p>
        </div>

        {/* Thumbnail strip + add button */}
        <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 w-full overflow-x-auto scrollBar">
          {values.map((item, idx) => {
            const score = completionScore(item);
            return (
              <Tooltip key={idx} title={`${score}% complete`}>
                <div
                  className={`relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                    activeCard === idx
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent scale-105"
                      : "opacity-60 hover:opacity-90"
                  }`}
                  style={{ width: 80, height: 80 }}
                  onClick={() => setActiveCard(idx)}
                >
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {score === 100 && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckIcon size={10} className="text-white" />
                    </div>
                  )}
                </div>
              </Tooltip>
            );
          })}

          {/* Add more */}
          <label
            htmlFor="fileInputAfter"
            className="flex-shrink-0 cursor-pointer"
          >
            <div
              className="flex items-center justify-center rounded-xl border-2 border-dashed border-black/20 dark:border-white/20 hover:border-primary dark:hover:border-primary text-black/40 dark:text-white/40 hover:text-primary transition-all duration-200"
              style={{ width: 80, height: 80 }}
            >
              <Plus size={24} />
            </div>
          </label>
          <input
            type="file"
            id="fileInputAfter"
            className="hidden"
            multiple
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) {
                setValues((prev) => [
                  ...prev,
                  { file: f, title: "", description: "", tags: [] },
                ]);
                setFile((prev) => [...prev, f]);
                setActiveCard(values.length);
              }
            }}
          />
        </div>

        {/* Active card editor */}
        {values[activeCard] && (
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-lg">
            <div className="flex max-[800px]:flex-col">
              {/* Image preview */}
              <div className="w-2/5 max-[800px]:w-full bg-black/5 dark:bg-black/40 flex items-center justify-center p-6 min-h-[380px]">
                <img
                  src={URL.createObjectURL(values[activeCard].file)}
                  alt=""
                  className="max-h-[340px] max-w-full object-contain rounded-xl shadow-md"
                />
              </div>

              {/* Form */}
              <div className="flex-1 p-6 flex flex-col gap-y-5">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge count={activeCard + 1} color="#1677FF" />
                    <span className="text-black/60 dark:text-white/60 text-sm">
                      {values[activeCard].file.name.length > 25
                        ? values[activeCard].file.name.slice(0, 25) + "…"
                        : values[activeCard].file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress
                        percent={completionScore(values[activeCard])}
                        size="small"
                        showInfo={false}
                        strokeColor="#1677FF"
                        trailColor="rgba(0,0,0,0.1)"
                      />
                    </div>
                    <span className="text-xs text-black/40 dark:text-white/40">
                      {completionScore(values[activeCard])}%
                    </span>
                    <Tooltip title="Delete this photo">
                      <button
                        onClick={() => deleteImage(activeCard)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-black/30 dark:text-white/30 hover:text-red-500 transition-all duration-200"
                      >
                        <DeleteOutlined />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <PictureOutlined /> Title
                  </label>
                  <Input
                    placeholder="Give your photo a title..."
                    maxLength={20}
                    showCount
                    value={values[activeCard].title}
                    onChange={(e) =>
                      setFieldValue("title", e.target.value, activeCard)
                    }
                    className="rounded-lg"
                    size="large"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <TagOutlined /> Tags
                    <span className="normal-case font-normal text-black/30 dark:text-white/30">
                      (press space to add)
                    </span>
                  </label>
                  <Input
                    placeholder="nature, landscape, sunset..."
                    value={tagInputs[activeCard] || ""}
                    onChange={(e) =>
                      setTagInputs((prev) => ({
                        ...prev,
                        [activeCard]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => handleTagKeyDown(e, activeCard)}
                    className="rounded-lg"
                    size="large"
                    prefix={
                      <TagOutlined className="text-black/20 dark:text-white/20" />
                    }
                  />
                  {values[activeCard].tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {values[activeCard].tags.map((t, j) => (
                        <Tag
                          key={j}
                          closable
                          onClose={() => removeTag(activeCard, j)}
                          color="blue"
                          className="rounded-full px-3 py-0.5 text-sm"
                        >
                          {t}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <FileTextOutlined /> Description
                  </label>
                  <TextArea
                    placeholder="Write something beautiful about this photo..."
                    rows={4}
                    maxLength={100}
                    showCount
                    value={values[activeCard].description}
                    onChange={(e) =>
                      setFieldValue("description", e.target.value, activeCard)
                    }
                    className="rounded-lg resize-none"
                  />
                </div>

                {/* Navigate between cards */}
                {values.length > 1 && (
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <button
                      disabled={activeCard === 0}
                      onClick={() => setActiveCard((p) => p - 1)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ← Previous
                    </button>
                    <span className="text-xs text-black/30 dark:text-white/30 mx-1">
                      {activeCard + 1} of {values.length}
                    </span>
                    <button
                      disabled={activeCard === values.length - 1}
                      onClick={() => setActiveCard((p) => p + 1)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-black/10 dark:border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ImageIcon size={16} className="text-primary" />
            <span className="text-black/70 dark:text-white/70 text-sm font-medium">
              {file.length} photo{file.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
          <span className="text-xs text-black/40 dark:text-white/40">
            {values.filter((v) => completionScore(v) === 100).length} of{" "}
            {values.length} complete
          </span>
        </div>
        <Button
          size="large"
          onClick={() => {
            if (!loading) handleSubmit();
          }}
          loading={loading}
          type="primary"
          icon={<Upload size={16} />}
          className="rounded-lg font-medium px-6"
        >
          Submit Photos
        </Button>
      </div>
    </div>
  );
};
