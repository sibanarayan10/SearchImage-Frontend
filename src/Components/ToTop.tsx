import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      title="Back to Top"
      aria-label="Back to Top"
      className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-secondary text-white p-2 rounded-full shadow-lg transition-all duration-300"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTop;
