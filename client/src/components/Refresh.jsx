import { useState } from "react";
import { FaSync } from "react-icons/fa";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  getContracts,
  getSingleContract,
} from "../redux/contract/contractSlice.js";
import { getQuotes } from "../redux/quote/quoteSlice.js";
import { searchCards } from "../redux/card/cardSlice.js";
import Loading from "./Loading.jsx";
import { getUsers } from "../redux/user/userSlice.js";

function Refresh() {
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { id } = useParams();

  async function handleRefresh() {
    setRefreshing(true);
    try {
      if (location.pathname.includes("contracts")) {
        await dispatch(getContracts());
      } else if (location.pathname.includes("quotes")) {
        await dispatch(getQuotes());
      } else if (location.pathname.includes("cards")) {
        await dispatch(searchCards("&approved=true"));
      } else if (location.pathname.includes("workLog")) {
        await dispatch(getSingleContract(id));
      } else if (location.pathname.includes("user")) {
        await dispatch(getUsers());
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      {refreshing && <Loading />}
      <button
        onClick={handleRefresh}
        className={`relative bg-gradient-to-r from-teal-400 to-blue-500 p-2 rounded-full ${
          refreshing ? "animate-spin" : ""
        }`}
      >
        <FaSync className="h-5 w-5 text-white" />
      </button>
    </>
  );
}

export default Refresh;
