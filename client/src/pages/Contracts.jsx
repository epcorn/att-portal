import { useCallback, useEffect, useState } from "react";
import {
  CustomModal,
  Loading,
  NewContract,
  UpdateContract,
  ViewContract,
  PopUp,
  QRbutton,
  HistoryPanelContract,
  Search,
  PopUpMorpheus,
  DownloadButtonContract,
  PageHeader,
  Warrenty,
} from "../components/index.js";
import TimeAgo from "react-timeago";
import { Button, Table } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { getInitials, getNextNum } from "../redux/user/userSlice.js";
import {
  approve,
  // eslint-disable-next-line no-unused-vars
  deleteContract,
  getContracts,
  showMoreContract,
} from "../redux/contract/contractSlice.js";
import { toast } from "react-toastify";
import { getDotColor } from "../funtions/funtion.js";
import { unwrapResult } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import CorresponUI from "../components/CorresponUI.jsx";

function Contracts() {
  const {
    contracts = [],
    showMore,
    loading,
  } = useSelector((state) => state.contract);
  const { currentUser } = useSelector((state) => state.user);
  const [extraQuery, setExtraQuery] = useState();
  const [createModel, setCreateModel] = useState(false);
  const [updateModel, setUpdateModel] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const [correspondModel, setCorrespondModel] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [archiveModel, setArchiveModel] = useState(false);
  const [warModel, setWarModel] = useState(false);
  const [contractNo, setContractNo] = useState(null);
  const [nextContractNo, setNextContractNo] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleShowMore = useCallback(
    debounce(async () => {
      const startIndex = contracts.length;
      if (!showMore) {
        return;
      }
      if (showMore && extraQuery) {
        dispatch(showMoreContract({ startIndex, extraQuery }));
      } else {
        dispatch(showMoreContract({ startIndex, extraQuery }));
        setExtraQuery(null);
      }
    }, 400), // Debounce delay in milliseconds
    [contracts.length, showMore, extraQuery, dispatch] // Dependencies for useCallback
  );

  useEffect(() => {
    if (contracts.length <= 0) {
      dispatch(getInitials());
      dispatch(getContracts());
    }
    async function fn() {
      const result = await dispatch(getNextNum());
      const data = await unwrapResult(result);
      setNextContractNo(data.result.contractNextNum.seq);
    }
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (currentUser.rights.createContract || currentUser.rights.admin) {
      return;
    } else {
      navigate("/");
    }
  }, [
    currentUser.rights.admin,
    currentUser.rights.createContract,
    dispatch,
    navigate,
  ]);

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

  async function handleClick(id) {
    if (!currentUser.rights.admin && !currentUser.rights.approve) {
      toast.error("Contact VNT to approve the Quotation.");
      return;
    }
    const actionResult = await dispatch(approve(id));
    // eslint-disable-next-line no-unused-vars
    const result = unwrapResult(actionResult);
  }

  // async function handleDelete(id) {
  //   if (!currentUser.rights.admin) {
  //     toast.error("Contact KP to Delete.");
  //     return;
  //   }
  //   const actionResult = await dispatch(deleteContract(id));
  //   const result = unwrapResult(actionResult);
  //   toast.success(result.message);
  // }
  return (
    <div className="mx-3 ">
      {loading ? <Loading /> : null}
      <div className="h-full mt-3">
        <div className=" mt-2 h-full">
          <PageHeader
            bgColor="bg-[#E36F6F]"
            recentTitle="Recent Contracts"
            nextNumber={{ label: "Next Contract No", value: nextContractNo }}
            buttons={
              <button
                className="bg-[#FFFDB5] hover:bg-yellow-200 font-medium py-2 px-4 rounded-tl-lg rounded-br-lg"
                onClick={() => setCreateModel(true)}
              >
                Create Contracts
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
                <Table.HeadCell>Edit</Table.HeadCell>
                <Table.HeadCell>Action</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {contracts.length > 0 &&
                  contracts.map((contract) => (
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
                            cNo={contract.contractNo}
                            approved={contract.approved}
                            click={handleClick}
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
                        {new Date(
                          contract.contractDate
                            ? contract.contractDate
                            : contract.createdAt
                        ).toLocaleDateString("en-GB")}
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
                        <Button
                          outline
                          gradientDuoTone="redToYellow"
                          onClick={() => [
                            setUpdateModel(true),
                            setActiveId(contract._id),
                          ]}
                        >
                          {contract.approved ? (
                            <span>Revise</span>
                          ) : (
                            <span>Update</span>
                          )}
                        </Button>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-evenly flex-wrap gap-1 relative">
                          <div
                            className={`absolute top-0 left-0 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${getDotColor(
                              contract.docType
                            )}`}
                          ></div>
                          <Button
                            gradientDuoTone="purpleToBlue"
                            onClick={() => [
                              setViewModel(true),
                              setActiveId(contract._id),
                            ]}
                          >
                            View
                          </Button>
                          {/* {currentUser.rights.admin ? (
                            <Button
                              onClick={() => [
                                setActiveId(contract._id),
                                handleDelete(contract._id),
                              ]}
                              gradientMonochrome="failure"
                            >
                              Delete
                            </Button>
                          ) : null} */}
                          {contract.approved ? (
                            <Button
                              onClick={() => [
                                setArchiveModel(true),
                                setActiveId(contract._id),
                                setContractNo(contract.quotationNo),
                              ]}
                              gradientDuoTone="tealToLime"
                            >
                              History
                            </Button>
                          ) : null}
                          <Button
                            gradientMonochrome="pink"
                            onClick={() => [
                              setWarModel(true),
                              setActiveId(contract._id),
                            ]}
                          >
                            Warrenty
                          </Button>
                          <Button
                            gradientDuoTone="greenToBlue"
                            onClick={() => [
                              setCorrespondModel(true),
                              setActiveId(contract._id),
                            ]}
                          >
                            Files/Emails
                          </Button>
                          <PopUpMorpheus
                            id={contract._id}
                            setQuoteId={setActiveId}
                          >
                            <div className="flex justify-center gap-4">
                              <DownloadButtonContract
                                id={contract._id}
                                color="failure"
                                text="With ANNEXURE"
                                annexure={true}
                              />
                              <DownloadButtonContract
                                id={contract._id}
                                color="blue"
                                text="Without ANNEXURE"
                                annexure={false}
                              />
                            </div>
                          </PopUpMorpheus>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
            {contracts.length <= 0 && (
              <h1 className="text-center">
                No Contracts
                <span style={{ fontSize: "60px" }}>&#128524;</span>
              </h1>
            )}
          </div>
        </div>
      </div>
      <CustomModal
        isOpen={createModel}
        onClose={() => setCreateModel(!createModel)}
        size="7xl"
        heading="New Contract"
        bg="bg-red-50"
      >
        <NewContract
          onClose={() => setCreateModel(!createModel)}
          activeId={activeId}
          setActiveId={setActiveId}
        />
      </CustomModal>
      <CustomModal
        isOpen={updateModel}
        onClose={() => setUpdateModel(!updateModel)}
        size="7xl"
        heading="Update Contract"
        bg="bg-red-50"
      >
        <UpdateContract
          onClose={() => setUpdateModel(!updateModel)}
          activeId={activeId}
          setActiveId={setActiveId}
        />
      </CustomModal>
      <CustomModal
        isOpen={viewModel}
        onClose={() => setViewModel(!viewModel)}
        size="7xl"
        heading={
          <div className="flex gap-3 items-center justify-center">
            <span>View/Edit</span>
            <QRbutton
              id={activeId}
              data={contracts.find((c) => c._id === activeId)}
            />
          </div>
        }
      >
        <ViewContract id={activeId} />
      </CustomModal>
      <CustomModal
        isOpen={archiveModel}
        onClose={() => [setArchiveModel(!archiveModel)]}
        size="7xl"
        heading={
          <div className="flex items-center justify-center">
            <span>View/Edit</span>
            {contractNo ? (
              <span className="ml-5">{contractNo}</span>
            ) : (
              <span className="ml-5">{contractNo}</span>
            )}
          </div>
        }
      >
        <HistoryPanelContract
          contractId={activeId}
          onClose={() => [setArchiveModel(!archiveModel)]}
        />
      </CustomModal>
      <CustomModal
        isOpen={warModel}
        onClose={() => [setWarModel(!warModel)]}
        size="7xl"
        heading={
          <div className="flex items-center justify-center">
            <span>View Warrenty</span>
          </div>
        }
      >
        <Warrenty id={activeId} />
      </CustomModal>
      <CustomModal
        isOpen={correspondModel}
        onClose={() => [setCorrespondModel(false)]}
        size="7xl"
        heading={
          <div className="flex items-center justify-center">
            <span>Manage Correspondence</span>
          </div>
        }
      >
        <CorresponUI contractId={activeId} />
      </CustomModal>
    </div>
  );
}

export default Contracts;
