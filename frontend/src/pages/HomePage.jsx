import React from "react";

const HomePage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Welcome Home</h1>
      <p className="text-gray-300">
        This content is being rendered inside the Layout's Outlet. Notice how
        the Sidebar and Navbar are already here!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/10 p-6 rounded-lg border border-white/20"
          >
            <h3 className="text-xl text-white">Card {i}</h3>
            <p className="text-gray-400 mt-2">Some dashboard data here...</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default HomePage;
