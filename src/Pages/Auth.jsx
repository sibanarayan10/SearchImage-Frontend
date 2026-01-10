import React from "react";
import { useState } from "react";
import Form from "../Components/Form";
import ThemeToggle from "../Components/ThemeToggle";

function Auth({ mode }) {
  const thought = {
    thought:
      "A single photograph can capture a thousand emotions — share yours with the world.",
    author: "Sibanarayan Choudhury",
    imgUrl: "",
  };

  return (
    <div className="container mx-auto max-w-screen-2xl ">
      <div className="hidden">
        <ThemeToggle />
      </div>
      <div className="flex w-full h-screen max-[800px]:justify-center max-[800px]:bg-[url(./bg.avif)] bg-cover overflow-auto">
        <div className="flex items-start justify-center relative bg-[url('./bg.avif')] w-3/5 max-[800px]:hidden h-screen bg-cover ">
          <div className="absolute bottom-14 flex flex-col justify-center items-center border border-white rounded-lg px-2 py-2 w-[90%] lg:max-w-md lg:right-8 z-50 bg-black/20">
            <h1 className="font-bold heading text-white">
              CAPTURE, CREATE AND INSPIRE
              <p className="text-sm text-gray-800 italic w-full text-right">
                Every shot tells a story
              </p>
            </h1>
            <h3 className="mt-12 text-lg text-white">
              Great photography isn't just about the camera — it's about
              perspective. Share your vision with the world, one frame at a
              time.
            </h3>
          </div>

          <div className="flex items-center  mt-6 gap-x-2 w-2/5 absolute top-10 right-5 z-50">
            <div className="flex flex-col w-full">
              <p className="thought text-gray-800 text-lg">{thought.thought}</p>
              <p className="text-right w-full text-white text-sm font-semibold italic">
                ~{thought.author}
              </p>
            </div>
          </div>

          <div className="absolute top-0 bg-black/20 h-full w-full"></div>
        </div>
        <div className="hidden max-[800px]:block absolute top-0 bg-white/70 dark:bg-black/90 h-full w-full"></div>
        <div
          className={`min-[800px]:w-2/5 flex flex-col items-center gap-y-2 overflow-scroll scrollBar py-4 z-50 ${
            mode === "signup" ? "justify-start" : "justify-center"
          }`}
        >
          <h1 className="font-bold thought text-3xl pb-2 text-gray-800 dark:text-white">
            Picture
          </h1>
          <Form mode={mode} />
        </div>
      </div>
    </div>
  );
}

export default Auth;
