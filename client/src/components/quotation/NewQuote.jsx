/* eslint-disable react/no-unescaped-entities */
import {
  Button,
  Label,
  Radio,
  Select,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createQuote, getGroup, getGroups } from "../../redux/quote/quoteSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  KCI,
  Loading,
  InputStandard,
  InputSupply,
  InputSupplyApply,
} from "../index.js";
import { duplicateBillToShipTo } from "../../funtions/funtion";

const getInitialQuoteState = () => {
  const savedData = localStorage.getItem("newQuote");
  if (savedData) {
    const { quote } = JSON.parse(savedData);
    return quote;
  }
  return {
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
    groupBy: null,
    note: "",
    quotationNo: "",
    docType: "standard",
    quoteInfo: [],
    paymentTerms: "",
  };
};

// eslint-disable-next-line react/prop-types
function NewQuote({ onClose }) {
  const { loading } = useSelector((state) => state.quote);
  const initialState = useMemo(() => getInitialQuoteState(), []);
  const [quote, setQuote] = useState(initialState);
  const [subRef, setSubRef] = useState("");
  const [doc, setDoc] = useState(quote.docType);
  const [disableRadio, setDisableRadio] = useState(false);
  const dispatch = useDispatch();
  const { initials } = useSelector((state) => state.user);
  const [subPaymentTerm, setSubPaymentTerm] = useState("");
  const [error, setError] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  // Load data from local storage on component mount

  useEffect(() => {
    const savedData = localStorage.getItem("newQuote");
    if (savedData) {
      const { quote } = JSON.parse(savedData);
      setQuote(quote);
    }
  }, []);

  useEffect(() => {
    async function fetchGroups() {
      const actionResult = await dispatch(getGroups());
      const result = unwrapResult(actionResult);
      setGroups(result.groups);
    }
    fetchGroups();
  }, [dispatch]);

  useEffect(() => {
    async function fetchGroups() {
      const actionResult = await dispatch(getGroup(selectedGroup));
      const result = unwrapResult(actionResult);
      setQuote(() => result.group.data);
      setQuote((prev) => ({ ...prev, groupBy: result.group._id }));
    }
    if (selectedGroup) {
      fetchGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  // Save data to local storage whenever quote or infoArray changes
  useEffect(() => {
    localStorage.setItem("newQuote", JSON.stringify({ quote }));
  }, [quote, selectedGroup]);

  useEffect(() => {
    if (quote.quoteInfo.length <= 0) {
      setDisableRadio(false);
      setQuote((prev) => ({ ...prev, docType: doc }));
    } else {
      setDisableRadio(true);
      setQuote((prev) => ({ ...prev, docType: doc }));
    }
  }, [doc, quote?.quoteInfo.length]);

  useEffect(() => {
    setQuote((prev) => ({ ...prev, paymentTerms: subPaymentTerm }));
  }, [subPaymentTerm]);

  function handleDocType(e) {
    if (quote.quoteInfo.length <= 0) {
      const { value } = e.target;
      setDoc(value);
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

  // function dummyQuote() {
  //   const data = {
  //     quote: {
  //       billToAddress: {
  //         prefix: "M/s.",
  //         name: "KEC International Ltd.",
  //         a1: "Raghuram Heights",
  //         a2: "463",
  //         a3: "Dr Annie Besant Raod",
  //         a4: "Worli",
  //         a5: "Opposite Hell",
  //         city: "Mumbai",
  //         pincode: "400030",
  //         kci: [],
  //       },
  //       shipToAddress: {
  //         projectName: "Prestige City Rehab Project",
  //         a1: "Raghuram Heights",
  //         a2: "463",
  //         a3: "Dr Annie Besant Raod",
  //         a4: "Worli",
  //         a5: "Opposite Hell",
  //         city: "Mumbai",
  //         pincode: "400030",
  //         kci: [],
  //       },
  //       kindAttentionPrefix: "Mr.",
  //       kindAttention: "Malahari Naik",
  //       reference: "Our earlier quotation No EPPL/ATT/QTN/401",
  //       specification: "As per IS 6313 (Part 2):2013",
  //       note: "",
  //       quoteInfo: [],
  //     },
  //   };
  //   setQuote(data.quote);
  // }
  function handleSubRef(e) {
    const { value } = e.target;
    setSubRef(value);
    if (quote.reference === "" || quote.reference === " ") {
      setQuote((prev) => ({ ...prev, reference: value }));
    } else {
      setQuote((prev) => ({
        ...prev,
        reference: ` ${prev.reference}>. ${value}`,
      }));
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (
      (quote.kindAttention === "" && !setError("kindAttention")) ||
      (quote.kindAttentionPrefix === "" && !setError("kindAttentionPrefix"))
    ) {
      toast.error("Please enter Kind Attn: value!");
      return;
    }
    if (quote.salePerson === "") {
      setError("salePerson");
      toast.error("Please select salePerson!");
      return;
    }
    if (quote.specification === "") {
      setError("specification");
      toast.error("Please enter Specification!");
      return;
    }
    if (
      (quote.billToAddress.prefix === "" &&
        !setError("billToAddress.prefix")) ||
      (quote.billToAddress.name === "" && !setError("billToAddress.name")) ||
      (quote.billToAddress.a1 === "" && !setError("billToAddress.a1")) ||
      (quote.billToAddress.a2 === "" && !setError("billToAddress.a2")) ||
      (quote.billToAddress.a3 === "" && !setError("billToAddress.a3")) ||
      (quote.billToAddress.a4 === "" && !setError("billToAddress.a4")) ||
      (quote.billToAddress.a5 === "" && !setError("billToAddress.a5")) ||
      (quote.billToAddress.city === "" && !setError("billToAddress.city")) ||
      (quote.billToAddress.pincode === "" &&
        !setError("billToAddress.pincode")) ||
      (quote.shipToAddress.projectName === "" &&
        !setError("shipToAddress.projectName")) ||
      (quote.shipToAddress.a1 === "" && !setError("shipToAddress.a1")) ||
      (quote.shipToAddress.a4 === "" && !setError("shipToAddress.a4")) ||
      (quote.shipToAddress.city === "" && !setError("shipToAddress.city")) ||
      (quote.shipToAddress.pincode === "") & !setError("shipToAddress.pincode")
    ) {
      toast.error("BillTo/ShipTo Information is incomplete!");
      return;
    }

    if (quote.reference === "") {
      setError("reference");
      toast.error("Please enter Reference!");
      return;
    }
    if (quote.paymentTerms === "") {
      setError("paymentTerms");
      toast.error("Please enter Payment Terms");
      return;
    }

    if (quote.quoteInfo.length <= 0) {
      toast.error("Please fill the number details.");
      return;
    }
    const data = { quote };
    const actionResult = await dispatch(createQuote(data));
    const result = await unwrapResult(actionResult);
    if (result.message === "Quotation Created!") {
      localStorage.removeItem("newQuote");
    }
    onClose();
  }
  return (
    <div>
      {loading ? <Loading /> : null}
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
                className={`${
                  error === "kindAttentionPrefix"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "kindAttention"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
              />
            </div>
          </div>
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="salePerson">
                <span>Sale Person: </span>
                <span className=" text-red-500">*</span>
              </Label>
            </div>
            <Select
              name="salePerson"
              onChange={handleQuoteChange}
              value={quote.salePerson}
              className={`${
                error === "salePerson"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            >
              <option></option>
              {initials.length > 0 &&
                initials.map((initial) => (
                  <option
                    selected={quote.salePerson}
                    value={initial._id}
                    key={initial._id}
                  >
                    {initial.initials} {initial.username}
                  </option>
                ))}
            </Select>
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
              className={`${
                error === "specification"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            >
              <option></option>
              <option>As per IS 6313 (Part 2):2013 & 2022</option>
              <option>As per IS 6313 (Part 2):2013</option>
            </Select>
          </div>
          <div className="">
            <div className="mb-2 block">
              <Label htmlFor="groupBy" value="Group By"></Label>
            </div>
            <Select
              name="groupBy"
              value={quote.groupBy}
              onChange={(e) => [setSelectedGroup(e.target.value)]}
              className={`${
                error === "groupBy"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            >
              <option></option>
              {groups?.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </div>
          {/* <div className="col-span-5">
            <div className="mb-2 block">
              <Label htmlFor="emailTo">
                <span>Email To: </span>
              </Label>
            </div>
            <TextInput
              type="email"
              name="emailTo"
              onChange={handleQuoteChange}
              value={quote.emailTo}
              className={`${
                error === "emailTo"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            />
          </div> */}
        </div>
        <div className="flex items-center justify-center w-full">
          <Button
            outline
            gradientMonochrome="cyan"
            onClick={() => duplicateBillToShipTo({ quote, setQuote })}
          >
            Copy BillTo/ShipTo
          </Button>
          {/* <Button outline gradientMonochrome="cyan" onClick={dummyQuote}>
            Dummy Quote
          </Button> */}
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
                <Select
                  name="billToAddress.prefix"
                  value={quote.billToAddress.prefix}
                  className={`${
                    error === "billToAddress.prefix"
                      ? "border border-red-500 rounded-lg bg-red-300 "
                      : null
                  }`}
                  onChange={handleAddress}
                >
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
                  className={`${
                    error === "billToAddress.name"
                      ? "border border-red-500 rounded-lg bg-red-300 "
                      : null
                  }`}
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
                className={`${
                  error === "billToAddress.a1"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "billToAddress.a2"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "billToAddress.a3"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "billToAddress.a4"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "billToAddress.a5"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "billToAddress.city"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "billToAddress.pincode"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
              />
            </div>

            <KCI quote={quote} setQuote={setQuote} addressKey="billToAddress" />
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
                className={`${
                  error === "shipToAddress.projectName"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "shipToAddress.a1"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "shipToAddress.a2"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "shipToAddress.a3"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "shipToAddress.a4"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "shipToAddress.a5"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "shipToAddress.city"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
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
                className={`${
                  error === "shipToAddress.pincode"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
              />
            </div>
            <KCI quote={quote} setQuote={setQuote} addressKey="shipToAddress" />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className=" col-span-4 max-w-full border p-1">
            <div className="mb-2 block">
              <Label htmlFor="reference" className="grid grid-cols-12">
                <span className=" col-span-2">
                  Ref: <span className="text-red-500 text-xl">*</span>
                </span>
                <Select
                  name="subRef"
                  onChange={handleSubRef}
                  className="col-span-10"
                  value={subRef}
                >
                  <option></option>
                  <option>Your enquiry & our discussion had with ____</option>
                  <option>Your email Dated **/**/**</option>
                  <option>Your email from _____ Dated **/**/**</option>
                  <option>Your enquiry & our discussion had with </option>
                </Select>
              </Label>
            </div>
            <TextInput
              name="reference"
              onChange={handleQuoteChange}
              value={quote.reference}
              placeholder="Reference"
              className={`${
                error === "reference"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            />
          </div>
          <div className=" col-span-4 gap-4 mb-4 ">
            <div className="col-span-4 border p-1">
              <div className="col-span-2">
                <fieldset className="flex gap-4 w-full justify-evenly">
                  <legend className="mb-4">Choose doc type</legend>
                  <div className="flex gap-2">
                    <Radio
                      id="united-state"
                      name="docType"
                      value="standard"
                      defaultChecked={
                        doc === "" || quote.docType === "standard"
                          ? true
                          : false
                      }
                      disabled={disableRadio}
                      color="yellow"
                      onChange={(e) => handleDocType(e)}
                      className="text-bg-green-500 focus:ring-green-500 checked:bg-green-500"
                    />
                    <Label htmlFor="united-state">Standard</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio
                      id="supply"
                      name="docType"
                      value="supply"
                      disabled={disableRadio}
                      defaultChecked={doc === "supply" ? true : false}
                      color="red"
                      onChange={(e) => handleDocType(e)}
                      className="text-yellow-400 focus:ring-yellow-400 checked:bg-yellow-400"
                    />
                    <Label htmlFor="supply">Supply</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio
                      id="supply/apply"
                      name="docType"
                      value="supply/apply"
                      disabled={disableRadio}
                      defaultChecked={doc === "supply/apply" ? true : false}
                      onChange={(e) => handleDocType(e)}
                      className="text-blue-500 focus:ring-blue-500 checked:bg-blue-500"
                    />
                    <Label htmlFor="supply/apply">Supply/Apply</Label>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
          <div className="col-span-4 gap-4 mb-4 border-1 border-gray-200 rounded-md">
            <div className="max-w-full">
              <div className="mb-2 block">
                <Label htmlFor="paymentTerms" className="grid grid-cols-12">
                  <span className=" col-span-2">
                    Payment Terms:
                    <span className="text-red-500 text-xl">*</span>
                  </span>
                  <Select
                    name="paymentTerms"
                    onChange={(e) => setSubPaymentTerm(e.target.value)}
                    className="col-span-10"
                    value={subPaymentTerm}
                  >
                    <option></option>
                    <option>
                      Within 15 days from the date of submission of bill.
                    </option>
                  </Select>
                </Label>
              </div>
              <TextInput
                name="paymentTerms"
                value={quote.paymentTerms}
                onChange={handleQuoteChange}
                className={`${
                  error === "paymentTerms"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
              />
            </div>
          </div>
        </div>

        {doc === "standard" && (
          <InputStandard quote={quote} setQuote={setQuote} />
        )}

        {doc === "supply" && <InputSupply quote={quote} setQuote={setQuote} />}
        {doc === "supply/apply" && (
          <InputSupplyApply quote={quote} setQuote={setQuote} />
        )}
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
    </div>
  );
}

export default NewQuote;
