import {
  Button,
  Label,
  Select,
  Table,
  Textarea,
  TextInput,
} from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import TimeAgo from "react-timeago";
import {
  CustomModal,
  HistoryPanelQuote,
  KCI,
  Loading,
  NewQuote,
  Search,
  ViewQuote,
  PopUp,
  UpdateQuotation,
  PopUpMorpheus,
  DownloadButtonQuotation,
  PageHeader,
} from "../components";
import { useDispatch, useSelector } from "react-redux";
import { getInitials, getNextNum } from "../redux/user/userSlice";
import {
  getQuotes,
  approve,
  showMoreQuotes,
  makeContract,
  createGroup,
  // eslint-disable-next-line no-unused-vars
  deleteQuote,
} from "../redux/quote/quoteSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { getDotColor } from "../funtions/funtion";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import CorresponUI from "../components/CorresponUI";

export default function Create() {
  const {
    quotations = [],
    loading,
    showMore,
  } = useSelector((state) => state.quote);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [createModel, setCreateModel] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const [updateModel, setUpdateModel] = useState(false);
  const [archiveModel, setArchiveModel] = useState(false);
  const [quoteId, setQuoteId] = useState("");
  const [quoteNo, setQuoteNo] = useState("");
  const [extraQuery, setExtraQuery] = useState(null);
  const navigate = useNavigate();
  const [groupModal, setGroupModal] = useState(false);
  const [quote, setQuote] = useState({
    kindAttention: "",
    kindAttentionPrefix: "",
    reference: "",
    salePerson: "",
    billToAddress: {
      prefix: "",
      name: "",
      a1: "",
      a2: "",
      a3: "",
      a4: "",
      a5: "",
      city: "",
      pincode: "",
      kci: [],
    },
    shipToAddress: {
      projectName: "",
      a1: "",
      a2: "",
      a3: "",
      a4: "",
      a5: "",
      city: "",
      pincode: "",
      kci: [],
    },
    specification: "",
    emailTo: "",
    groupBy: "",
    note: "",
    quotationNo: "",
    docType: "standard",
    paymentTerms: "Within 15 days from the date of submission of bill.",
    quoteInfo: [],
  });
  const [name, setName] = useState("");
  const [nextQuoteNo, setNextQuoteNo] = useState("");
  const [correspondModel, setCorrespondModel] = useState(false);
  useEffect(() => {
    if (quotations.length <= 0) {
      dispatch(getInitials());
      dispatch(getQuotes());
    }
    fn();
    async function fn() {
      const result = await dispatch(getNextNum());
      const data = await unwrapResult(result);
      setNextQuoteNo(data.result.quoteNextNum.seq);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  useEffect(() => {
    if (
      currentUser.rights.createQuote ||
      currentUser.rights.admin ||
      currentUser.rights.createContract
    ) {
      return;
    } else {
      navigate("/");
    }
  }, [
    currentUser.rights.admin,
    currentUser.rights.createQuote,
    currentUser.rights.createContract,
    dispatch,
    navigate,
  ]);

  async function handleClick(id) {
    if (!currentUser.rights.admin && !currentUser.rights.approve) {
      toast.error("Contact VNT to approve the Quotation.");
      return;
    }
    const actionResult = await dispatch(approve(id));
    // eslint-disable-next-line no-unused-vars
    const result = unwrapResult(actionResult);
  }
  // Check if the user has scrolled to the bottom of the page
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleShowMore = useCallback(
    debounce(async () => {
      const startIndex = quotations.length;
      if (!showMore) {
        return;
      }
      if (showMore && extraQuery) {
        dispatch(showMoreQuotes({ startIndex, extraQuery }));
      } else {
        dispatch(showMoreQuotes({ startIndex, extraQuery }));
        setExtraQuery(null);
      }
    }, 400), // Debounce delay in milliseconds
    [quotations.length, showMore, extraQuery, dispatch] // Dependencies for useCallback
  );
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

  async function handleContractify(id) {
    try {
      if (!currentUser.rights.createContract && !currentUser.rights.admin) {
        toast.error("Not allowed!");
        return;
      }
      dispatch(makeContract(id));
    } catch (error) {
      console.error(error);
    }
  }

  function handleQuoteChange(e) {
    const { name, value } = e.target;
    if (name === "kindAttentionPrefix" && value === "NA") {
      setQuote((prev) => ({ ...prev, kindAttention: "NA", [name]: value }));
      return;
    }
    setQuote((prev) => ({ ...prev, [name]: value }));
  }
  function handleAddress(e) {
    const { name, value } = e.target;
    const nameParts = name.split(".");

    // Check if the input is for billToAddress or shipToAddress
    const isForBillToAddress = nameParts[0] === "billToAddress";
    const isForShipToAddress = nameParts[0] === "shipToAddress";

    if (isForBillToAddress || isForShipToAddress) {
      const addressType = isForBillToAddress
        ? "billToAddress"
        : "shipToAddress";
      const fieldName = nameParts[1];

      setQuote((prev) => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [fieldName]: value,
        },
      }));
    } else {
      setQuote((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const actionResult = await dispatch(createGroup({ name, data: quote }));
    // eslint-disable-next-line no-unused-vars
    const result = await unwrapResult(actionResult);
    setGroupModal(false);
  }

  // async function handleDelete(id) {
  //   console.log(id);
  //   if (!currentUser.rights.admin) {
  //     toast.error("Contact KP to Delete.");
  //     return;
  //   }
  //   const actionResult = await dispatch(deleteQuote(id));
  //   const result = unwrapResult(actionResult);
  //   toast.success(result.message);
  // }
  return (
    <div className=" mx-3 ">
      {loading ? <Loading /> : null}
      <div className="h-full mt-3">
        <div className=" mt-2 h-full">
          <PageHeader
            bgColor="bg-[#6FDCE3]"
            recentTitle="Recent Quotations"
            nextNumber={{ label: "Next Quotation No", value: nextQuoteNo }}
            buttons={
              <>
                <button
                  className="bg-[#FFFDB5] hover:bg-yellow-200 font-medium py-2 px-4 rounded"
                  onClick={() => setGroupModal(true)}
                >
                  Create Group
                </button>
                <button
                  className="bg-[#FFFDB5] hover:bg-yellow-200 font-medium py-2 px-4 rounded-tl-lg rounded-br-lg"
                  onClick={() => setCreateModel(true)}
                >
                  Create Quotation
                </button>
              </>
            }
          />
          <Search setExtraQuery={setExtraQuery} />
          <div className=" overflow-x-auto ">
            <Table>
              <Table.Head>
                <Table.HeadCell>Quotation No</Table.HeadCell>
                <Table.HeadCell>Quotation Date</Table.HeadCell>
                <Table.HeadCell>Created By</Table.HeadCell>
                <Table.HeadCell>Project Name</Table.HeadCell>
                <Table.HeadCell>Client Name</Table.HeadCell>
                <Table.HeadCell>Timestamp</Table.HeadCell>
                <Table.HeadCell>Edit</Table.HeadCell>
                <Table.HeadCell>Action</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {quotations.length > 0 &&
                  quotations.map((ticket) => (
                    <Table.Row
                      key={ticket._id}
                      className={`transition-all duration-700 ease-in-out ${
                        quoteId === ticket._id
                          ? "bg-blue-100  border-green-500 text-green-700"
                          : "bg-white border-blue-300 text-gray-700"
                      } border-b-2`}
                    >
                      <Table.Cell>
                        <div className="flex items-center justify-start w-full gap-1 text-nowrap">
                          <PopUp
                            click={handleClick}
                            id={ticket._id}
                            approved={ticket.approved}
                          />
                          {ticket.quotationNo ? ticket.quotationNo : ticket._id}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(ticket.quotationDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </Table.Cell>
                      <Table.Cell>{ticket.createdBy?.username}</Table.Cell>
                      <Table.Cell>
                        {ticket.shipToAddress.projectName}
                      </Table.Cell>
                      <Table.Cell>{ticket.billToAddress.name}</Table.Cell>
                      <Table.Cell>
                        <TimeAgo date={new Date(ticket.updatedAt)} />
                      </Table.Cell>
                      <Table.Cell>
                        {ticket.contractified ? (
                          <Button gradientDuoTone="redToYellow" disabled>
                            Contract
                          </Button>
                        ) : (
                          <Button
                            outline
                            gradientDuoTone="redToYellow"
                            disabled={
                              currentUser.rights.createQuote ||
                              currentUser.rights.admin
                                ? false
                                : true
                            }
                            onClick={() => [
                              setQuoteId(ticket._id),
                              setQuoteNo(ticket.quotationNo),
                              setUpdateModel(true),
                            ]}
                          >
                            {ticket.approved ? (
                              <span>Revise</span>
                            ) : (
                              <span>Edit</span>
                            )}
                          </Button>
                        )}
                        {/* {currentUser.rights.admin ? (
                          <Button
                            onClick={() => [
                              setQuoteId(ticket._id),
                              handleDelete(ticket._id),
                            ]}
                            gradientMonochrome="failure"
                          >
                            Delete
                          </Button>
                        ) : null} */}
                      </Table.Cell>
                      <Table.Cell className="border ">
                        <div className="flex items-center justify-evenly flex-wrap gap-1 relative">
                          <div
                            className={`absolute top-0 left-0 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${getDotColor(
                              ticket.docType
                            )}`}
                          ></div>
                          <Button
                            gradientDuoTone="purpleToBlue"
                            onClick={() => [
                              setViewModel(true),
                              setQuoteId(ticket._id),
                              setQuoteNo(ticket.quotationNo),
                            ]}
                          >
                            View
                          </Button>
                          <Button
                            gradientDuoTone="greenToBlue"
                            onClick={() => [
                              setCorrespondModel(true),
                              setQuoteId(ticket._id),
                            ]}
                          >
                            Manage files
                          </Button>
                          {ticket.approved && ticket.emailTo ? (
                            <Button gradientDuoTone="greenToBlue">Email</Button>
                          ) : null}

                          {ticket.approved &&
                          !ticket.contractified &&
                          (currentUser.rights.createContract ||
                            currentUser.rights.admin) ? (
                            <Button
                              gradientMonochrome="purple"
                              onClick={() => [
                                handleContractify(ticket._id),
                                setQuoteId(ticket._id),
                              ]}
                              disabled={
                                currentUser.rights.createContract ||
                                currentUser.rights.admin
                                  ? false
                                  : true
                              }
                            >
                              Initiate Contract
                            </Button>
                          ) : null}

                          {ticket.approved ? (
                            <Button
                              onClick={() => [
                                setArchiveModel(true),
                                setQuoteId(ticket._id),
                                setQuoteNo(ticket.quotationNo),
                              ]}
                              gradientDuoTone="tealToLime"
                            >
                              History
                            </Button>
                          ) : null}
                          <PopUpMorpheus
                            setQuoteId={setQuoteId}
                            id={ticket._id}
                          >
                            <div className="flex justify-center gap-4">
                              <DownloadButtonQuotation
                                id={ticket._id}
                                color="failure"
                                text="With ANNEXURE"
                                annexure={true}
                              />
                              <DownloadButtonQuotation
                                id={ticket._id}
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
            {quotations.length <= 0 && (
              <h1 className="text-center">
                No Quotation
                <span style={{ fontSize: "60px" }}>&#128524;</span>
              </h1>
            )}
          </div>
        </div>
      </div>
      <CustomModal
        isOpen={createModel}
        onClose={() => [setCreateModel(!createModel), setQuoteId(null)]}
        size="7xl"
        heading="New Quotation"
        bg="bg-teal-50"
      >
        <NewQuote onClose={() => [setCreateModel(!createModel)]} />
      </CustomModal>
      <CustomModal
        isOpen={viewModel}
        onClose={() => [setViewModel(!viewModel)]}
        size="7xl"
        heading={
          <div className="flex items-center justify-center">
            <span>View/Edit</span>
            {quoteNo ? (
              <span className="ml-5">{quoteNo}</span>
            ) : (
              <span className="ml-5">{quoteId}</span>
            )}
          </div>
        }
      >
        <ViewQuote quoteId={quoteId} />
      </CustomModal>
      <CustomModal
        isOpen={updateModel}
        onClose={() => [setUpdateModel(!updateModel)]}
        size="7xl"
        heading={
          <div className="flex items-center justify-center">
            <span>View/Edit</span>
            {quoteNo ? (
              <span className="ml-5">{quoteNo}</span>
            ) : (
              <span className="ml-5">{quoteId}</span>
            )}
          </div>
        }
      >
        <UpdateQuotation
          quoteId={quoteId}
          onClose={() => [setUpdateModel(!updateModel)]}
        />
      </CustomModal>
      <CustomModal
        isOpen={archiveModel}
        onClose={() => [setArchiveModel(!archiveModel)]}
        size="7xl"
        heading={
          <div className="flex items-center justify-center">
            <span>View/Edit</span>
            {quoteNo ? (
              <span className="ml-5">{quoteNo}</span>
            ) : (
              <span className="ml-5">{quoteId}</span>
            )}
          </div>
        }
      >
        <HistoryPanelQuote
          quoteId={quoteId}
          onClose={() => [setArchiveModel(!archiveModel)]}
        />
      </CustomModal>
      <CustomModal
        isOpen={groupModal}
        onClose={() => setGroupModal(!groupModal)}
        size="7xl"
        heading={
          <div className="flex gap-3 items-center justify-center">
            <span>Add/Delete Batch No</span>
          </div>
        }
      >
        <form className="">
          <div className="flex items-center justify-evenly gap-4 mb-4 flex-wrap">
            <div className="max-w-full grid grid-cols-6">
              <div className="col-span-1">
                <div className="mb-2 ">
                  <Label htmlFor="kindAttentionPrefix">
                    <span>Prefix</span>
                    <span className=" text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <Select
                  name="kindAttentionPrefix"
                  value={quote.kindAttentionPrefix}
                  onChange={handleQuoteChange}
                >
                  <option></option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="NA">NA</option>
                </Select>
              </div>
              <div className="col-span-5">
                <div className="mb-2 block">
                  <Label htmlFor="kindAttention">
                    <span>Kind Attn: </span>
                    <span className=" text-red-500">*</span>
                  </Label>
                </div>
                <TextInput
                  name="kindAttention"
                  onChange={handleQuoteChange}
                  value={quote.kindAttention}
                />
              </div>
            </div>

            <div className=" col-span-3 max-w-full">
              <div className="mb-2 block">
                <Label htmlFor="specification" value="Group Name">
                  <span className="text-red-500 text-xl">*</span>
                </Label>
              </div>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className=" col-span-3 max-w-full">
              <div className="mb-2 block">
                <Label htmlFor="specification" value="Specification">
                  <span>Specification</span>
                  <span className="text-red-500 text-xl">*</span>
                </Label>
              </div>
              <Select
                name="specification"
                value={quote.specification}
                onChange={handleQuoteChange}
              >
                <option></option>
                <option>As per IS 6313 (Part 2):2013 & 2022</option>
                <option>As per IS 6313 (Part 2):2013</option>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-center w-full">
            <Button
              outline
              gradientMonochrome="cyan"
              //onClick={() => duplicateBillToShipTo({ quote, setQuote })}
            >
              Copy BillTo/ShipTo
            </Button>
          </div>
          <div className="grid grid-cols-8 gap-4 border mb-4 rounded-md">
            <div className=" p-4 col-span-4">
              <h2>Bill To Address</h2>
              <div className="max-w-full grid grid-cols-6">
                <div className="col-span-1">
                  <div className="mb-2">
                    <Label htmlFor="billToAddress.prefix" value="Prefix" />
                    <span className="text-red-500 text-xl">*</span>
                  </div>
                  <Select name="billToAddress.prefix" onChange={handleAddress}>
                    <option></option>
                    <option value="M/s.">M/s.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                  </Select>
                </div>
                <div className=" col-span-5">
                  <div className="mb-2">
                    <Label htmlFor="billToAddress.name">
                      <span>Name</span>
                      <span className="text-red-500 text-xl">*</span>
                    </Label>
                  </div>
                  <TextInput
                    type="text"
                    name="billToAddress.name"
                    value={quote.billToAddress.name}
                    onChange={handleAddress}
                  />
                </div>
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="a1">
                    <span>A1</span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="billToAddress.a1"
                  onChange={handleAddress}
                  value={quote.billToAddress.a1}
                  placeholder="Building/Office name"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="a2">
                    <span>A2</span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="billToAddress.a2"
                  onChange={handleAddress}
                  value={quote.billToAddress.a2}
                  placeholder="Flat/Office No"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="a3">
                    <span>A3</span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="billToAddress.a3"
                  onChange={handleAddress}
                  value={quote.billToAddress.a3}
                  placeholder="Road/Lanename"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="a4">
                    <span>A4</span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="billToAddress.a4"
                  onChange={handleAddress}
                  value={quote.billToAddress.a4}
                  placeholder="Location"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="a5">
                    <span>A5</span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="billToAddress.a5"
                  onChange={handleAddress}
                  value={quote.billToAddress.a5}
                  placeholder="NearBy: Landmark"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="billToAddress.city">
                    <span>City</span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="billToAddress.city"
                  value={quote.billToAddress.city}
                  onChange={handleAddress}
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="billToAddress.pincode">
                    <span>Pincode: </span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="billToAddress.pincode"
                  onChange={handleAddress}
                  value={quote.billToAddress.pincode}
                />
              </div>

              <KCI
                quote={quote}
                setQuote={setQuote}
                addressKey="billToAddress"
              />
            </div>
            <div className="p-4 col-span-4">
              <h2>Ship To Address</h2>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="shipToAddress.projectName">
                    <span>Project Name</span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="shipToAddress.projectName"
                  onChange={handleAddress}
                  value={quote.shipToAddress.projectName}
                  type="text"
                />
              </div>

              <div className={`max-w-full `}>
                <div className="mb-2 block">
                  <Label htmlFor="shipToAddress.a1">
                    <span>A1</span>
                    <span className=" text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="shipToAddress.a1"
                  onChange={handleAddress}
                  value={quote.shipToAddress.a1}
                  placeholder="Building/Office name"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="shipToAddress.a2">
                    <span>A2</span>
                  </Label>
                </div>
                <TextInput
                  name="shipToAddress.a2"
                  onChange={handleAddress}
                  value={quote.shipToAddress.a2}
                  placeholder="Flat/Office No"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="shipToAddress.a3">
                    <span>A3</span>
                  </Label>
                </div>
                <TextInput
                  name="shipToAddress.a3"
                  onChange={handleAddress}
                  value={quote.shipToAddress.a3}
                  placeholder="Road/Lanename"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="shipToAddress.a4">
                    <span>A4</span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="shipToAddress.a4"
                  onChange={handleAddress}
                  value={quote.shipToAddress.a4}
                  placeholder="Location"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="shipToAddress.a5">
                    <span>A5</span>
                  </Label>
                </div>
                <TextInput
                  name="shipToAddress.a5"
                  onChange={handleAddress}
                  value={quote.shipToAddress.a5}
                  placeholder="NearBy: Landmark"
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <span>City</span>
                  <span className="text-red-500 text-xl">*</span>
                </div>
                <TextInput
                  name="shipToAddress.city"
                  value={quote.shipToAddress.city}
                  onChange={handleAddress}
                />
              </div>
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="shipToAddress.pincode">
                    <span>Pincode: </span>
                    <span className="text-red-500 text-xl">*</span>
                  </Label>
                </div>
                <TextInput
                  name="shipToAddress.pincode"
                  value={quote.shipToAddress.pincode}
                  onChange={handleAddress}
                />
              </div>
              <KCI
                quote={quote}
                setQuote={setQuote}
                addressKey="shipToAddress"
              />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-4 gap-4 mb-4 border-1 border-gray-200 rounded-md">
              <div className="max-w-full">
                <div className="mb-2 block">
                  <Label htmlFor="paymentTerms" className="grid grid-cols-12">
                    <span className=" col-span-2">
                      Payment Terms:
                      <span className="text-red-500 text-xl">*</span>
                    </span>
                  </Label>
                </div>
                <TextInput
                  name="paymentTerms"
                  value={quote.paymentTerms}
                  onChange={handleQuoteChange}
                />
              </div>
            </div>
          </div>

          <div className="col-span-1 mb-4">
            <Label>Notes: </Label>
            <Textarea
              name="note"
              onChange={handleQuoteChange}
              value={quote.note}
            />
          </div>
          <Button type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </form>
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
        <CorresponUI quotationId={quoteId} />
      </CustomModal>
    </div>
  );
}
