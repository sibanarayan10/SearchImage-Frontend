import { useState, useRef, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { X, ArrowDownToLine, Heart, Bookmark, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ImageEngagement } from "../lib/utils";

const Gallery = ({
  backendApi,
  DeleteAndEdit,
  search,
  setHasData = () => {},
  ofUser = false,
}) => {
  const [editFormId, setEditFormId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", desc: "" });
  const [visible, setVisible] = useState(false);
  const [imgMetadata, setImgMetadata] = useState({});
  const [images, setImages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [clientLike, setClientLike] = useState(false);
  const [clientSave, setClientSave] = useState(false);
  const [likedImages, setLikedImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
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

  const lastImageRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreImages();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const loadMoreImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${backendApi}page=${skip}&size=${PAGE_LIMIT}&userSpecific=${ofUser}`,
        {
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );
      if (res.status == 401) {
        toast.warn("Sign-in to continue");
        return;
      }

      const data = res.data.content;
      const newImgs = data.map((i) => ({
        ...i,
        _id: i.imageId,
        cloudinary_publicId: i.imageUrl,
      }));

      if (newImgs.length === 0) {
        setHasMore(false);
      } else {
        setHasData(newImgs.length > 0);
        setImages((prev) => [...prev, ...newImgs]);
        setSkip((prev) => prev + PAGE_LIMIT);
        setSavedImages((prev) => [
          ...prev,
          ...newImgs
            .filter((img) => img.savedByCurrentUser)
            .map((img) => img._id),
        ]);

        setLikedImages((prev) => [
          ...prev,
          ...newImgs
            .filter((img) => img.likedByCurrentUser)
            .map((img) => img._id),
        ]);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setSkip(0);
    setImages([]);
    setHasMore(true);
    loadMoreImages();
  }, [backendApi]);

  const removeItem = async (e) => {
    const imgId = e.currentTarget.id;
    try {
      await axios.delete(`http://localhost:3000/api/user/images/${imgId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        validateStatus: (status) => status > 0,
      });
    } catch (error) {
      console.error("Error deleting image:", error);
    }
    window.location.reload();
  };

  const handleEditClick = (dataItem) => {
    setEditFormId(dataItem._id);

    setEditFormData({ title: dataItem.title || "", desc: dataItem.desc || "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3000/api/user/images/${editFormId}`,
        { title: editFormData.title, desc: editFormData.desc },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setEditFormId(null);
    } catch (error) {
      console.error("Error updating image:", error);
    }
  };

  const toggleLike = async (e, imgId) => {
    e.stopPropagation();
    setLikedImages((prev) =>
      prev.includes(imgId)
        ? prev.filter((id) => id !== imgId)
        : [...prev, imgId]
    );
    setClientLike(!clientLike);
    const response = await axios.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/images/${imgId}/engagements?type=LIKE`,
      undefined,
      {
        // withCredentials: true,
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
    setClientSave(!clientSave);
    const response = await axios.post(
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
    if (response.status == 401) {
      toast.warn("False save!! Sign-in to continue");

      return;
    }
  };
  return (
    <div className="px-8 bg-white dark:bg-[#111111] min-h-screen flex flex-col justify-start items-center pt-16 pb-8 transition-all duration-500 relative ">
      <div
        className={`flex flex-col  ${
          visible ? "items-center" : "items-start"
        } justify-center max-w-[1460px] w-full`}
      >
        {location.pathname == "/" && (
          <h2 className="text-2xl text-[#111111] dark:text-white mb-12">
            Free Stock Images
          </h2>
        )}
        {images.length > 0 && search && (
          <h2 className="text-2xl text-[#111111] dark:text-white mb-12">
            Free <span className="text-primary capitalize">{search}</span>{" "}
            Images
          </h2>
        )}
        {images.length === 0 && search && (
          <h2 className="text-2xl text-[#111111] dark:text-white mb-12">
            No <span className="text-red-500 capitalize">{search}</span> Images
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
                        likedByCurrentUser: dataItem.likedByCurrentUser,
                        uploaderData: {
                          id: dataItem.uploadedBy,
                          name: dataItem.uploadedByUserName,
                        },
                        savedByCurrentUser: dataItem.savedByCurrentUser,
                        isFollowing: dataItem.following,
                      });
                    }}
                    ref={isLast ? lastImageRef : null}
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
                      }}
                      title="Download"
                      className="bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300 absolute bottom-4 right-4 group-hover:opacity-100 opacity-0 z-50 translate-y-3 group-hover:translate-y-0"
                    >
                      <a
                        href={`${dataItem.cloudinary_publicId}`}
                        download={`item1`}
                      >
                        <ArrowDownToLine size={42} className="p-2.5" />
                      </a>
                    </button>
                    <div className="absolute top-0 h-full w-full bg-black/30 rounded-lg pointer-events-none group-hover:opacity-100 opacity-0 transition duration-300" />

                    {DeleteAndEdit && (
                      <div
                        className="absolute bottom-0 right-0 p-2 flex space-x-2"
                        style={{ background: "rgba(0, 0, 0, 0.6)" }}
                      >
                        <button
                          onClick={() => handleEditClick(dataItem)}
                          className="hover:scale-110 transition-all duration-150"
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            style={{ color: "#63E6BE", cursor: "pointer" }}
                          />
                        </button>
                        <button
                          id={dataItem._id}
                          onClick={removeItem}
                          className="hover:scale-110 transition-all duration-150"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{ color: "#FF6B6B", cursor: "pointer" }}
                          />
                        </button>
                      </div>
                    )}

                    {editFormId === dataItem._id && (
                      <form
                        onSubmit={handleEditSubmit}
                        className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-75 p-4"
                      >
                        <input
                          type="text"
                          name="title"
                          placeholder="Title"
                          value={editFormData.title}
                          onChange={handleInputChange}
                          className="mb-2 p-2 rounded"
                        />
                        <input
                          type="text"
                          name="desc"
                          placeholder="Description"
                          value={editFormData.desc}
                          onChange={handleInputChange}
                          className="mb-2 p-2 rounded"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditFormId(null);
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                    {/* <div className="absolute bottom-2 left-2 rounded-full border-white border-2 p-2 ">
                  <UserRoundSearch
                    className="h-4 w-4 text-white"
                    onClick={() => getOwnerDetail(dataItem.owner)}
                  ></UserRoundSearch>
                </div> */}
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
              ofUser={ofUser}
              setVisible={setVisible}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

const ZoomedImage = ({
  uploaderData,
  url,
  setVisible,
  totalLikes,
  imgId,
  ofUser = true,
  likedByCurrentUser,
  isFollowing,
  savedByCurrentUser,
}) => {
  const [clientLike, setClientLike] = useState(false);
  const [clientSave, setClientSave] = useState(false);
  const [clientFollow, setClientFollow] = useState(isFollowing);
  const [ownerId, setOwnerId] = useState(uploaderData.id);
  const [uploadedBy, setUploadedBy] = useState(uploaderData.name);
  const [totalLike, setTotalLike] = useState(totalLikes);

  const navigate = useNavigate();

  const toggleFollow = async () => {
    setClientFollow(!clientFollow);
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/user/${ownerId}/toggleFollow`,
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
  const toggleLike = async () => {
    setClientLike(!clientLike);
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/images/${imgId}/engagements?type=LIKE
      `,
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
      toast.warn("False like!! Sign-in to continue");

      return;
    }
  };
  const toggleSave = async () => {
    setClientSave(!clientSave);
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/images/${imgId}/engagements?type=SAVE
      `,
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
      toast.warn("False save!! Sign-in to continue");

      return;
    }
  };
  const handleClick = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/images/${imgId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );
      toast.success("Image deleted successfully");
    } catch (error) {}
  };
  return (
    <div className="flex items-center p-4 relative bg-white dark:bg-[#111111] rounded-xl shadow-xl shadow-black/70">
      <div className="flex items-center flex-col w-full gap-y-8">
        <div className="flex max-sm:flex-col max-sm:gap-y-4 items-start justify-between w-11/12">
          <div className="userProfile flex items-center w-full gap-x-1">
            <img src="./person.png" alt="" className="h-14 w-14 rounded-full" />
            <div className="flex flex-col items-start justify-center">
              <p className="dark:text-white font-medium text-left text-lg/5">
                {uploadedBy}
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
              onClick={toggleSave}
            >
              <Bookmark
                size={24}
                className={`transition-all duration-200
                ${
                  savedByCurrentUser
                    ? "fill-black/60 dark:fill-white/70"
                    : "fill-transparent text-black/70 dark:text-white"
                }`}
                strokeWidth={savedByCurrentUser ? 0 : 2}
              />

              <p className="max-lg:hidden font-medium dark:text-white">Save</p>
            </div>
            <div
              className="flex items-center justify-center border border-black/20 dark:border-white/20 px-3 lg:px-7 py-3 rounded-lg gap-x-2 hover:border-black/60 hover:bg-black/10 dark:hover:border-white/60 dark:hover:bg-white/10 cursor-pointer transition-all duration-300"
              onClick={toggleLike}
            >
              <Heart
                size={24}
                className={`transition-all duration-200
                ${
                  likedByCurrentUser
                    ? "fill-pink-500"
                    : "fill-transparent text-black/70 dark:text-white"
                }`}
                strokeWidth={likedByCurrentUser ? 0 : 2}
              />

              <p className="font-medium dark:text-white flex gap-1">
                <span className="max-lg:hidden">Like</span>
                {totalLike}
              </p>
            </div>
            <div className="w-max flex items-center justify-center space-x-4 px-4 py-3 rounded-lg bg-primary hover:bg-secondary cursor-pointer transition-all duration-300">
              <a
                className="font-medium text-white flex gap-3"
                href={`${url}`}
                download={`${url}`}
              >
                <span className="max-md:hidden">Free Download</span>
                <ArrowDownToLine size={24} className="text-white" />
              </a>
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
        {ofUser && (
          <button
            title="Delete"
            className="flex justify-end items-center w-full"
            onClick={() => {
              handleClick();
              navigate("/dashboard");
              setVisible(false);
            }}
          >
            <Trash2
              size={24}
              className="text-zinc-600 dark:text-white rounded-full h-11 w-11 bg-gray-200 dark:bg-zinc-800 p-3"
            />
          </button>
        )}
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
