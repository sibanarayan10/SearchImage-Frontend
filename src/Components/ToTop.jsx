import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react"; // Optional: Install lucide-react or use any icon

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  // Show button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    visible && (
        <button
          onClick={scrollToTop}
          title="Back to Top"
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-secondary text-white p-2 rounded-full shadow-lg transition-all duration-300"
          aria-label="Back to Top"
        >
          <ArrowUp size={24} />
        </button>
    )
  );
};

export default BackToTop;
