import SearchComponent from "../Components/Search";
import Gallery from "../Components/Gallery";
import { useState } from "react";

export const HomePage = ({ backendApi }) => {
  const [search, setSearch] = useState("");
  return (
    <>
      <SearchComponent
        onSubmit={(value) => {
          if (value.trim() === "") {
            return;
          }
          setSearch(value);
        }}
      />
      <Gallery
        search={search}
        backendApi={search ? `${backendApi}?q=${search}&` : `${backendApi}?`}
        DeleteAndEdit={false}
      />
    </>
  );
};
