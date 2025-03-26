import { CgHome } from "react-icons/cg";
import { FcRefresh } from "react-icons/fc";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className=" w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
          >
            <CgHome className="mr-2" size={20} />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className=" w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
          >
            <FcRefresh className="mr-2" size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
