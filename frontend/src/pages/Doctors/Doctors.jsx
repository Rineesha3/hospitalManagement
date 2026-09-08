import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DoctorCard from "../../components/Doctors/DoctorCard";
import { BASE_URL } from "./../../config";
import useFetchData from "../../hooks/useFetchData";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { BiFilterAlt, BiX } from "react-icons/bi";

const SPECIALIZATIONS = [
  "General Practitioner",
  "Neurologist",
  "Dermatologist",
  "Mental Health Counselor",
  "Pediatrician",
  "Nutritionist",
  "Chronic Care Specialist",
  "Cardiologist",
  "Surgeon",
];

const Doctors = () => {
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [debounceQuery, setDebounceQuery] = useState(query);
  const [specialization, setSpecialization] = useState(searchParams.get("specialization") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "rating_desc");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceQuery(query);
    }, 700);
    return () => clearTimeout(timeout);
  }, [query]);

  const params = new URLSearchParams();
  if (debounceQuery) params.set("query", debounceQuery);
  if (specialization) params.set("specialization", specialization);
  if (gender) params.set("gender", gender);
  if (minRating) params.set("minRating", minRating);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (sort) params.set("sort", sort);

  const {
    data: doctors,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/doctors?${params.toString()}`);

  const activeFilters = [
    specialization && { label: specialization, clear: () => setSpecialization("") },
    gender && { label: gender[0].toUpperCase() + gender.slice(1), clear: () => setGender("") },
    minRating && { label: `${minRating}+ stars`, clear: () => setMinRating("") },
    maxPrice && { label: `Under ${maxPrice}`, clear: () => setMaxPrice("") },
  ].filter(Boolean);

  const resetFilters = () => {
    setQuery("");
    setSpecialization("");
    setGender("");
    setMinRating("");
    setMaxPrice("");
    setSort("rating_desc");
  };

  const hasActiveFilters = activeFilters.length > 0 || query;

  return (
    <>
      <section className="bg-[#fff9e2]">
        <div className="container text-center">
          <h2 className="heading">Find a Doctor</h2>
          <p className="text__para mx-auto max-w-[540px]">
            Search, filter and sort our approved doctors to find the right fit for you.
          </p>
          <div className="max-w-[1000px] mt-[30px] mx-auto bg-white shadow-sm rounded-md flex items-center justify-between border border-solid border-[#0066ff34]">
            <input
              type="search"
              className="py-4 pl-4 pr-2 bg-transparent w-full focus:outline-none placeholder:text-textColor"
              placeholder="Search doctor by name or specialization"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="max-w-[1000px] mt-6 mx-auto bg-white rounded-lg shadow-sm border border-solid border-[#0066ff1f] p-4">
            <div className="flex items-center gap-2 mb-3 text-textColor">
              <BiFilterAlt className="w-5 h-5" />
              <span className="text-[14px] font-semibold">Filters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="text-left">
                <label className="block text-[12px] text-textColor mb-1">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full py-2 px-3 rounded-md border border-solid border-[#0066ff34] bg-white text-[14px] focus:outline-none focus:border-primaryColor"
                >
                  <option value="">All specializations</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-left">
                <label className="block text-[12px] text-textColor mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full py-2 px-3 rounded-md border border-solid border-[#0066ff34] bg-white text-[14px] focus:outline-none focus:border-primaryColor"
                >
                  <option value="">Any gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-[12px] text-textColor mb-1">Minimum rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full py-2 px-3 rounded-md border border-solid border-[#0066ff34] bg-white text-[14px] focus:outline-none focus:border-primaryColor"
                >
                  <option value="">Any rating</option>
                  <option value="4">4+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-[12px] text-textColor mb-1">Max fee</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full py-2 px-3 rounded-md border border-solid border-[#0066ff34] bg-white text-[14px] focus:outline-none focus:border-primaryColor"
                />
              </div>
              <div className="text-left">
                <label className="block text-[12px] text-textColor mb-1">Sort by</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full py-2 px-3 rounded-md border border-solid border-[#0066ff34] bg-white text-[14px] focus:outline-none focus:border-primaryColor"
                >
                  <option value="rating_desc">Rating</option>
                  <option value="price_asc">Price (low to high)</option>
                  <option value="price_desc">Price (high to low)</option>
                  <option value="earliest_available">Earliest available</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-solid border-[#0066ff1f]">
                {activeFilters.map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 bg-[#0066ff14] text-primaryColor text-[13px] font-medium pl-3 pr-2 py-1 rounded-full"
                  >
                    {f.label}
                    <button onClick={f.clear} aria-label={`Remove ${f.label} filter`}>
                      <BiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={resetFilters}
                  className="text-[13px] font-semibold text-textColor hover:text-primaryColor ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          {loading && <Loader />}
          {error && <Error />}
          {!loading && !error && (
            <>
              <p className="text-textColor text-[14px] mb-5">
                {doctors.length} doctor{doctors.length === 1 ? "" : "s"} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor._id} doctor={doctor} />
                ))}
              </div>
            </>
          )}
          {!loading && !error && doctors.length === 0 && (
            <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
              No doctors match these filters
            </h2>
          )}
        </div>
      </section>
    </>
  );
};

export default Doctors;
