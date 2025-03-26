import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleQuote, updateQuote } from "../../redux/quote/quoteSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  InputStandard,
  InputSupply,
  InputSupplyApply,
  KCI,
  Loading,
} from "../index.js";
import { Button, Label, Select, Textarea, TextInput } from "flowbite-react";
import { toast } from "react-toastify";
import {
  duplicateBillToShipTo,
  getValueFromNestedObject,
} from "../../funtions/funtion";

// eslint-disable-next-line react/prop-types
function UpdateQuotation({ quoteId, onClose }) {
  const dispatch = useDispatch();
  const [quote, setQuote] = useState(null);
  const orignalQuote = useRef({});
  const [message, setMessage] = useState("");
  const changedFileds = useRef([]);
  // eslint-disable-next-line no-unused-vars
  const [subRef, setSubRef] = useState();
  const { loading } = useSelector((state) => state.quote);
  const { initials } = useSelector((state) => state.user);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuote() {
      const actionResult = await dispatch(getSingleQuote(quoteId));
      const result = unwrapResult(actionResult);
      const output = result.result;
      output.reference = output.reference.join(">.");
      setQuote(output);
      orignalQuote.current = output;
    }
    fetchQuote();
  }, [dispatch, quoteId]);
  if (loading) {
    return <Loading />;
  }

  if (!quote) {
    return <p className="text-center text-gray-500">No quote data available</p>;
  }

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    const { id } = dataset;

    if (name.startsWith("quoteInfo")) {
      const updatedQuoteInfo = quote.quoteInfo.map((info) => {
        if (info._id === id) {
          return {
            ...info,
            [name.split(".").pop()]: value,
          };
        }
        return info;
      });

      setQuote({
        ...quote,
        quoteInfo: updatedQuoteInfo,
      });
    } else {
      // Handle other fields not in quoteInfo array
      if (name.includes(".")) {
        const [parentKey, nestedKey] = name.split(".");
        setQuote({
          ...quote,
          [parentKey]: {
            ...quote[parentKey],
            [nestedKey]: value,
          },
        });
      } else if (name === "kindAttentionPrefix" && value === "NA") {
        setQuote((prev) => ({ ...prev, kindAttention: "NA", [name]: value }));
        return;
      } else {
        setQuote({
          ...quote,
          [name]: value,
        });
      }
      const oldValue = getValueFromNestedObject(orignalQuote.current, name);
      if (name.includes(".")) {
        if (
          oldValue.trim() !== value.trim() &&
          !changedFileds.current.includes(String(name))
        ) {
          changedFileds.current = [...changedFileds.current, name];
        } else if (
          oldValue.trim() === value.trim() &&
          changedFileds.current.includes(String(name))
        ) {
          changedFileds.current = changedFileds.current.filter(
            (keys) => keys !== name
          );
        }
      } else {
        if (
          value.trim() !== oldValue.trim() &&
          !changedFileds.current.includes(String(name))
        ) {
          changedFileds.current = [...changedFileds.current, name];
        } else if (
          oldValue.trim() === value.trim() &&
          changedFileds.current.includes(String(name))
        ) {
          changedFileds.current = changedFileds.current.filter(
            (keys) => keys !== name
          );
        }
      }
    }
  };
  async function handleSubmitApproved() {
    // if (message === "") {
    //   toast.error("Please provide resion for Revision.");
    //   return;
    // }
    if (quote.quoteInfo.length <= 0) {
      toast.error("Please fill the number details.");
      return;
    }
    const data = {
      id: quoteId,
      quote,
      message,
      modified: changedFileds.current,
    };
    const actionResult = await dispatch(updateQuote(data));
    // eslint-disable-next-line no-unused-vars
    const result = unwrapResult(actionResult);
    onClose();
  }
  async function handleSubmitNotApproved() {
    const data = { id: quoteId, quote, message };
    if (quote.quoteInfo.length <= 0) {
      toast.error("Please fill the number details.");
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
    const actionResult = await dispatch(updateQuote(data));
    // eslint-disable-next-line no-unused-vars
    const result = unwrapResult(actionResult);
    onClose();
  }

  function handleSubRef(e) {
    const { value } = e.target;
    setSubRef(value);
    if (quote === "") {
      setQuote((prev) => ({ ...prev, reference: value }));
    } else if (quote !== "") {
      setQuote((prev) => ({
        ...prev,
        reference: ` ${prev.reference}>. ${value}`,
      }));
    }
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-evenly gap-2 mb-4 flex-wrap">
        <div className="max-w-full grid grid-cols-6">
          <div className="col-span-1">
            <div className="mb-2 ">
              <Label htmlFor="kindAttentionPrefix">
                <span>Prefix</span>
                <span className=" text-red-500">*</span>
              </Label>
            </div>
            <Select
              name="kindAttentionPrefix"
              value={quote.kindAttentionPrefix}
              onChange={handleChange}
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
              onChange={handleChange}
              value={quote.kindAttention}
              className={`${
                error === "kindAttention"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            />
          </div>
        </div>
        <div className="">
          <div className="mb-2 block">
            <Label htmlFor="salePerson">
              <span>Sale Person: </span>
              <span className=" text-red-500">*</span>
            </Label>
          </div>

          <Select
            name="salesPerson"
            className={`${
              error === "salePerson"
                ? "border border-red-500 rounded-lg bg-red-300 "
                : null
            }`}
            onChange={handleChange}
          >
            <option></option>
            {initials.length > 0 &&
              initials.map((initial) => (
                <option
                  selected={quote?.salesPerson === initial._id}
                  value={initial._id}
                  key={initial._id}
                >
                  {initial.initials} {initial.username}
                </option>
              ))}
          </Select>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="emailTo">
              <span>Email To: </span>
            </Label>
          </div>
          <TextInput
            type="email"
            name="emailTo"
            onChange={handleChange}
            value={quote.emailTo}
            className={`${
              error === "emailTo"
                ? "border border-red-500 rounded-lg bg-red-300 "
                : null
            }`}
          />
        </div>
        <div className="">
          <div className="mb-2 block">
            <Label htmlFor="specification" value="Specification">
              <span>Specification</span>
              <span className="text-red-500">*</span>
            </Label>
          </div>
          <Select
            name="specification"
            onChange={handleChange}
            value={quote.specification}
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
      </div>
      <div className="flex items-center justify-center w-full">
        <Button
          outline
          gradientMonochrome="cyan"
          onClick={() => duplicateBillToShipTo({ quote, setQuote })}
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
              </div>
              <TextInput
                name="billToAddress.prefix"
                value={quote.billToAddress.prefix}
                onChange={handleChange}
                className={`${
                  error === "billToAddress.prefix"
                    ? "border border-red-500 rounded-lg bg-red-300 "
                    : null
                }`}
              ></TextInput>
            </div>
            <div className=" col-span-5">
              <div className="mb-2">
                <Label htmlFor="billToAddress.name">
                  <span>Name</span>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              <TextInput
                type="text"
                name="billToAddress.name"
                value={quote.billToAddress?.name}
                onChange={handleChange}
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
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="billToAddress.a1"
              value={quote.billToAddress?.a1}
              placeholder="Building/Office name"
              onChange={handleChange}
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
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="billToAddress.a2"
              value={quote.billToAddress?.a2}
              placeholder="Flat/Office No"
              onChange={handleChange}
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
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="billToAddress.a3"
              value={quote.billToAddress?.a3}
              placeholder="Road/Lanename"
              onChange={handleChange}
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
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="billToAddress.a4"
              value={quote.billToAddress?.a4}
              placeholder="Location"
              onChange={handleChange}
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
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="billToAddress.a5"
              value={quote.billToAddress?.a5}
              placeholder="NearBy: Landmark"
              onChange={handleChange}
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
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="billToAddress.city"
              value={quote.billToAddress?.city}
              onChange={handleChange}
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
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="billToAddress.pincode"
              value={quote.billToAddress?.pincode}
              onChange={handleChange}
              className={`${
                error === "billToAddress.pincode"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            />
          </div>
          <KCI
            quote={quote}
            setQuote={setQuote}
            addressKey="billToAddress"
            changedFileds={changedFileds}
            orignalQuote={orignalQuote}
          />
        </div>
        <div className="p-4 col-span-4">
          <h3>Ship To Address</h3>
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="shipToAddress.projectName">
                <span>Project Name</span>
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="shipToAddress.projectName"
              value={quote.shipToAddress?.projectName}
              onChange={handleChange}
              type="text"
              className={`${
                error === "shipToAddress.projectName"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            />
          </div>

          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="shipToAddress.a1">
                <span>A1</span>
                <span className=" text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="shipToAddress.a1"
              value={quote.shipToAddress?.a1}
              placeholder="Building/Office name"
              onChange={handleChange}
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
              value={quote.shipToAddress?.a2}
              placeholder="Flat/Office No"
              onChange={handleChange}
              className={`${
                error === "shipToAddress?.a2"
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
              value={quote.shipToAddress?.a3}
              placeholder="Road/Lanename"
              onChange={handleChange}
              className={`${
                error === "shipToAddress?.a3"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            />
          </div>
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="shipToAddress.a4">
                <span>A4</span>
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="shipToAddress.a4"
              value={quote.shipToAddress?.a4}
              placeholder="Location"
              onChange={handleChange}
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
              value={quote.shipToAddress?.a5}
              placeholder="NearBy: Landmark"
              onChange={handleChange}
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
              <span className="text-red-500">*</span>
            </div>
            <TextInput
              name="shipToAddress.city"
              value={quote.shipToAddress?.city}
              onChange={handleChange}
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
                <span className="text-red-500">*</span>
              </Label>
            </div>
            <TextInput
              name="shipToAddress.pincode"
              value={quote.shipToAddress?.pincode}
              onChange={handleChange}
              className={`${
                error === "shipToAddress.pincode"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            />
          </div>
          <KCI
            quote={quote}
            setQuote={setQuote}
            addressKey="shipToAddress"
            changedFileds={changedFileds}
            orignalQuote={orignalQuote}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="max-w-full border p-1">
          <div className="mb-2 block">
            <Label htmlFor="subReference" className="grid grid-cols-12">
              <span className=" col-span-2">
                Ref: <span className="text-red-500">*</span>
              </span>
              <Select
                name="subReference"
                className="col-span-9"
                onChange={handleSubRef}
              >
                <option></option>
                {quote.approved ? (
                  <option>{`Our earlier quotation No: ${
                    quote.quotationNo
                  } dated ${new Date(quote.quotationDate).toLocaleDateString(
                    "en-GB"
                  )} being revised.`}</option>
                ) : (
                  <option> Ref1</option>
                )}
                <option>Ref2</option>
              </Select>
            </Label>
          </div>
          <TextInput
            name="reference"
            onChange={handleChange}
            value={quote.reference}
            placeholder="Reference"
            className={`${
              error === "reference"
                ? "border border-red-500 rounded-lg bg-red-300 "
                : null
            }`}
          />
        </div>
        <div className="max-w-full gap-4 mb-2">
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="paymentTerms" value="Payment Terms" />
            </div>
            <TextInput
              name="paymentTerms"
              value={quote.paymentTerms}
              onChange={handleChange}
              className={`${
                error === "paymentTerms"
                  ? "border border-red-500 rounded-lg bg-red-300 "
                  : null
              }`}
            />
          </div>
        </div>
      </div>

      {quote.docType === "standard" && (
        <InputStandard
          quote={quote}
          setQuote={setQuote}
          changedFileds={changedFileds}
          orignalQuote={orignalQuote}
        />
      )}

      {quote.docType === "supply" && (
        <InputSupply
          quote={quote}
          setQuote={setQuote}
          changedFileds={changedFileds}
          orignalQuote={orignalQuote}
        />
      )}
      {quote.docType === "supply/apply" && (
        <InputSupplyApply
          quote={quote}
          setQuote={setQuote}
          changedFileds={changedFileds}
          orignalQuote={orignalQuote}
        />
      )}
      {quote.approved ? (
        <div className="col-span-1 mb-4">
          <Label>
            <span>Revision Reason:</span>
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      ) : null}
      <div className="col-span-1 mb-4">
        <Label>Notes: </Label>
        <Textarea name="note" value={quote.note} onChange={handleChange} />
      </div>
      <div>
        <Button
          onClick={
            quote.approved ? handleSubmitApproved : handleSubmitNotApproved
          }
          gradientDuoTone="redToYellow"
        >
          Update
        </Button>
      </div>
    </div>
  );
}

export default UpdateQuotation;
