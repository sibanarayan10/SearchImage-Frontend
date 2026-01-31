import { useState, useRef, useCallback, useEffect } from "react";
import { X, ArrowDownToLine, Heart, Bookmark, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../config/Security";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
const Gallery = ({
  backendApi,
  search,
  setHasData = () => {},
  ofUser = false,
  onTabChange,
}) => {
  const [visible, setVisible] = useState(false);
  const [imgMetadata, setImgMetadata] = useState({});
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [likedImages, setLikedImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [downloading, setDownloading] = useState(false);

  const observer = useRef();
  const PAGE_LIMIT = 10;

  const location = useLocation();

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  const lastImageRef = (node) => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        getImages();
      }
    });

    if (node) observer.current.observe(node);
  };
  const setImageEngagements = (imgs = []) => {
    if (imgs.length == 0) {
      return;
    }
    setImages([...imgs]);
    const savedImgIds = [],
      likedImgIds = [];
    imgs.map((img) => {
      if (img.savedByCurrentUser) {
        savedImgIds.push(img.imageId);
      }
      if (img.likedByCurrentUser) {
        likedImgIds.push(img.imageId);
      }
    });
    setLikedImages(likedImgIds);
    setSavedImages(savedImgIds);
  };
  const getImages = async (loadNew = false) => {
    setLoading(true);
    let userUploaded = false,
      savedOnly = false;

    switch (activeTab) {
      case "Uploads": {
        userUploaded = true;
        break;
      }
      case "Saved": {
        savedOnly = true;
        break;
      }
    }
    try {
      const res = await api.get(
        `${backendApi}page=${page}&size=${PAGE_LIMIT}&userSpecific=${userUploaded}&savedOnly=${savedOnly}`,
        {
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );
      const data = res.data.content;
      const newImgs = data.map((i) => ({
        ...i,
        _id: i.imageId,
        cloudinary_publicId: i.imageUrl,
      }));
      if (loadNew) {
        setImageEngagements(newImgs);
      } else {
        setHasMore(newImgs.length === PAGE_LIMIT);
        setPage((prev) => prev + 1);
        const newImages = [...images, ...newImgs];
        setImageEngagements(newImages);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  };
  const toggleLike = async (e, imgId) => {
    e.stopPropagation();
    setLikedImages((prev) =>
      prev.includes(imgId)
        ? prev.filter((id) => id !== imgId)
        : [...prev, imgId]
    );
    const response = await api.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/images/${imgId}/engagements?type=LIKE`,
      undefined,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: (status) => status > 0,
      }
    );
    if (response.status == 401) {
      toast.warn("False like!! Sign-in to continue");
      return;
    }
  };
  const toggleSave = async (e, imgId) => {
    e.stopPropagation();
    setSavedImages((prev) =>
      prev.includes(imgId)
        ? prev.filter((id) => id !== imgId)
        : [...prev, imgId]
    );
    if (savedImages.includes(imgId) && activeTab === "Saved") {
      const updatedImages = images.filter((img) => img.imageId !== imgId);
      setImages(updatedImages);
    }
    const response = await api.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/images/${imgId}/engagements?type=SAVE`,
      {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: (status) => status > 0,
      }
    );
  };
  const downloadImage = async (imgId) => {
    setDownloading(true);
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/images/${imgId}/download`,
        { responseType: "blob" }
      );

      const blob = res.data;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${imgId}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    getImages(true);
  }, [activeTab, search]);

  return (
    <div className="px-8 bg-white dark:bg-[#111111] border-white min-h-screen flex flex-col justify-start items-center pt-16 pb-8 transition-all duration-500 relative ">
      {loading ? (
        <div
          className="flex items-center justify-center  border-red-500"
          style={{ height: "calc(100vh - 550px)" }}
        >
          <Spin size="large" tip="Loading..." />
        </div>
      ) : (
        <div
          className={`flex flex-col  ${
            visible ? "items-center" : "items-start"
          } justify-center max-w-[1460px] w-full`}
        >
          {location.pathname == "/" && (
            <div
              className={`flex flex-row justify-start gap-5 max-w-[1460px] w-full`}
            >
              {["All", "Uploads", "Saved"].map((item) => (
                <button
                  onClick={() => {
                    onTabChange(true);
                    setPage(0);
                    setActiveTab(item);
                  }}
                  className={`px-5 py-3 rounded-full transition-all duration-300 mb-5 ${
                    activeTab === item
                      ? "bg-black dark:bg-white text-white dark:text-black tracking-wide"
                      : "text-black/70 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="text-gray-400">{item}</span>
                </button>
              ))}
            </div>
          )}
          {images.length > 0 && search && (
            <h2 className="text-2xl text-[#111111] dark:text-white mb-12">
              Free <span className="text-primary capitalize">{search}</span>{" "}
              Images
            </h2>
          )}
          {images.length === 0 && search && (
            <h2 className="text-2xl text-[#111111] dark:text-white mb-12">
              No <span className="text-red-500 capitalize">{search}</span>{" "}
              Images
            </h2>
          )}
          {images.length > 0 ? (
            <>
              <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
                {images.map((dataItem, index) => {
                  const isLast = index === images.length - 1;
                  return (
                    <div
                      key={index}
                      className="appearOnScroll rounded-lg h-auto w-auto group relative"
                      onClick={() => {
                        setVisible(!visible);
                        setImgMetadata({
                          url: dataItem.cloudinary_publicId,
                          imgId: dataItem._id,
                          totalLikes: dataItem.totalLikes,
                          likedByCurrentUser: likedImages.includes(
                            dataItem._id
                          ),
                          uploaderData: {
                            id: dataItem.uploadedBy,
                            name: dataItem.uploadedByUserName,
                          },
                          savedByCurrentUser: savedImages.includes(
                            dataItem._id
                          ),
                          isFollowing: dataItem.following,
                        });
                      }}
                      ref={isLast && hasMore ? lastImageRef : null}
                    >
                      <img
                        src={`${dataItem.cloudinary_publicId}`}
                        alt="Cloudinary asset"
                        className="h-full w-full mb-4 rounded-lg bg-black/10 dark:bg-white transition-transform duration-300"
                      />

                      <div className="absolute top-3 right-4 flex items-center space-x-2 z-50 group">
                        <button
                          title="Save"
                          className={`cursor-pointer rounded-lg transition-all duration-300 ${
                            savedImages.includes(dataItem._id)
                              ? dataItem?.likedByCurrentUser
                                ? "opacity-100 translate-x-0"
                                : "opacity-100 translate-x-12 group-hover:translate-x-0"
                              : "opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0"
                          } ${
                            savedImages.includes(dataItem._id)
                              ? "bg-zinc-500"
                              : "hover:bg-white/20"
                          }`}
                          onClick={(e) => toggleSave(e, dataItem._id)}
                        >
                          <Bookmark size={44} className="p-2.5 text-white" />
                        </button>

                        <button
                          title="Like"
                          className={`cursor-pointer rounded-lg transition-all duration-300 ${
                            likedImages.includes(dataItem._id)
                              ? savedImages.includes(dataItem._id)
                                ? "opacity-100 translate-x-0"
                                : "opacity-100 translate-x-0 group-hover:translate-x-0"
                              : "opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0"
                          } ${
                            likedImages.includes(dataItem._id)
                              ? "bg-pink-500"
                              : "hover:bg-white/20"
                          }`}
                          onClick={(e) => toggleLike(e, dataItem._id)}
                        >
                          <Heart size={44} className="p-2.5 text-white" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(dataItem._id);
                        }}
                        title="Download"
                        className=" flex items-center  bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300 absolute bottom-4 right-4 group-hover:opacity-100 opacity-0 z-50 translate-y-3 group-hover:translate-y-0"
                        disabled={downloading}
                      >
                        <ArrowDownToLine size={42} className="p-2.5" />
                      </button>
                      <div className="absolute top-0 h-full w-full bg-black/30 rounded-lg pointer-events-none group-hover:opacity-100 opacity-0 transition duration-300" />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            !loading &&
            images.length === 0 &&
            location.pathname === "/" && (
              <div className="text-2xl text-gray-400 rounded-lg shadow-lg shadow-black/60 px-4 py-3">
                No image found
              </div>
            )
          )}
        </div>
      )}

      {visible && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/80 z-[100] flex items-center justify-center"
          id="image"
        >
          <div
            className="scrollBar w-full max-w-5xl xl:max-w-7xl absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 max-h-screen overflow-scroll px-12 py-8"
            id="image"
          >
            <ZoomedImage
              {...imgMetadata}
              setImgMetadata={setImgMetadata}
              ofUser={ofUser}
              setVisible={setVisible}
              onDownload={(imgId) => downloadImage(imgId)}
              downloading={downloading}
              setDownloading={setDownloading}
              toggleLike={(e, imgId) => toggleLike(e, imgId)}
              toggleSave={(e, imgId) => toggleSave(e, imgId)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

const ZoomedImage = ({
  setImgMetadata,
  uploaderData,
  url,
  setVisible,
  totalLikes,
  imgId,
  likedByCurrentUser,
  isFollowing,
  savedByCurrentUser,
  onDownload,
  downloading,
  setDownloading,
  toggleLike,
  toggleSave,
}) => {
  const [isLiked, setIsLiked] = useState(likedByCurrentUser);
  const [isSaved, setIsSaved] = useState(savedByCurrentUser);
  const [clientFollow, setClientFollow] = useState(isFollowing);

  const toggleFollow = async () => {
    setClientFollow(!clientFollow);
    const response = await api.post(
      `${import.meta.env.VITE_BACKEND_URL}/user/${
        uploaderData.id
      }/toggleFollow`,
      {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: (status) => status > 0,
      }
    );
    if (response.status == 401) {
      toast.warn("Sign-in to continue");
      return;
    }
  };

  return (
    <div className="flex items-center p-4 relative bg-white dark:bg-[#111111] rounded-xl shadow-xl shadow-black/70">
      <div className="flex items-center flex-col w-full gap-y-8">
        <div className="flex max-sm:flex-col max-sm:gap-y-4 items-start justify-between w-11/12">
          <div className="userProfile flex items-center w-full gap-x-1">
            <img src="./person.png" alt="" className="h-14 w-14 rounded-full" />
            <div className="flex flex-col items-start justify-center">
              <p className="dark:text-white font-medium text-left text-lg/5">
                {uploaderData.name}
              </p>
              <button
                className={`mt-1 text-base ${
                  clientFollow
                    ? "text-primary text-left font-medium"
                    : "dark:text-white"
                } hover:text-primary dark:hover:text-primary transition-all duration-300`}
                onClick={toggleFollow}
              >
                {clientFollow ? "Following" : "Follow"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-x-4 w-4/5">
            <div
              className="flex items-center justify-center border border-black/20 dark:border-white/20 px-3.5 py-3.5 lg:px-8 lg:py-3 rounded-lg gap-x-2 hover:border-black/60 hover:bg-black/10 dark:hover:border-white/60 dark:hover:bg-white/10 cursor-pointer transition-all duration-300"
              onClick={(e) => {
                setImgMetadata((p) => ({
                  ...p,
                  savedByCurrentUser: !savedByCurrentUser,
                }));

                setIsSaved((p) => !p);
                toggleSave(e, imgId);
              }}
            >
              <Bookmark
                size={24}
                className={`transition-all duration-200
                ${
                  isSaved
                    ? "fill-black/60 dark:fill-white/70"
                    : "fill-transparent text-black/70 dark:text-white"
                }`}
                strokeWidth={isSaved ? 0 : 2}
              />

              <p className="max-lg:hidden font-medium dark:text-white">Save</p>
            </div>
            <div
              className="flex items-center justify-center border border-black/20 dark:border-white/20 px-3 lg:px-7 py-3 rounded-lg gap-x-2 hover:border-black/60 hover:bg-black/10 dark:hover:border-white/60 dark:hover:bg-white/10 cursor-pointer transition-all duration-300"
              onClick={(e) => {
                setImgMetadata((p) => ({
                  ...p,
                  likedByCurrentUser: !likedByCurrentUser,
                }));

                setIsLiked((p) => !p);
                toggleLike(e, imgId);
              }}
            >
              <Heart
                size={24}
                className={`transition-all duration-200
                ${
                  isLiked
                    ? "fill-pink-500"
                    : "fill-transparent text-black/70 dark:text-white"
                }`}
                strokeWidth={isLiked ? 0 : 2}
              />

              <p className="font-medium dark:text-white flex gap-1">
                <span className="max-lg:hidden">Like</span>
                {totalLikes}
              </p>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setDownloading(true);
                onDownload(imgId);
              }}
              className="w-max flex items-center border border-black/20 dark:border-white/20  justify-center space-x-4 px-4 py-3 rounded-lg fill-transparent cursor-pointer transition-all duration-300"
            >
              <button
                className="font-medium text-white flex gap-3"
                disabled={downloading}
              >
                <span className="max-md:hidden text-black/70 dark:text-white">
                  Free Download
                </span>
                {downloading ? (
                  <Spin indicator={<LoadingOutlined spin />} size="large" />
                ) : (
                  <ArrowDownToLine
                    size={24}
                    className="text-black/70 dark:text-white"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="w-4/5  flex items-center justify-center">
          <img
            src={`${url}`}
            alt=""
            className="w-full  max-h-[600px] object-contain"
          />
        </div>
      </div>
      <div
        className="absolute -left-12 top-2 cursor-pointer"
        onClick={() => setVisible(false)}
      >
        <X className="text-white font-bold text-lg" size={30} strokeWidth={2} />
      </div>
    </div>
  );
};
