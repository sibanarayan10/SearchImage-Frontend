import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CircleUser } from "lucide-react";

const EditProfile = () => {
  const [userDetail, setUserDetail] = useState({});
  const navigate = useNavigate();

  // const [formData, setFormData] = useState({
  //   fullname: userDetail.fullname,
  //   email: userDetail.email,
  //   bio: userDetail.bio ?? "",
  // });
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    bio: "",
    paypalEmail: "",
  });

  const getUserDetail = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/profile`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );
      setUserDetail(response.data.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };
  useEffect(() => {
    if (userDetail) {
      setFormData({
        fullname: userDetail.fullname ?? "",
        email: userDetail.email ?? "",
        bio: userDetail.bio ?? "",
        paypalEmail: userDetail.paypalEmail ?? "",
      });
    }
  }, [userDetail]);

  useEffect(() => {
    getUserDetail();
  }, []);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState();
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data to send to backend
    const data = new FormData();
    data.append("fullname", formData.fullname);
    data.append("paypalEmail", formData.paypalEmail);
    data.append("bio", formData.bio);
    if (profileImage) {
      data.append("profileImage", profileImage); // This is for file upload
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/profile/update`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );
      if (response.status == 200) {
        localStorage.setItem("profileImg", response.data.data.profileImg);
        navigate("/dashboard");
      } else if (response.status == 401) {
        toast.warn("sign-in to continue");
        return;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-28">
      <form
        onSubmit={handleSubmit}
        className="space-y-14 w-full max-w-xl mx-auto text-black/70"
      >
        {/* Profile image upload */}
        <div className="flex flex-col sm:flex-row justify-center items-center max-sm:space-y-12 sm:space-x-12">
          {userDetail.profileImg ? (
            previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile Image"
                className="w-28 h-28 rounded-full object-cover border-4 dark:border-white"
              />
            ) : (
              <img
                src={`https://res.cloudinary.com/dewv14vkx/image/upload/v1/${userDetail.profileImg}`}
                alt="Profile Image"
                className="w-28 h-28 rounded-full object-cover border-4 dark:border-white"
              />
            )
          ) : (
            <CircleUser
              fill="white"
              className="w-28 h-28 text-black rounded-full border-4 dark:border-white"
            />
          )}
          <label className="cursor-pointer bg-primary text-white font-medium px-5 py-3 rounded-lg hover:bg-secondary transition-all duration-300">
            Change Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="font-medium dark:text-white mb-1 block">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="w-full text-[18px] font-medium px-4 py-3 border border-zinc-300 dark:border-none rounded-lg dark:text-white dark:bg-white/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
            />
          </div>
          <div>
            <label className="font-medium dark:text-white mb-1 block">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
              className="w-full text-[18px] font-medium px-4 py-3 border border-zinc-300 dark:border-none rounded-lg dark:text-white dark:bg-white/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <h2 className="text-black dark:text-white text-3xl font-medium mb-2">
            About you
          </h2>
          <label className="font-medium dark:text-white mt-6 mb-2 block">
            Bio
            <span className="text-sm float-right text-zinc-400">
              {formData.bio.length} of 130
            </span>
          </label>
          <textarea
            name="bio"
            maxLength={130}
            value={formData.bio}
            onChange={handleChange}
            // className="w-full border border-zinc-300 rounded-lg px-4 py-2 resize-none"
            className="w-full text-[18px] font-medium px-4 py-3 border border-zinc-300 dark:border-none rounded-lg dark:text-white dark:bg-white/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-zinc-100 focus:dark:bg-white/15 transition-all duration-300 resize-none"
            rows={4}
          />
          <p className="text-sm text-zinc-400 mt-1">
            Brief description for your profile.
          </p>
        </div>

        {/* Submit button */}
        <div className="flex justify-center items-center">
          <button
            type="submit"
            className="bg-primary text-white px-5 py-3 rounded-lg hover:bg-secondary transition-all duration-300 font-medium"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
