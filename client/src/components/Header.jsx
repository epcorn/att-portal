import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/user/userSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import avatarImage from "../images/avatar.png";
import logo from "../images/logo.png";
import { useEffect, useState } from "react";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [title, setTitle] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignout = async () => {
    dispatch(logout());
  };

  const location = useLocation();
  useEffect(() => {
    function extractPageTitle(location) {
      // Extract the pathname from the location object
      const path = location.pathname;

      // Remove leading and trailing slashes, and split the path into segments
      const segments = path.replace(/^\/|\/$/g, "").split("/");

      // Get the first segment (assuming there's at least one)
      const firstSegment = segments[0] || "";

      // Capitalize the first letter and make the rest lowercase
      const formattedTitle =
        firstSegment.charAt(0).toUpperCase() +
        firstSegment.slice(1).toLowerCase();

      return formattedTitle;
    }
    setTitle(extractPageTitle(location));
  }, [location]);

  return (
    <Navbar fluid rounded className="border-b-2 max-w-7xl mx-auto ">
      <Navbar.Brand
        className="cursor-pointer relative"
        onClick={() => navigate("/")}
      >
        <div className="flex items-center">
          <img src={logo} className="mr-1 h-[65px]" alt="Flowbite React Logo" />
          <span className="whitespace-nowrap text-xl font-semibold dark:text-white relative">
            {title}
            <div className="absolute top-full left-0 flex justify-evenly w-full items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full ml-1"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
            </div>
          </span>
        </div>
      </Navbar.Brand>

      <div className="flex md:order-2">
        {currentUser && (
          <Dropdown
            arrowIcon={false}
            inline
            label={<Avatar alt="User settings" img={avatarImage} rounded />}
          >
            <Dropdown.Header>
              <span className="block text-sm">{`${currentUser?.username}`}</span>
            </Dropdown.Header>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
          </Dropdown>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link as="div" active={location.pathname === "/" ? true : false}>
          <Link to="/">Home</Link>
        </Navbar.Link>
        {(currentUser?.rights.createQuote ||
          currentUser?.rights.admin ||
          currentUser?.rights.createContract) && (
          <Navbar.Link
            as="div"
            active={location.pathname === "/quotes" ? true : false}
          >
            <Link to="/quotes">Quotes</Link>
          </Navbar.Link>
        )}
        {(currentUser?.rights.createContract || currentUser?.rights.admin) && (
          <Navbar.Link
            as="div"
            active={location.pathname === "/contracts" ? true : false}
          >
            <Link to="/contracts">Contracts</Link>
          </Navbar.Link>
        )}
        {(currentUser?.rights.genCard || currentUser?.rights.admin) && (
          <Navbar.Link
            as="div"
            active={location.pathname === "/cards" ? true : false}
          >
            <Link to="/cards">Cards</Link>
          </Navbar.Link>
        )}
        {(currentUser?.rights.workLogUpdate || currentUser?.rights.admin) && (
          <Navbar.Link
            as="div"
            active={location.pathname === "/workLog" ? true : false}
          >
            <Link to="/workLog">Work logs</Link>
          </Navbar.Link>
        )}
        {currentUser?.rights.admin || currentUser?.initials === "VNT" ? (
          <Navbar.Link as="div" active={location.pathname === "/dashboard"}>
            <Link to="/dashboard">Dashboard</Link>
          </Navbar.Link>
        ) : null}

        {currentUser?.rights.admin && (
          <Navbar.Link
            as="div"
            active={location.pathname === "/user" ? true : false}
          >
            <Link to="/user">User</Link>
          </Navbar.Link>
        )}
        {/* <Navbar.Link
          as="div"
          active={location.pathname === "/reports" ? true : false}
        >
          <Link to="/reports">Reports</Link>
        </Navbar.Link> */}
      </Navbar.Collapse>
    </Navbar>
  );
}
