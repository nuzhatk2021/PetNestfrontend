import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function PetCard({ pet, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden group hover:border-yellow-400/30 transition-all duration-300"
    >
      <div className="overflow-hidden h-52">
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-white font-semibold text-lg">{pet.name}</h3>
          <span className="text-xs bg-white/5 text-neutral-400 px-2 py-1 rounded-full">{pet.category}</span>
        </div>
        <p className="text-neutral-500 text-sm mb-3">{pet.breed} · {pet.age}yr</p>
        <div className="flex items-center justify-between">
          <span className="text-yellow-400 font-bold text-lg">${pet.price}</span>
          <Link
            to={`/pets/${pet.id}`}
            className="text-sm bg-white/5 hover:bg-yellow-400 hover:text-black text-neutral-300 px-4 py-2 rounded-full transition-all duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}