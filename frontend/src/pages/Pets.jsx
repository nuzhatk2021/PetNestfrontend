import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import PetCard from "../components/PetCard";

const SAMPLE_PETS = [
  { id: 1, name: "Mochi", species: "Dog", breed: "Shiba Inu", age: 2, price: 450, category: "Dogs", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400" },
  { id: 2, name: "Luna", species: "Cat", breed: "British Shorthair", age: 1, price: 320, category: "Cats", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400" },
  { id: 3, name: "Kiwi", species: "Bird", breed: "Parakeet", age: 1, price: 80, category: "Birds", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400" },
  { id: 4, name: "Nemo", species: "Fish", breed: "Clownfish", age: 1, price: 40, category: "Fish", image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400" },
  { id: 5, name: "Coco", species: "Dog", breed: "Golden Retriever", age: 3, price: 800, category: "Dogs", image: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400" },
  { id: 6, name: "Bella", species: "Cat", breed: "Siamese", age: 2, price: 280, category: "Cats", image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400" },
];

const CATEGORIES = ["All", "Dogs", "Cats", "Birds", "Fish"];

export default function Pets() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  let filtered = SAMPLE_PETS
    .filter(p => category === "All" || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (sort === "low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "high") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search pets by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-[#111] border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-400/50"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-[#111] border border-white/10 rounded-full px-5 py-3 text-sm text-neutral-400 focus:outline-none focus:border-yellow-400/50"
          >
            <option value="default">Sort by</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
        <div className="flex gap-3 mb-10 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === c
                  ? "bg-yellow-400 text-black"
                  : "border border-white/10 text-neutral-400 hover:border-yellow-400/50 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-500 text-lg">No pets found for "{search}"</p>
            <button onClick={() => setSearch("")} className="mt-4 text-yellow-400 text-sm hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pet, i) => (
              <PetCard key={pet.id} pet={pet} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}