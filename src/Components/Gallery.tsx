import React, {
  useState,
  useEffect,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";

import {
  ArrowDownToLine,
  Heart,
  Bookmark,
  X,
  UserPlus,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../config/Security";
import { Pagination, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { CommentPanel } from "./CommentPanel";

interface ImageItem {
  imageId: number;
  imageUrl: string;
  cloudinary_publicId: string;
  _id: number;
  uploadedByUserName: string;
  uploadedBy: number;
  totalLikes: number;
  totalComments: number;
  savedByCurrentUser: boolean;
  likedByCurrentUser: boolean;
  following: boolean;
}

interface PreviewModalProps {
  images: ImageItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  likedImages: number[];
  savedImages: number[];
  followMap: Record<number, boolean>;
  downloading: number | null;
  onToggleLike: (e: React.MouseEvent, imgId: number) => void;
  onToggleSave: (e: React.MouseEvent, imgId: number) => void;
  onToggleFollow: (e: React.MouseEvent, userId: number) => void;
  onDownload: (e: React.MouseEvent, imgId: number) => void;
  setImages: Dispatch<SetStateAction<ImageItem[]>>;
}

interface GalleryProps {
  backendApi: string;
  search: string;
  setHasData?: (val: boolean) => void;
  ofUser?: boolean;
  onTabChange: (val: boolean) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  images,
  setImages,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  likedImages,
  savedImages,
  followMap,
  downloading,
  onToggleLike,
  onToggleSave,
  onToggleFollow,
  onDownload,
}) => {
  const img = images[currentIndex];
  if (!img) return null;

  const [commentOpen, setCommentOpen] = useState<boolean>(false);

  const isLiked = likedImages.includes(img.imageId);
  const isSaved = savedImages.includes(img.imageId);
  const isFollowing = followMap[img.uploadedBy];

  // close comment panel when navigating to a different image
  useEffect(() => {
    setCommentOpen(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onNext, onPrev, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${img.cloudinary_publicId})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(0.3)",
          transform: "scale(1.15)",
        }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 p-2 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/70 transition"
      >
        <X size={20} />
      </button>

      {/* Prev */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-5 z-50 p-3 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/70 transition"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Next */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-5 z-50 p-3 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/70 transition"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Modal card — image + optional comment panel side by side */}
      <div
        className="relative z-40 flex rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
        style={{ maxWidth: commentOpen ? "80vw" : "58vw", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: image column */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Image */}
          <div className="flex items-center justify-center bg-black/10">
            <img
              src={img.cloudinary_publicId}
              alt={img.uploadedByUserName}
              style={{
                maxHeight: "68vh",
                width: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-md">
            {/* Uploader */}
            <div className="flex items-center gap-3">
              <img
                src="./person.png"
                alt=""
                className="h-9 w-9 rounded-full border-2 border-white/30 object-cover"
              />
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  {img.uploadedByUserName}
                </p>
                <button
                  onClick={(e) => onToggleFollow(e, img.uploadedBy)}
                  className={`text-xs flex items-center gap-1 mt-0.5 transition-colors ${
                    isFollowing
                      ? "text-primary"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {isFollowing ? (
                    <UserCheck size={11} />
                  ) : (
                    <UserPlus size={11} />
                  )}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Comment toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCommentOpen((p) => !p);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-all duration-200 ${
                  commentOpen
                    ? "bg-white/20 border-white/40 text-white"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                <MessageCircle
                  size={15}
                  className={commentOpen ? "fill-white/30" : ""}
                />
                <span>{img.totalComments}</span>
              </button>

              {/* Like */}
              <button
                onClick={(e) => onToggleLike(e, img.imageId)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-all duration-200 ${
                  isLiked
                    ? "bg-pink-500 border-pink-500 text-white"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                <Heart size={15} className={isLiked ? "fill-white" : ""} />
                <span>{img.totalLikes}</span>
              </button>

              {/* Save */}
              <button
                onClick={(e) => onToggleSave(e, img.imageId)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-all duration-200 ${
                  isSaved
                    ? "bg-zinc-500 border-zinc-500 text-white"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                <Bookmark size={15} className={isSaved ? "fill-white" : ""} />
                <span>Save</span>
              </button>

              {/* Download */}
              <button
                onClick={(e) => onDownload(e, img.imageId)}
                disabled={downloading === img.imageId}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition-all duration-200"
              >
                {downloading === img.imageId ? (
                  <Spin indicator={<LoadingOutlined spin />} size="small" />
                ) : (
                  <ArrowDownToLine size={15} />
                )}
                <span className="max-sm:hidden">Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: comment panel — slides in */}
        {commentOpen && (
          <div
            className="bg-black/70 backdrop-blur-md border-l border-white/10 flex-shrink-0 flex flex-col"
            style={{ width: 320, maxHeight: "calc(68vh + 60px)" }}
          >
            <CommentPanel
              imageId={img.imageId}
              onClose={() => setCommentOpen(false)}
              onComment={(result: boolean) => {
                setImages((prev) => {
                  return prev.map((image) =>
                    image.imageId == img.imageId && result
                      ? { ...image, totalComments: image.totalComments + 1 }
                      : { ...image }
                  );
                });
              }}
            />
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 text-white/50 text-sm tracking-widest">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

const Gallery: React.FC<GalleryProps> = ({
  backendApi,
  search,
  setHasData = () => {},
  ofUser = false,
  onTabChange,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<{ type: string; show: boolean }>({
    type: "",
    show: false,
  });
  const [likedImages, setLikedImages] = useState<number[]>([]);
  const [savedImages, setSavedImages] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [downloading, setDownloading] = useState<number | null>(null);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [followMap, setFollowMap] = useState<Record<number, boolean>>({});

  const [totalImage, setTotalImage] = useState<number>(0);

  const location = useLocation();

  const setImageEngagements = (imgs: ImageItem[]): void => {
    setImages([...imgs]);
    const savedImgIds: number[] = [];
    const likedImgIds: number[] = [];
    const newFollowMap: Record<number, boolean> = {};
    const newCommentCounts: Record<number, number> = {};

    imgs.forEach((img) => {
      if (img.savedByCurrentUser) savedImgIds.push(img.imageId);
      if (img.likedByCurrentUser) likedImgIds.push(img.imageId);
      newFollowMap[img.uploadedBy] = img.following;
    });

    setLikedImages(likedImgIds);
    setSavedImages(savedImgIds);
    setFollowMap((prev) => ({ ...prev, ...newFollowMap }));
  };

  const getImages = async (pg: number, size: number): Promise<void> => {
    setLoading({ show: true, type: "images" });
    const userUploaded = activeTab === "Uploads";
    const savedOnly = activeTab === "Saved";
    try {
      const res = await api.get(
        `${backendApi}page=${
          pg - 1
        }&size=${size}&userSpecific=${userUploaded}&savedOnly=${savedOnly}`,
        { withCredentials: true, validateStatus: (s) => s > 0 }
      );
      const { content = [], totalElements: totalImages = 0 } = res.data as {
        content: Omit<ImageItem, "cloudinary_publicId" | "_id">[];
        totalElements: number;
      };
      const newImgs: ImageItem[] = content.map((i) => ({
        ...i,
        _id: i.imageId,
        cloudinary_publicId: i.imageUrl,
      }));
      setTotalImage(totalImages);
      setImageEngagements(newImgs);
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setLoading({ show: false, type: "" });
    }
  };

  const toggleLike = async (
    e: React.MouseEvent,
    imgId: number
  ): Promise<void> => {
    e.stopPropagation();
    setLikedImages((prev) =>
      prev.includes(imgId)
        ? prev.filter((id) => id !== imgId)
        : [...prev, imgId]
    );
    setImages((prev) =>
      prev.map((img) =>
        img.imageId === imgId
          ? {
              ...img,
              totalLikes: likedImages.includes(imgId)
                ? img.totalLikes - 1
                : img.totalLikes + 1,
            }
          : img
      )
    );
    const response = await api.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/images/${imgId}/engagements?type=LIKE`,
      undefined,
      { withCredentials: true, validateStatus: (s) => s > 0 }
    );
    if (response.status === 401) toast.warn("Sign-in to continue");
  };

  const toggleSave = async (
    e: React.MouseEvent,
    imgId: number
  ): Promise<void> => {
    e.stopPropagation();
    setSavedImages((prev) =>
      prev.includes(imgId)
        ? prev.filter((id) => id !== imgId)
        : [...prev, imgId]
    );
    if (savedImages.includes(imgId) && activeTab === "Saved") {
      setImages((prev) => prev.filter((img) => img.imageId !== imgId));
    }
    await api.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/images/${imgId}/engagements?type=SAVE`,
      {},
      { withCredentials: true, validateStatus: (s) => s > 0 }
    );
  };

  const toggleFollow = async (
    e: React.MouseEvent,
    userId: number
  ): Promise<void> => {
    e.stopPropagation();
    setFollowMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
    const response = await api.post(
      `${import.meta.env.VITE_BACKEND_URL}/user/${userId}/toggleFollow`,
      {},
      { withCredentials: true, validateStatus: (s) => s > 0 }
    );
    if (response.status === 401) toast.warn("Sign-in to continue");
  };

  const downloadImage = async (
    e: React.MouseEvent,
    imgId: number
  ): Promise<void> => {
    e.stopPropagation();
    setDownloading(imgId);
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/images/${imgId}/download`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(res.data as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${imgId}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const openPreview = (index: number): void => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  const handleNext = useCallback((): void => {
    setPreviewIndex((prev) => Math.min(prev + 1, images.length - 1));
  }, [images.length]);

  const handlePrev = useCallback((): void => {
    setPreviewIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    getImages(1, 10);
    setPage(0);
  }, [activeTab, search]);

  return (
    <div className="px-8 bg-white dark:bg-[#111111] min-h-screen flex flex-col justify-start items-center pt-16 pb-8 transition-all duration-500">
      {previewVisible && (
        <PreviewModal
          images={images}
          currentIndex={previewIndex}
          onClose={() => setPreviewVisible(false)}
          onNext={handleNext}
          onPrev={handlePrev}
          likedImages={likedImages}
          savedImages={savedImages}
          followMap={followMap}
          downloading={downloading}
          onToggleLike={toggleLike}
          onToggleSave={toggleSave}
          onToggleFollow={toggleFollow}
          onDownload={downloadImage}
          setImages={setImages}
        />
      )}

      {loading.show && loading.type === "images" ? (
        <div
          className="flex items-center justify-center"
          style={{ height: "calc(100vh - 200px)" }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex flex-col items-start justify-center max-w-[1460px] w-full">
          {/* Tabs */}
          {location.pathname === "/" && (
            <div className="flex flex-row justify-start gap-5 w-full mb-6">
              {["All", "Uploads", "Saved"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    onTabChange(true);
                    setPage(0);
                    setActiveTab(item);
                  }}
                  className={`px-5 py-3 rounded-full transition-all duration-300 ${
                    activeTab === item
                      ? "bg-black dark:bg-white text-white dark:text-black tracking-wide"
                      : "text-black/70 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Search heading */}
          {search && (
            <h2 className="text-2xl text-[#111111] dark:text-white mb-12">
              {images.length > 0 ? (
                <>
                  Free <span className="text-primary capitalize">{search}</span>{" "}
                  Images
                </>
              ) : (
                <>
                  No <span className="text-red-500 capitalize">{search}</span>{" "}
                  Images
                </>
              )}
            </h2>
          )}

          {/* Masonry grid */}
          {images.length > 0 ? (
            <div className="flex flex-col items-center gap-10">
              <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6 w-full">
                {images.map((img, index) => {
                  const isLiked = likedImages.includes(img.imageId);
                  const isSaved = savedImages.includes(img.imageId);
                  return (
                    <div
                      key={img.imageId}
                      className="appearOnScroll rounded-xl overflow-hidden relative group cursor-pointer break-inside-avoid"
                      onClick={() => openPreview(index)}
                    >
                      <img
                        src={img.cloudinary_publicId}
                        alt="gallery"
                        className="w-full h-auto block rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl pointer-events-none" />

                      {/* Top right — save & like */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        <button
                          onClick={(e) => toggleSave(e, img.imageId)}
                          className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                            isSaved
                              ? "bg-zinc-500/90 text-white"
                              : "bg-black/30 text-white hover:bg-black/50"
                          }`}
                        >
                          <Bookmark
                            size={18}
                            className={isSaved ? "fill-white" : ""}
                          />
                        </button>
                        <button
                          onClick={(e) => toggleLike(e, img.imageId)}
                          className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                            isLiked
                              ? "bg-pink-500/90 text-white"
                              : "bg-black/30 text-white hover:bg-black/50"
                          }`}
                        >
                          <Heart
                            size={18}
                            className={isLiked ? "fill-white" : ""}
                          />
                        </button>
                      </div>

                      {/* Bottom — uploader + counts + download */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src="./person.png"
                              alt=""
                              className="h-8 w-8 rounded-full border border-white/40"
                            />
                            <span className="text-white text-sm font-medium drop-shadow">
                              {img.uploadedByUserName}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Comment count — grid view */}
                            <span
                              className="flex items-center gap-1 text-white text-sm cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPreview(index);
                              }}
                            >
                              <MessageCircle
                                size={14}
                                className="text-white/80"
                              />
                              {img.totalComments}
                            </span>

                            {/* Like count */}
                            <span className="flex items-center gap-1 text-white text-sm">
                              <Heart
                                size={14}
                                className={
                                  isLiked
                                    ? "fill-pink-400 text-pink-400"
                                    : "text-white/80"
                                }
                              />
                              {img.totalLikes}
                            </span>

                            {/* Download */}
                            <button
                              onClick={(e) => downloadImage(e, img.imageId)}
                              className="p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-200"
                              disabled={downloading === img.imageId}
                            >
                              {downloading === img.imageId ? (
                                <Spin
                                  indicator={<LoadingOutlined spin />}
                                  size="small"
                                />
                              ) : (
                                <ArrowDownToLine size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                total={totalImage}
                current={page}
                defaultPageSize={10}
                onChange={(pg, size) => {
                  getImages(pg, size);
                  setPage(pg);
                }}
                hideOnSinglePage={true}
              />
            </div>
          ) : (
            !loading.show &&
            location.pathname === "/" && (
              <div className="text-2xl text-gray-400 rounded-lg shadow-lg shadow-black/60 px-4 py-3">
                No image found
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;
