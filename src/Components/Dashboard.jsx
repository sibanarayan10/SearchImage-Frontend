import React, { useEffect, useState } from "react";
import { Edit, LogOut, CircleUser } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Gallery from "./Gallery";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("My Uploads");
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState({});
  const [hasSavedImages, setHasSavedImages] = useState(false);
  const [hasUploadImages, setHasUploadImages] = useState(false);
  const [userUploads, setUserUploads] = useState([]);
  const [likedImage, setLikedImage] = useState([]);
  const tabs = ["My Uploads", "Saved"];
  const getUserDetail = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/details`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );
      setUserDetail(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    getUserDetail();
  }, []);

  const loadMoreImages = async () => {
    try {
      const res = await axios.get(
        `${backendApi}page=${0}&size=${10}&userSpecific=${true}`,
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
        setHasUploadImages(false);
      } else {
        setHasUploadImages(true);
        setUserUploads((prev) => [...prev, ...newImgs]);
        // setSkip((prev) => prev + PAGE_LIMIT);
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
  };

  useEffect(() => {
    if (userUploads.length == 0) {
      loadMoreImages();
    }
  }, [activeTab]);
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/log-out`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );
      if (response.status === 200) {
        if (localStorage.getItem("profileImg")) {
          localStorage.removeItem("profileImg");
        }
        localStorage.removeItem("user");
        navigate("/sign-in");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] text-center px-6 py-28">
      <div className="flex flex-col items-center gap-6">
        {/* Profile Image */}
        {userDetail.imgUrl ? (
          <img
            src={`https://res.cloudinary.com/dewv14vkx/image/upload/v1/${userDetail.imgUrl}`}
            alt="Profile Image"
            className="w-28 h-28 rounded-full object-cover border-4 dark:border-white"
          />
        ) : (
          <CircleUser
            fill="white"
            className="w-28 h-28 rounded-full border-4 dark:border-white"
          />
        )}

        <div className="flex flex-col items-center gap-2">
          {/* Bio */}
          {userDetail.bio && (
            <p className="text-lg text-zinc-700 dark:text-white/70 px-5 py-2 rounded-lg bg-gray-200 dark:bg-white/5 relative w-fit max-w-md">
              <span className="absolute left-2 -top-4 bg-zinc-200 dark:bg-neutral-700 px-3 text-base text-zinc-500 dark:text-white border-2 border-black/10 dark:border-neutral-600 rounded-lg">
                Bio
              </span>
              {userDetail.bio}
            </p>
          )}

          {/* Name */}
          <h1 className="text-5xl font-medium dark:text-white">
            {userDetail.name}
          </h1>

          {/* Email */}
          <p className="text-lg text-zinc-700 dark:text-white/70">
            {userDetail.email}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-5 py-3 rounded-full transition-all duration-300 font-medium dark:text-white hover:bg-gray-200 dark:hover:bg-white/5 hover:tracking-wide">
            Following
            <span className="ml-2 text-gray-400">
              {userDetail.followingCount || 0}
            </span>
          </button>
          <button className="px-5 py-3 rounded-full transition-all duration-300 font-medium dark:text-white hover:bg-gray-200 dark:hover:bg-white/5 hover:tracking-wide">
            Followers
            <span className="ml-2 text-gray-400">
              {userDetail.followerCount || 0}
            </span>
          </button>
        </div>

        {/* Edit Profile and Logout Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/edit-profile")}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-secondary transition-all duration-300"
          >
            <Edit size={20} />
            Edit profile
          </button>

          <button
            onClick={() => {
              handleLogout(), navigate("/");
            }}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white font-medium rounded-lg shadow hover:bg-red-700 transition-all duration-300"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Nav Tabs */}
        <div className="w-full max-w-[1460px] flex flex-wrap gap-4 mt-20 pl-8 font-medium text-gray-700 dark:text-white">
          <button
            onClick={() => setActiveTab("My Uploads")}
            className={`px-5 py-3 rounded-full transition-all duration-300 ${
              activeTab === "My Uploads"
                ? "bg-black dark:bg-white text-white dark:text-black tracking-wide"
                : "text-black/70 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5"
            }`}
          >
            {`My Uploads`}{" "}
            {activeTab == "My Uploads" && (
              <span className="text-gray-400">
                {userDetail?.totalUploadsCount || 0}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("Saved")}
            className={`px-5 py-3 rounded-full transition-all duration-300 ${
              activeTab === "Saved"
                ? "bg-black dark:bg-white text-white dark:text-black tracking-wide"
                : "text-black/70 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5"
            }`}
          >
            {`Saved`}{" "}
            {activeTab == "Saved" && (
              <span className="text-gray-400">
                {userDetail?.totalSavedImage || 0}
              </span>
            )}
          </button>
        </div>
        {activeTab === "My Uploads" && (
          <div
            className={` text-lg text-neutral-700 dark:text-white/70 rounded-lg   flex items-start   ${
              hasUploadImages
                ? "justify-start "
                : "justify-center mt-8 p-10 w-full max-w-4xl"
            } `}
          >
            {hasUploadImages === false && (
              <p className="border-2 border-zinc-300 bg-gray-200 dark:border-white/5 dark:bg-white/5 rounded-lg p-14 font-medium">
                No uploads yet? Share your creativity with the world! Upload
                your best shots, artwork, or ideas and watch your collection
                grow.
              </p>
            )}
            <div className={`${hasUploadImages ? "w-full" : "hidden"}`}>
              <Gallery
                backendApi={`${import.meta.env.VITE_BACKEND_URL}/images?`}
                setHasData={(exist) => setHasUploadImages(exist)}
                ofUser={true}
              />
            </div>
          </div>
        )}
        {activeTab === "Saved" && (
          <div
            className={` text-lg text-neutral-700 dark:text-white/70 rounded-lg flex items-start   ${
              hasSavedImages
                ? "justify-start "
                : "justify-center mt-8 p-10 w-full max-w-4xl"
            } `}
          >
            <div className={`${hasSavedImages ? "w-full" : "hidden"}`}>
              <Gallery
                backendApi={`${
                  import.meta.env.VITE_BACKEND_URL
                }/images?savedOnly=${true}&`}
                setHasData={(exist) => setHasSavedImages(exist)}
              />
            </div>
            {hasSavedImages === false && (
              <p className="border-2 border-zinc-300 bg-gray-200 dark:border-white/5 dark:bg-white/5 rounded-lg p-14 font-medium">
                You haven’t saved any images yet. Start saving your favorites so
                you can find them easily later — your personal gallery is just
                waiting to be filled!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
