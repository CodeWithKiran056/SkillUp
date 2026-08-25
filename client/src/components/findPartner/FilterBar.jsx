import { SlidersHorizontal } from "lucide-react";


const filters = [
  "All",
  "AI",
  "Web Development",
  "Data Science",
  "UI/UX",
  "Cyber Security",
];



function FilterBar({ activeFilter, setActiveFilter }) {


  return (

    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">



      {/* Left */}


      <div className="flex items-center gap-3">


        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#26262F] bg-[#15151B]">


          <SlidersHorizontal

            size={18}

            className="text-[#E76F51]"

          />


        </div>




        <div>


          <h3 className="font-semibold">

            Filter Partners

          </h3>



          <p className="text-sm text-gray-400">

            Find students based on skills and interests.

          </p>


        </div>


      </div>





      {/* Filters */}



      <div className="flex flex-wrap gap-3">


        {filters.map((filter) => (


          <button

            key={filter}

            onClick={() =>
              setActiveFilter(filter)
            }

            className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              
              activeFilter === filter

                ? "border-[#E76F51] bg-[#E76F51] text-white"

                : "border-[#26262F] bg-[#15151B] text-gray-300 hover:border-[#E76F51] hover:text-white"

            }`}

          >

            {filter}

          </button>


        ))}


      </div>



    </div>

  );

}


export default FilterBar;