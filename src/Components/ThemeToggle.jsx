import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeToggle = () => {
  const getInitialMode = () => {
    const saved = localStorage.getItem("theme");
    return saved || "system";
  };

  const [mode, setMode] = useState(getInitialMode);

  const applyTheme = (currentMode) => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (currentMode === "dark" || (currentMode === "system" && prefersDark)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    localStorage.setItem("theme", mode);
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [mode]);

  const cycleMode = () => {
    setMode((prev) =>
      prev === "light" ? "dark" : prev === "dark" ? "system" : "light"
    );
  };

  const getIcon = () => {
    switch (mode) {
      case "light":
        return <Sun size={30} className="text-yellow-500" />;
      case "dark":
        return <Moon size={30} className="text-blue-500" />;
      case "system":
        return <Monitor size={30} className="text-gray-500" />;
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center justify-center">
      {/* <button
        onClick={cycleMode}
        className="relative w-28 h-10 bg-gray-200 dark:bg-zinc-700 rounded-full shadow-inner flex items-center px-2 transition-colors duration-300 outline-none focus:outline-none"
      >
        <div
          className={`absolute top-1 left-1 h-8 w-8 bg-white dark:bg-black rounded-full shadow-md transform transition-all duration-300 ${
            mode === "light"
              ? "translate-x-0"
              : mode === "dark"
              ? "translate-x-[4.5rem]"
              : "translate-x-[2.2rem]"
          }`}
        ></div>
        <div className="flex justify-between w-full z-10 text-sm font-semibold text-gray-600 dark:text-gray-300">
          <span className="">
            <Sun size={20} className="text-yellow-500" />
          </span>
          <span className="">
            <Monitor size={20} className="text-gray-500" />
          </span>
          <span className="">
            <Moon size={20} className="text-blue-500" />
          </span>
        </div>
      </button> */}
      <button
        onClick={cycleMode}
        className="p-2 bg-neutral-300 dark:bg-white/10 rounded-full text-2xl transition-all duration-300 outline-none focus:outline-none"
      >
        {getIcon()}
      </button>
    </div>
  );
};

export default ThemeToggle;
