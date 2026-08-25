import { useState } from "react";

import SearchBar from "../components/findPartner/SearchBar";
import FilterBar from "../components/findPartner/FilterBar";
import PartnerGrid from "../components/findPartner/PartnerGrid";


function FindPartner() {


  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");



  return (

    <>





          {/* Header */}


          <section className="border-b border-[#26262F] py-8">


            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E76F51]">

              Find Study Partners

            </span>




            <h1 className="mt-4 text-4xl font-bold lg:text-5xl">

              Connect With The Right Study Partner

            </h1>




            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-400">

              Discover students with similar skills,
              subjects, and learning goals through
              skill, interest & learning-goal
              matching.

            </p>


          </section>





          {/* Search */}



          <section className="mt-8">


            <SearchBar

              search={search}

              setSearch={setSearch}

            />


          </section>






          {/* Filters */}



          <section className="mt-6">


            <FilterBar

              activeFilter={activeFilter}

              setActiveFilter={setActiveFilter}

            />


          </section>






          {/* Partners */}



          <section className="mt-8 pb-10">


            <PartnerGrid

              search={search}

              activeFilter={activeFilter}

            />


          </section>





    </>

  );

}


export default FindPartner;
