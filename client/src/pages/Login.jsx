import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import { Spinner } from "flowbite-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login } from "../redux/user/userSlice";
import bg from "../images/bg.webp";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((store) => store.user);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const actionResult = await dispatch(login(loginData));
      unwrapResult(actionResult);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
      toast.success("Login successful");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-gray-100"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-3xl mb-6 font-bold text-center text-blue-600">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block mb-1 font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={loginData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-1 font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner size="sm" className="mr-2" />
                <span>Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
