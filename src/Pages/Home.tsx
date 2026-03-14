import SearchComponent from "../Components/Search";
import Gallery from "../Components/Gallery";
import { useState } from "react";

interface HomePageProps {
  backendApi: string;
}

export const HomePage: React.FC<HomePageProps> = ({ backendApi }) => {
  const [search, setSearch] = useState<string>("");

  return (
    <>
      <SearchComponent
        onSubmit={(value) => {
          if (value.trim() === "") return;
          setSearch(value);
        }}
        search={search}
      />
      <Gallery
        search={search}
        backendApi={search ? `${backendApi}?q=${search}&` : `${backendApi}?`}
        onTabChange={(val) => {
          if (val) setSearch("");
        }}
      />
    </>
  );
};
