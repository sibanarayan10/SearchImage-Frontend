import { React, useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { User, CircleUser, Album } from "lucide-react";
import { TableOfContents } from "lucide-react";
import { Context } from "../Context/globalContext";

const Navbar = ({ setLogout }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navItems = ["upload"];
  const { userAuth } = useContext(Context);
  const [navigate, setNavigate] = useState("");
  const location = useLocation();
  const [isBackground, setIsBackground] = useState(false);
  const navigateTo = useNavigate();

  const handleUserAuth = async () => {
    if (!userAuth) {
      return;
    }
    setLogout(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/user/log-out",
        {
          headers: {
            "Content-type": "application/json",
          },
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );
      if (response.status == 200) {
        setNavigate("/sign-in");
      }
    } catch (error) {
      console.error("error in navbar", error);
    }
  };
  const hideNavbar = ["/sign-up", "/sign-in"];

  useEffect(() => {
    const handleScroll = () => {
      // If you scroll down 50px, make it sticky
      if (window.scrollY > 50) {
        setIsBackground(true);
      } else {
        setIsBackground(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isBackground]);
  const rawProfileImg = localStorage.getItem("profileImg");
  const profileImg =
    rawProfileImg && rawProfileImg !== "undefined" ? rawProfileImg : null;

  return !hideNavbar.includes(location.pathname) ? (
    <div
      className={`${
        isBackground
          ? "bg-white dark:bg-[#111111] bg-opacity-[0.9] backdrop-blur"
          : "bg-transparent"
      } w-full fixed top-0 flex justify-center transition-all duration-300 z-[100]`}
    >
      <div className="container mx-auto w-full max-w-[1460px]">
        <div className="flex flex-row justify-between items-center max-[768px]:items-start py-4 px-8 2xl:px-0 w-full">
          <div className="flex flex-row justify-start items-center min-[475px]:w-1/2 w-1/3 ">
            <div className="logo flex items-center justify-center py-2 md:w-1/3 ">
              <Link
                to="/"
                className="primaryIcon text-2xl text-[#111111] dark:text-gray-100 font-semibold hover:opacity-70 transition-all duration-300 w-full"
              >
                <span className="max-[400px]:hidden">ImageGallery</span>
                <Album size={30} className="min-[400px]:hidden" />
              </Link>
            </div>
          </div>

          <div className="flex flex-row items-center justify-end  gap-x-4 min-[475px]:w-1/2 w-2/3 ">
            <div
              className={`
                  ${localStorage.getItem("user") ? "hidden" : "flex"}
               justify-center items-center`}
            >
              <Link to="/sign-in">
                <button
                  type="button"
                  className="flex p-1.5 text-center dark:text-white rounded-full transition-all duration-300 hover:bg-black/15 dark:hover:bg-white/10"
                  onClick={handleUserAuth}
                >
                  <span>
                    <User size={30} />
                  </span>
                </button>
              </Link>
            </div>

            <Link
              to={`/user/upload`}
              className={`${
                localStorage.getItem("user") ? "hidden sm:flex" : "hidden"
              } bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-medium ring-1 ring-[#111111] dark:ring-white hover:ring-0 text-center px-4 py-3 rounded-lg transition-all duration-300 capitalize`}
              onClick={() => setIsOpen(false)}
            >
              Upload
            </Link>

            <button
              title="Profile"
              onClick={() => navigateTo("/dashboard")}
              className={`${
                localStorage.getItem("user") ? "flex" : "hidden"
              } h-10 w-10 rounded-full overflow-hidden`}
            >
              {profileImg ? (
                <img
                  src={`https://res.cloudinary.com/dewv14vkx/image/upload/v1/${profileImg}`}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <CircleUser className="h-full w-full dark:text-white" />
              )}
            </button>

            <ThemeToggle />

            {/* <div className="hidden max-[768px]:flex">
              <TableOfContents
                className="text-white hover:scale-110 transition-all duration-150 cursor-pointer w-4"
                onClick={() => setIsOpen((prev) => !prev)}
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Navbar;
