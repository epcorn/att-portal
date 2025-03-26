import collage from "../images/collage.jpg";
import { useSelector } from "react-redux";

const LandingPage = () => {
  const { currentUser } = useSelector((store) => store.user);

  // Get the current hour to personalize the greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className=" mx-3 flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 min-h-screen p-8">
      <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
        {getGreeting()}, {currentUser.username}!
      </h1>
      <p className="text-lg text-white mb-4 italic">
        Welcome to ATT Portal, we&rsquo;re happy to see you here.
      </p>
      <div className="relative mb-8">
        <img
          src={collage}
          alt="Welcome"
          className="rounded-xl shadow-2xl w-full max-w-[640px] h-auto transform hover:scale-105 transition-all duration-300"
        />
        {/* Optional: Add an overlay or icon */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 rounded-xl"></div>
      </div>
      {/* <button
        className="px-6 py-3 bg-white text-blue-500 font-semibold text-lg rounded-full shadow-lg hover:bg-gray-200 transition-all duration-200"
        onClick={() => console.log("Explore more")}
      >
        Explore Your Dashboard
      </button> */}
    </div>
  );
};

export default LandingPage;
