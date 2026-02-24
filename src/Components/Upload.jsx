import React, { useEffect, useState } from "react";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";
import { CheckIcon, Plus } from "lucide-react";
import { Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../config/Security";
import { Button } from "antd";

export const BeforeUpload = () => {
  const [file, setFile] = useState([]);

  if (file.length > 0) return <AfterUpload file={file} setFile={setFile} />;

  return (
    <div className="container mx-auto max-w-screen-2xl flex flex-col w-full items-center justify-center pt-28 pb-8 min-h-screen max-[1600px]:relative">
      <ShootingStars />
      <StarsBackground />
      <div className="flex flex-col w-4/5 items-center justify-center z-50">
        <p className="font-normal text-black dark:text-white text-3xl text-center">
          Share and make others realize how wonderful the world is....
        </p>
        <p className="font-normal text-black/50 dark:text-white/50 text-center">
          Share your photos to introduce yourself to the world
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-y-8 w-4/5 border-2 rounded-lg border-dashed bg-gradient-to-b border-black/10 dark:border-white px-4 py-6 mt-12 bg-black/10 dark:bg-white/10 z-50">
        {/* need to work */}
        <div className="flex items-center justify-center w-full  transform-3d ">
          <img
            src="../image1.jpg"
            alt=""
            className="hidden min-[500px]:block h-[100px]"
          />
          <img
            src="../image1.jpg"
            alt=""
            className="h-[100px] translate-z-[100] rounded-lg border-2 border-white"
          />

          <img
            src="../image1.jpg"
            alt=""
            className="hidden min-[500px]:block h-[100px] rotate-45 -translate-z-50"
          />
        </div>
        <div className="flex items-center justify-center w-full flex-col gap-y-8">
          <p className="text-gray-700 dark:text-white font-normal text-center text-3xl">
            Tap Button Below to Upload
          </p>
          <input
            type="file"
            name="fileInput"
            id="fileInput"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files[0];
              if (files) {
                setFile((prev) => [...prev, files]);
              }
            }}
          />
          <label htmlFor="fileInput" className="">
            <p
              className="rounded-lg  w-full bg-primary hover:bg-secondary text-white px-4 py-2 cursor-pointer transition-all duration-300"
              type="button"
            >
              Browse
            </p>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-base text-black dark:text-white">
          <div className="flex items-start gap-2">
            <span className="text-primary mt-1">
              <CheckIcon />
            </span>
            <p>
              <strong>Original</strong> content you captured
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary mt-1">
              <CheckIcon />
            </span>
            <p>
              <strong>Mindful</strong> of the rights of others
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary mt-1">
              <CheckIcon />
            </span>
            <p>
              <strong>High quality</strong> photos and videos
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary mt-1">
              <CheckIcon />
            </span>
            <p>
              <strong>Excludes</strong> graphic nudity, violence, or hate
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary mt-1">
              <CheckIcon />
            </span>
            <p>
              To be downloaded and <strong>used for free</strong>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary mt-1">
              <CheckIcon />
            </span>
            <p>
              <a href="#" className="underline underline-dotted">
                Read the Pexels Terms
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AfterUpload = ({ file, setFile }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState([
    { file: file[0], title: "", description: "", tags: [] },
  ]);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const formData = new FormData();
    setLoading(true);

    const { files, metaData } = modifiedValue(values);
    files.forEach((item, index) => {
      formData.append("images", item);
    });
    formData.append("metadata", JSON.stringify(metaData));
    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/addImages`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          validateStatus: (status) => status > 0,
        }
      );
      if (res.status == 401) {
        toast.warn("Sign-in to continue");
      }
      toast.success("Image uploaded successfully");
      navigate("/");
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (index) => {
    if (tag.trim().length == 0) {
      return;
    }
    const prevTags = values[index]?.tags || [];
    const newTags = [...prevTags, tag];
    setFieldValue("tags", newTags, index);
    setTag("");
  };

  const removeTag = (i, j) => {
    const prevTags = values[i].tags || [];
    if (prevTags.length == 0) {
      return;
    }
    const newArr = prevTags.filter((t, idx) => idx !== j);
    setFieldValue("tags", newArr, i);
  };

  const modifiedValue = () => {
    const files = values.map((v) => v.file);
    const metaData = values.map((v) => ({
      title: v.title,
      description: v.description,
      tags: v.tags,
    }));
    return { files: files, metaData: metaData };
  };
  const setFieldValue = (name, newValue, index) => {
    const prevValue = values;
    const fieldValue = Array.isArray(newValue) ? newValue : newValue.trim();
    if (fieldValue.length == 0) {
      return;
    }

    const nv = prevValue.map((p, idx) =>
      idx == index ? { ...p, [name]: newValue } : p
    );
    setValues(nv);
  };

  return (
    <div className="min-h-screen container mx-auto max-w-screen-2xl w-full flex items-center justify-center px-4 pt-28 max-[1600px]:relative">
      <ShootingStars />
      <StarsBackground />

      <div className="w-full flex flex-col items-center gap-y-4 relative">
        <div className="flex flex-col items-center gap-y-4 w-full">
          <h1 className="text-black dark:text-white text-3xl text-center">
            Make your photos easy to find and scene
          </h1>
          <p className="text-black dark:text-white font-normal text-center w-3/5">
            The way hashtags make your content discoverable in social media,
            tags will make it easier to find on Pexels. Add some keywords that
            describe your photo and what is in it.
          </p>
        </div>
        <div className="flex items-center gap-x-2 p-4 justify-center mb-6">
          <input
            type="file"
            name="fileInput"
            id="fileInput"
            className="hidden"
            multiple
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setValues((prev) => [
                  ...prev,
                  { file: file, title: "", description: "", tags: [] },
                ]);
                setFile((prev) => [...prev, file]);
              }
            }}
          />
          <div className="scrollBar flex items-center overflow-x-auto scroll-smooth min-w-[200px] w-2/5 max-w-[600px] gap-x-2 ">
            {file.length > 0 &&
              file.map((item, idx) => (
                <div
                  className="flex items-center  border-4 border-primary rounded-lg p-1 flex-wrap min-h-[100px] min-w-[110px]"
                  key={idx}
                >
                  <img
                    src={URL.createObjectURL(item)}
                    alt=""
                    className="min-h-[95px] min-w-[95px] rounded-lg"
                  />
                </div>
              ))}
          </div>
          <label htmlFor="fileInput">
            <div className="flex items-center justify-center text-zinc-600 dark:text-white bg-black/10 dark:bg-white/10 rounded-lg border-2 border-gray-300 h-[100px] w-[100px] cursor-pointer">
              <Plus size={30} />
            </div>
          </label>
        </div>
        <div className="scroll-smooth scrollBar overflow-y-auto w-11/12 flex flex-col items-center p-2 max-h-[420px] gap-y-6">
          {values.length > 0 &&
            values.map((item, i) => (
              <div
                className="flex  items-center gap-x-8 w-full justify-center"
                key={i}
              >
                <div className="flex max-[800px]:flex-col items-center  w-4/5 min-h-[400px] bg-gray-200 dark:bg-zinc-800 rounded-lg py-6">
                  <div className="flex items-center justify-center w-1/2 max-[800px]:w-full">
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt=""
                      className="w-4/5 object-scale-down h-4/5 rounded-lg"
                    />
                  </div>
                  <form
                    action=""
                    className="flex flex-col gap-y-4 w-1/2 p-2 items-center max-[800px]:w-full"
                  >
                    <input
                      type="text"
                      placeholder="Enter your title here"
                      className="p-2 rounded-lg text-black dark:text-white dark:bg-white/10 outline-none focus:outline-none focus:ring-2 focus:ring-primary w-4/5 transition-all duration-300"
                      maxLength={20}
                      onChange={(e) => {
                        const nt = e.target.value;
                        setFieldValue("title", nt, i);
                      }}
                    />
                    {/* this part need some time */}
                    <input
                      type="text"
                      onChange={(e) => {
                        setTag(e.target.value);
                      }}
                      placeholder="Tags for better search"
                      className="p-2 rounded-lg text-black dark:text-white dark:bg-white/10 outline-none focus:outline-none focus:ring-2 focus:ring-primary w-4/5 transition-all duration-300"
                      onKeyDown={(e) => {
                        if (e.key == " " || e.code == "Space") {
                          handleKeyDown(i);
                        }
                      }}
                      value={tag}
                    />
                    <div className="w-full flex items-center flex-wrap gap-2 px-10">
                      {values[i] &&
                        values[i]["tags"].map((item, j) => (
                          <div
                            className="bg-green-100/20 text-green-500 border border-green-700 max-w-[100px] truncate relative rounded-full pl-2 pr-6 p-2 flex items-center"
                            key={j}
                          >
                            <p className="text-sm text-start truncate">
                              {item}
                            </p>
                            <X
                              size={16}
                              className="text-green-700 absolute top-3 right-1"
                              onClick={() => removeTag(i, j)}
                            />
                          </div>
                        ))}
                    </div>
                    <textarea
                      type="text"
                      rows="6"
                      onChange={(e) => {
                        setFieldValue("description", e.target.value, i);
                      }}
                      maxLength={100}
                      placeholder="Some beautiful lines for this image"
                      className="p-2 rounded-lg text-black dark:text-white dark:bg-white/10 outline-none focus:outline-none focus:ring-2 focus:ring-primary w-4/5 transition-all duration-300 text-sm"
                    />
                  </form>
                </div>
                <button title="Delete">
                  <Trash2
                    className="text-gray-600 dark:text-white rounded-full h-11 w-11 bg-gray-200 dark:bg-zinc-800 p-3 cursor-pointer"
                    onClick={() => {
                      const updatedFiles = file?.filter((f, idx) => idx !== i);
                      setFile(updatedFiles);
                      const nv = values.filter((pv, index) => index !== i);
                      setValues(nv);
                    }}
                  />
                </button>
              </div>
            ))}
        </div>
        <div className="sticky bottom-0 z-100  min-h-[80px]  bg-gray-200 dark:bg-zinc-800  min-w-full flex items-center justify-between p-4 rounded ">
          <p className="text-zinc-500 dark:text-white text-base">
            Selected photo : {file.length}
          </p>
          <Button
            size="large"
            onClick={(e) => {
              if (!loading) {
                handleSubmit(e);
              }
            }}
            loading={loading}
            style={{
              backgroundColor: loading ? "#0950b3" : "#1677FF",
              border: loading ? "#0950b3" : "#1677FF",
              color: "white",
            }}
            styles={{
              icon: { color: "white", fontSize: 20 },
              content: {},
            }}
          >
            Submit your photos
          </Button>
          {/* <button
            className="px-6 py-2 bg-primary hover:bg-secondary rounded-lg  text-white font-normal text-center transition-all duration-300"
            onClick={handleSubmit}
            disabled={loading}
          ></button> */}
        </div>
      </div>
    </div>
  );
};
