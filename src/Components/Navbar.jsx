import { React, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Album } from "lucide-react";

const Navbar = ({ setLogout }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const [isBackground, setIsBackground] = useState(false);

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
            <Link
              to={`/user/upload`}
              className={`bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-medium ring-1 ring-[#111111] dark:ring-white hover:ring-0 text-center px-4 py-3 rounded-lg transition-all duration-300 capitalize`}
              onClick={() => setIsOpen(false)}
            >
              Upload
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Navbar;
