import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Album, LogIn, LogOut, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";

interface NavbarProps {
  setLogout: (val: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setLogout }) => {
  const [isBackground, setIsBackground] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("user"));
  });
  const location = useLocation();

  const hideNavbar = ["/sign-up", "/sign-in"];

  useEffect(() => {
    const handleScroll = (): void => {
      setIsBackground(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync login state on route changes
  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("user")));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setLogout(true);
    toast.info("Signed out successfully");
  };

  if (hideNavbar.includes(location.pathname)) return <></>;

  return (
    <div
      className={`${
        isBackground
          ? "bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      } w-full fixed top-0 flex justify-center transition-all duration-300 z-[100]`}
    >
      <div className="container mx-auto w-full max-w-[1460px]">
        <div className="flex flex-row justify-between items-center py-4 px-8 2xl:px-0 w-full">
          {/* Logo */}
          <div className="flex flex-row justify-start items-center">
            <Link
              to="/"
              className="primaryIcon text-xl md:text-2xl text-[#111111] dark:text-gray-100 font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
            >
              <Album size={26} className="text-emerald-500" />
              <span>ImageGallery</span>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex flex-row items-center justify-end gap-x-3 sm:gap-x-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/sign-in"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-500/20"
                >
                  Join Free
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/user/upload"
                  className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-medium text-xs sm:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 hover:opacity-90"
                >
                  <UploadCloud size={15} />
                  <span>Upload</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-2.5 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
