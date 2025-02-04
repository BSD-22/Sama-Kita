import { ChevronRight, Users, DollarSign, Settings } from "lucide-react"; // Import Lucide icons
import NavbarLanding from "@/components/NavbarLanding";
import { TypeAnimation } from "react-type-animation";
import Chatbot from "@/components/ChatBotLanding";

const Hero = () => {
  const gradientStyle = {
    background: "linear-gradient(to bottom, #b3d9ff 0%, #ffffff 70%)", // Adjusted gradient to start higher
    minHeight: "100vh",
  };

  return (
    <div
      className="overflow-x-hidden p-0 m-0"
      style={gradientStyle}>
      <NavbarLanding />
      <div
        className="relative pt-24 pb-36 lg:pt-40 lg:pb-40"
        id="home">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center justify-between px-4">
          {/* Left Section: Title, Description, and CTA */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <TypeAnimation
              sequence={["Sama", 2000, "Sama Kita", 2000, "Sama Kita Aja", 7000, ""]}
              speed={50}
              className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight text-gray-800 dark:text-gray-100"
              repeat={Infinity}
            />
            <p className="mb-6 text-lg max-w-lg text-gray-800 dark:text-gray-200">
              Automate and simplify the management of your kos-kosan with Sama Kita. Join the wishlist now and turn your property into a passive income source effortlessly.
            </p>
            <div className="flex gap-4">
              <a
                href="/#"
                className="relative inline-flex items-center justify-center py-3 px-6 text-base font-medium text-black border border-black rounded-lg overflow-hidden group">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-transform transform translate-x-full group-hover:translate-x-0 group-hover:scale-110 duration-500 ease-out"></span>
                <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></span>
                <span className="relative z-10">Join Us</span>
                <ChevronRight
                  size={20}
                  className="ml-2 relative z-10"
                />
              </a>
              <a
                href="/#"
                className="relative inline-flex items-center text-base font-medium text-black hover:text-blue-600 transition duration-300 group">
                Watch Video
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></span>
              </a>
            </div>
          </div>

          {/* Right Section: Video */}
          <div className="mt-8 lg:mt-0 lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <video
                className="w-full h-96 rounded-xl object-cover object-center"
                src="/videoLandingPage.mp4"
                controls
                loop
                autoPlay
                muted
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        id="features"
        className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800 dark:text-gray-100">Our Features</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="w-full max-w-xs bg-white bg-opacity-70 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105 hover:rotate-3 hover:shadow-2xl">
              <Users
                size={48}
                className="mx-auto mb-6 text-blue-600 animate-bounce"
              />
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Property Management</h3>
              <p className="text-base text-gray-700 dark:text-gray-300">Easily manage your users and their needs.</p>
            </div>
            <div className="w-full max-w-xs bg-white bg-opacity-70 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105 hover:rotate-3 hover:shadow-2xl">
              <DollarSign
                size={48}
                className="mx-auto mb-6 text-green-600 animate-pulse"
              />
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Financial Tracking</h3>
              <p className="text-base text-gray-700 dark:text-gray-300">Keep track of your revenues and profits with ease.</p>
            </div>
            <div className="w-full max-w-xs bg-white bg-opacity-70 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105 hover:rotate-3 hover:shadow-2xl">
              <Settings
                size={48}
                className="mx-auto mb-6 text-purple-600 animate-spin"
              />
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Customizable Automation</h3>
              <p className="text-base text-gray-700 dark:text-gray-300">Tailor the platform to your specific needs and simplify your daily operations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div
        id="pricing"
        className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800 dark:text-gray-100">Pricing</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="w-full max-w-xs bg-white bg-opacity-70 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105 hover:rotate-3 hover:shadow-2xl">
              <p className="text-base text-gray-600 mb-4 dark:text-gray-300">"Sama Kita has completely transformed how I manage my properties. It's so easy and saves me so much time!"</p>
              <div className="flex items-center justify-start">
                <img
                  src="/user1.jpg"
                  alt="User 1"
                  className="w-12 h-12 rounded-full mr-4 animate-pulse"
                />
                <div>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100">John Doe</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Property Owner</p>
                </div>
              </div>
            </div>
            <div className="w-full max-w-xs bg-white bg-opacity-70 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105 hover:rotate-3 hover:shadow-2xl">
              <p className="text-base text-gray-600 mb-4 dark:text-gray-300">"The automation features are a game-changer. I can focus on growing my business instead of managing day-to-day tasks."</p>
              <div className="flex items-center justify-start">
                <img
                  src="/user2.jpg"
                  alt="User 2"
                  className="w-12 h-12 rounded-full mr-4 animate-pulse"
                />
                <div>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100">Jane Smith</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Business Owner</p>
                </div>
              </div>
            </div>
            <div className="w-full max-w-xs bg-white bg-opacity-70 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105 hover:rotate-3 hover:shadow-2xl">
              <p className="text-base text-gray-600 mb-4 dark:text-gray-300">"I love how customizable the platform is. It fits perfectly with my business needs."</p>
              <div className="flex items-center justify-start">
                <img
                  src="/user3.jpg"
                  alt="User 3"
                  className="w-12 h-12 rounded-full mr-4 animate-pulse"
                />
                <div>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100">Alice Johnson</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Entrepreneur</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default Hero;
