import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";
import { CheckIcon, Plus } from "lucide-react";
import { Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  const [uploadFile, setUploadFile] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async () => {
    const formData = new FormData();
    uploadFile.forEach((item, index) => {
      formData.append("images", item.file); // all images under same field name
      formData.append(`metadata[${index}][title]`, item.title);
      formData.append(`metadata[${index}][desc]`, item.desc);
      formData.append(`metadata[${index}][tags]`, JSON.stringify(item.tag));
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/addImages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
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
    }
  };

  const handleKeyDown = (e, index) => {
    const tagz = uploadFile[index]["tag"];
    if (e.target.value.trim().length <= 5) {
      return;
    }

    if (e.key === " " && inputVal.trim() !== "") {
      e.preventDefault();
      if (!tagz.includes(inputVal.trim())) {
        tagz.push(inputVal);
      }
      setInputVal("");
    }
  };

  // this need to be handled
  const handleRemove = (i, j) => {
    const tag = uploadFile[i]["tag"];
    const updatedTag = tag.filter((item, index) => index !== j);
  };

  useEffect(() => {
    if (file.length <= uploadFile.length) {
      return;
    }
    const latestUploadedFile = file[file.length - 1];
    setUploadFile((prev) => [
      ...prev,
      {
        file: latestUploadedFile,
        title: "",
        desc: "",
        tag: [],
      },
    ]);
  }, [file]);

  const handleMetadataChange = (index, field, value) => {
    const updated = [...uploadFile];
    updated[index][field] = value;
    setUploadFile(updated);
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
              const files = e.target.files[0];
              if (files) {
                setFile((prev) => [...prev, files]);
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
          {file.map((item, i) => (
            <div
              className="flex  items-center gap-x-8 w-full justify-center"
              key={i}
            >
              <div className="flex max-[800px]:flex-col items-center  w-4/5 min-h-[400px] bg-gray-200 dark:bg-zinc-800 rounded-lg py-6">
                <div className="flex items-center justify-center w-1/2 max-[800px]:w-full">
                  <img
                    src={URL.createObjectURL(item)}
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
                    onChange={(e) =>
                      handleMetadataChange(i, "title", e.target.value)
                    }
                  />
                  {/* this part need some time */}
                  <input
                    type="text"
                    onChange={(e) => {
                      setInputVal(e.target.value);
                    }}
                    placeholder="Tags for better search"
                    className="p-2 rounded-lg text-black dark:text-white dark:bg-white/10 outline-none focus:outline-none focus:ring-2 focus:ring-primary w-4/5 transition-all duration-300"
                    onKeyDown={(e) => handleKeyDown(e, i)}
                  />
                  <div className="w-full flex items-center flex-wrap gap-2 px-10">
                    {uploadFile[i] &&
                      uploadFile[i]["tag"].map((item, j) => (
                        <div
                          className="bg-green-100/20 text-green-500 border border-green-700 max-w-[100px] truncate relative rounded-full pl-2 pr-6 p-2 flex items-center"
                          key={j}
                        >
                          <p className="text-sm text-start truncate">{item}</p>
                          <X
                            size={16}
                            className="text-green-700 absolute top-3 right-1"
                            onClick={() => handleRemove(i, j)}
                          />
                        </div>
                      ))}
                  </div>
                  <textarea
                    type="text"
                    rows="6"
                    onChange={(e) =>
                      handleMetadataChange(i, "desc", e.target.value)
                    }
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
                    const newFile = file.filter((itm) => itm !== item);
                    const toBeUpload = uploadFile.filter((item, j) => i !== j);
                    setUploadFile(toBeUpload);
                    setFile(newFile);
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
          <button
            className="px-6 py-2 bg-primary hover:bg-secondary rounded-lg  text-white font-normal text-center transition-all duration-300"
            onClick={handleSubmit}
          >
            Submit your photos
          </button>
        </div>
      </div>
    </div>
  );
};
