import SearchComponent from "../Components/Search";
import Gallery from "../Components/Gallery";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export const HomePage = ({ backendApi }) => {
  const [searchQuery] = useSearchParams();

  const search = searchQuery.get("search");
  const [searchParams, setSearchParams] = useState(search);
  useEffect(() => {
    setSearchParams(search);
  }, [search]);
  console.log(search);
  return (
    <>
      <SearchComponent />
      <Gallery
        key={searchParams}
        search={search}
        backendApi={
          search ? `${backendApi}?search=${searchParams}&` : `${backendApi}?`
        }
        DeleteAndEdit={false}
      />
    </>
  );
};
