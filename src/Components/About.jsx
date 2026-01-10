import React from "react";

const About = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0C1521]  from-gray-900 via-gray-800 to-gray-700 w-screen ">
      <div className="about-container bg-gray-900 p-6 rounded-lg shadow-md mx-auto max-w-3xl text-white w-4/5">
        <h1 className="heading font-bold mb-4 text-center text-teal-400">
          About Our Project
        </h1>
        <p className="text-gray-300 about mb-4">
          Welcome to our image-sharing platform! This application allows users
          to upload their image files and view all their uploaded images in one
          place. Our platform is designed to make it easy for users to store,
          manage, and share their photos with the community.
        </p>
        <p className="text-gray-300 about">Features include:</p>
        <ul className="list-disc list-inside mt-3 text-gray-400 nav-items">
          <li>Upload your own images with ease.</li>
          <li>View and manage your uploaded images.</li>
          <li>Explore images uploaded by other users.</li>
          <li>Enjoy a seamless and user-friendly experience.</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
