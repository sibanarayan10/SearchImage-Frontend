import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Search, Image } from "lucide-react";

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate("/");

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (!searchTerm) {
      setError("Please enter a search term.");

      return;
    }
    navigate(`/user?search=${searchTerm}`);
  };

  return (
    <div className="bg-[url(./Img/SearchLight.jpg)] dark:bg-[url(./Img/SearchBg.jpg)] flex flex-col justify-center items-center h-[550px] w-full px-8 relative transition-all duration-500 bg-cover bg-center bg-no-repeat min-[2000px]:dark:bg-bottom">
      <div className="absolute h-full w-full dark:bg-black/50"></div>
      <div className="text-2xl min-[400px]:text-4xl text-[#111111] dark:text-white text-center font-medium pb-8 z-10">
        <p>The best free stock images</p>
        <p>Simplicity meets stunning imagery</p>
      </div>
      <form
        className="flex items-center relative w-full max-w-xl rounded-lg bg-white group"
        onSubmit={handleClick}
      >
        <Image className="absolute left-2 text-black/60 group-hover:group-hover:text-[#111111] transition-all duration-300 ml-2 -z-1" />
        <input
          type="text"
          value={searchTerm}
          name="desc"
          onChange={handleInputChange}
          placeholder="Search free images"
          className="w-full rounded-lg px-14 py-4 outline-none focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-zinc-300 text-[#111111] transition-all duration-300"
        />
        <button
          type="submit"
          className="absolute right-2 h-12 text-black/60 px-3 py-2 ml-1 rounded-lg hover:bg-black/10 transition-all duration-300 group-hover:text-[#111111]"
        >
          {loading ? (
            <Loader2 className="h-full w-full animate-spin"></Loader2>
          ) : (
            <Search />
          )}
        </button>
      </form>

      <Link
        to={`/user/upload`}
        className={`${
          localStorage.getItem("user") ? "flex sm:hidden" : "hidden"
        } bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-medium ring-1 ring-[#111111] dark:ring-white hover:ring-0 text-center px-4 py-3 rounded-lg transition-all duration-300 capitalize mt-8 z-50`}
        onClick={() => setIsOpen(false)}
      >
        Upload Your Images
      </Link>
    </div>
  );
};

export default SearchComponent;
