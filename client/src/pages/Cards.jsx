import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInitials } from "../redux/user/userSlice";
import { Button, Table } from "flowbite-react";
import { Loading, PopUp, Search, PageHeader } from "../components";
import TimeAgo from "react-timeago";
import { getDotColor } from "../funtions/funtion";
import { FcPrint } from "react-icons/fc";
import {
  incPrintCount,
  searchCards,
  showMoreCard,
} from "../redux/card/cardSlice";
import { useNavigate } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import debounce from "lodash.debounce";
import { createContractCard } from "../funtions/docxFn";

function Cards() {
  const { cards = [], showMore, loading } = useSelector((state) => state.card);
  const { currentUser } = useSelector((state) => state.user);
  const [extraQuery, setExtraQuery] = useState("&approved=true");
  const [activeId, setActiveId] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (cards.length <= 0) {
      dispatch(getInitials());
      dispatch(searchCards());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (currentUser.rights.genCard || currentUser.rights.admin) {
      return;
    } else {
      navigate("/");
    }
  }, [
    currentUser.rights.admin,
    currentUser.rights.genCard,
    dispatch,
    navigate,
  ]);
  const handleShowMore = useCallback(
    debounce(async () => {
      const startIndex = cards.length;
      if (!showMore) {
        return;
      }
      if (showMore && extraQuery) {
        dispatch(showMoreCard({ startIndex, extraQuery }));
      } else {
        dispatch(showMoreCard({ startIndex, extraQuery }));
        setExtraQuery("&approved=true");
      }
    }, 400), // Debounce delay in milliseconds
    [cards.length, showMore, extraQuery, dispatch] // Dependencies for useCallback
  );

  // Check if the user has scrolled to the bottom of the page
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 5) {
      handleShowMore(); // Call the debounced function
    }
  }, [handleShowMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  async function handlePrint(id) {
    try {
      const actionResult = await dispatch(incPrintCount(id));
      const result = unwrapResult(actionResult);
      createContractCard(result.result);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="mx-3 ">
      {loading ? <Loading /> : null}
      <div className="h-full mt-3">
        <div className=" mt-2 h-full">
          <PageHeader
            bgColor="bg-[#F6E96B]"
            recentTitle="Recent cards"
            buttons={
              <button className="bg-[#A2CA71] hover:bg-[#BEDC74] font-medium py-2 px-4 rounded-tl-lg rounded-br-lg">
                Cards
              </button>
            }
          />
          <Search setExtraQuery={setExtraQuery} />
          <div className=" overflow-x-auto ">
            <Table>
              <Table.Head>
                <Table.HeadCell>Contract No</Table.HeadCell>
                <Table.HeadCell>Contract Date</Table.HeadCell>
                <Table.HeadCell>Created By</Table.HeadCell>
                <Table.HeadCell>Project Name</Table.HeadCell>
                <Table.HeadCell>Client Name</Table.HeadCell>
                <Table.HeadCell>Timestamp</Table.HeadCell>
                <Table.HeadCell>Action</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {cards.length > 0 &&
                  cards.map((contract) => (
                    <Table.Row
                      key={contract._id}
                      className={`transition-all duration-700 ease-in-out ${
                        activeId === contract._id
                          ? "bg-blue-100 border-green-500 text-green-700"
                          : "bg-white border-blue-200 text-gray-700"
                      } border-b-2`}
                    >
                      <Table.Cell>
                        <div className="flex items-center justify-start w-full gap-1 ">
                          <PopUp
                            id={contract._id}
                            approved={contract.approved}
                          />
                          <div className="flex flex-col">
                            <span>
                              {contract.contractNo
                                ? contract.contractNo
                                : contract._id}
                            </span>
                            <span>{contract?.quotation?.quotationNo}</span>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(contract.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </Table.Cell>
                      <Table.Cell>{contract.createdBy?.username}</Table.Cell>
                      <Table.Cell>
                        {contract.shipToAddress.projectName.length > 30
                          ? contract.shipToAddress.projectName.slice(0, 30) +
                            "..."
                          : contract.shipToAddress.projectName}
                      </Table.Cell>
                      <Table.Cell>
                        {contract.billToAddress.name.length > 30
                          ? contract.billToAddress.name.slice(0, 30) + "..."
                          : contract.billToAddress.name}
                      </Table.Cell>
                      <Table.Cell>
                        <TimeAgo date={new Date(contract.updatedAt)} />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-evenly flex-wrap gap-1 relative">
                          <div
                            className={`absolute top-0 left-0 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${getDotColor(
                              contract.docType
                            )}`}
                          ></div>
                          <Button
                            color="gray"
                            onClick={() => [
                              handlePrint(contract._id),
                              setActiveId(contract._id),
                            ]}
                          >
                            <FcPrint className="h-6 w-6" />
                            <div className="cursor-pointer text-gray-800 font-semibold hover:text-gray-600">
                              {contract.printCount}
                            </div>
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
            {cards.length <= 0 && (
              <h1 className="text-center">
                No cards
                <span style={{ fontSize: "60px" }}>&#128524;</span>
              </h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;
