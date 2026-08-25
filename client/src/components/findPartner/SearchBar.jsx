import { Search } from "lucide-react";


function SearchBar({ search, setSearch }) {


  return (

    <div className="relative">


      <Search

        size={20}

        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"

      />



      <input

        type="text"

        value={search}

        onChange={(e) => setSearch(e.target.value)}

        placeholder="Search by name, subject, or learning skill..."

        className="
          w-full
          rounded-2xl
          border
          border-[#26262F]
          bg-[#15151B]
          py-4
          pl-14
          pr-5
          text-white
          placeholder:text-gray-500
          outline-none
          transition-all
          duration-200
          focus:border-[#E76F51]
          focus:ring-2
          focus:ring-[#E76F51]/10
        "

      />


    </div>

  );

}


export default SearchBar;