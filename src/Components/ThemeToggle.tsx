import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const ThemeToggle: React.FC = () => {
  const getInitialMode = (): ThemeMode => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;
    return saved ?? "system";
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  const applyTheme = (currentMode: ThemeMode): void => {
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
    const handler = (): void => applyTheme("system");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [mode]);

  const cycleMode = (): void => {
    setMode((prev) =>
      prev === "light" ? "dark" : prev === "dark" ? "system" : "light"
    );
  };

  const getIcon = (): React.ReactNode => {
    switch (mode) {
      case "light":
        return <Sun size={30} className="text-yellow-500" />;
      case "dark":
        return <Moon size={30} className="text-blue-500" />;
      case "system":
        return <Monitor size={30} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-center">
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
