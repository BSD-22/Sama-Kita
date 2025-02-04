import { Link, NavLink } from "react-router";

export default function NavbarLanding() {
  return (
    <nav className="bg-transparent fixed top-0 left-0 w-full z-50 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">Sama Kita</h2>
          </div>
          <div className="hidden md:flex space-x-6">
            <NavLink
              to="#home"
              className={() => "text-gray-800 dark:text-gray-100 hover:bg-black hover:bg-opacity-20 px-4 py-2 rounded-xl font-semibold transition-all"}
              onClick={(e) => {
                e.preventDefault(); // Prevent default anchor behavior
                document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
              }}>
              Home
            </NavLink>
            <NavLink
              to="#features"
              className={() => "text-gray-800 dark:text-gray-100 hover:bg-black hover:bg-opacity-20 px-4 py-2 rounded-xl font-semibold transition-all"}
              onClick={(e) => {
                e.preventDefault(); // Prevent default anchor behavior
                document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
              }}>
              About
            </NavLink>
            <NavLink
              to="#pricing"
              className={() => "text-gray-800 dark:text-gray-100 hover:bg-black hover:bg-opacity-20 px-4 py-2 rounded-xl font-semibold transition-all"}
              onClick={(e) => {
                e.preventDefault(); // Prevent default anchor behavior
                document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
              }}>
              Pricing
            </NavLink>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/join-us"
              className="relative group text-gray-800 dark:text-gray-100 text-lg font-semibold tracking-wide cursor-pointer transition-all">
              <span className="relative z-10 group-hover:text-primary">Join Us</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full duration-300 ease-out"></span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
