import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search, Image, X, TrendingUp } from "lucide-react";

interface SearchComponentProps {
  onSubmit: (value: string) => void;
  search: string;
}

const TRENDING_TAGS = [
  "Nature",
  "Cyberpunk",
  "Minimalist",
  "Architecture",
  "Portraits",
  "Street",
  "Golden Hour",
  "Abstract",
];

const SearchComponent: React.FC<SearchComponentProps> = ({
  onSubmit,
  search,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading] = useState<boolean>(false);

  useEffect(() => {
    setSearchTerm(search || "");
  }, [search]);

  return (
    <div className="bg-[url(./Img/SearchLight.jpg)] dark:bg-[url(./Img/SearchBg.jpg)] flex flex-col justify-center items-center h-[560px] w-full px-8 relative transition-all duration-500 bg-cover bg-center bg-no-repeat min-[2000px]:dark:bg-bottom">
      <div className="absolute h-full w-full dark:bg-black/55 backdrop-blur-[1px]" />

      <div className="text-2xl min-[400px]:text-4xl text-[#111111] dark:text-white text-center font-medium pb-8 z-10">
        <p className="tracking-tight">The best free stock images</p>
        <p className="text-black/70 dark:text-white/70 text-lg sm:text-xl font-normal mt-2">
          Powered by community creators & AI visual insights
        </p>
      </div>

      {/* Floating Glassmorphism Search Bar */}
      <div className="flex items-center relative w-full max-w-xl rounded-2xl bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md shadow-2xl border border-black/10 dark:border-white/10 group z-10 transition-all duration-300 focus-within:ring-2 focus-within:ring-emerald-500/50">
        <Image className="absolute left-4 text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-all duration-300" size={20} />
        
        <input
          type="text"
          value={searchTerm}
          name="desc"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search stunning high-res photos..."
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit(searchTerm);
          }}
          className="w-full rounded-2xl pl-12 pr-20 py-4 outline-none bg-transparent text-[#111111] dark:text-white text-base placeholder-black/40 dark:placeholder-white/40"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              onSubmit("");
            }}
            className="absolute right-12 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white p-1 transition"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="button"
          className="absolute right-2.5 h-10 w-10 flex items-center justify-center text-black/70 dark:text-white/80 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
          onClick={() => onSubmit(searchTerm)}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search size={20} />
          )}
        </button>
      </div>

      {/* Trending Topics Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-2xl z-10">
        <div className="flex items-center gap-1 text-black/60 dark:text-white/60 text-xs font-medium mr-1">
          <TrendingUp size={13} className="text-emerald-500" />
          <span>Trending:</span>
        </div>
        {TRENDING_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setSearchTerm(tag);
              onSubmit(tag);
            }}
            className="px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black/80 dark:text-white/90 backdrop-blur-sm border border-black/5 dark:border-white/10 transition-all duration-200 hover:scale-105"
          >
            {tag}
          </button>
        ))}
      </div>

      <Link
        to="/user/upload"
        className={`${
          localStorage.getItem("user") ? "flex sm:hidden" : "hidden"
        } bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-medium ring-1 ring-[#111111] dark:ring-white hover:ring-0 text-center px-4 py-3 rounded-lg transition-all duration-300 capitalize mt-8 z-50`}
      >
        Upload Your Images
      </Link>
    </div>
  );
};

export default SearchComponent;
