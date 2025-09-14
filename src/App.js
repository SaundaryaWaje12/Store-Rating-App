import React from "react";
import { motion } from "framer-motion";

function App() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-primary via-accent to-secondary p-4 rounded-xl flex justify-between items-center shadow-lg shadow-glow mb-8">
        <h1 className="text-2xl font-heading text-white">⭐ Store Rating</h1>
        <button className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
          Login
        </button>
      </nav>

      {/* Animated Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["Electronics Hub ⚡", "Fresh Groceries 🥬", "Fashion World 👗", "Book Haven 📚"].map((store, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="bg-card bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-glow hover:scale-105 transition"
          >
            <h2 className="text-xl font-heading text-white">{store}</h2>
            <p className="text-gray-300 font-body mt-2">Best store in town with 5⭐ ratings!</p>
            <button className="mt-4 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg shadow-glow hover:scale-105 transition">
              Rate Now 🚀
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default App;
