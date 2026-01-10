import { useState } from "react";

const ScrollingText = () => {
  const [visible, setVisible] = useState(true);
  return (
    visible && (
      <div className="mx-auto w-full max-w-screen-2xl overflow-hidden bg-white py-2 relative ">
        <div className="whitespace-nowrap mx-8  overflow-hidden">
          <p className="text-black text-sm animate-marquee font-normal ">
            🚀 Welcome to our website! ℹ️ This site is currently hosted on a
            free-tier plan, which may cause slight delays in loading times.
            Thank you for your patience. 🙌
          </p>
        </div>
        <div
          className="absolute right-2 top-2 cursor-pointer"
          onClick={() => setVisible(false)}
        >
          <img
            src="./cross.png"
            alt=""
            srcset=""
            className="object-scale-down h-5 w-5"
          />
        </div>
      </div>
    )
  );
};

export default ScrollingText;
