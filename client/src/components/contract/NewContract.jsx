/* eslint-disable react/no-unescaped-entities */
import {
  Button,
  Checkbox,
  Label,
  Radio,
  Select,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { createContract } from "../../redux/contract/contractSlice";
import { duplicateBillToShipTo } from "../../funtions/funtion";
import {
  KCI,
  Loading,
  InputStandard,
  InputSupply,
  InputSupplyApply,
  CustomModal,
} from "../index.js";
import { getGroup, getGroups } from "../../redux/quote/quoteSlice.js";

const getInitialContractState = () => {
  const savedData = localStorage.getItem("newContract");
  if (savedData) {
    const { contract } = JSON.parse(savedData);
    return contract;
  }
  return {
    salesPerson: "",
    os: false,
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
    emailTo: "",
    note: "",
    docType: "standard",
    quoteInfo: [],
    workOrderNo: "",
    workOrderDate: "",
    gstNo: "",
    paymentTerms: "",
    groupBy: null,
  };
};
// eslint-disable-next-line react/prop-types
function NewContract({ onClose }) {
  const { loading } = useSelector((state) => state.contract);
  const initialState = useMemo(() => getInitialContractState(), []);
  const [contract, setContract] = useState(initialState);
  const [doc, setDoc] = useState(contract.docType);
  const [disableRadio, setDisableRadio] = useState(false);
  const [areaTypeModel, setAreaTypeModel] = useState(false);
  const [subPaymentTerm, setSubPaymentTerm] = useState("");
  const dispatch = useDispatch();
  const { initials } = useSelector((state) => state.user);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Save data to local storage whenever contract or infoArray changes
  useEffect(() => {
    localStorage.setItem("newContract", JSON.stringify({ contract }));
  }, [contract]);

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
      setContract(() => result.group.data);
      setContract((prev) => ({ ...prev, groupBy: result.group._id }));
    }
    if (selectedGroup) {
      fetchGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);
  function handleDocType(e) {
    if (contract.quoteInfo.length <= 0) {
      const { value } = e.target;
      setDoc(value);
    }
  }
  useEffect(() => {
    setContract((prev) => ({ ...prev, paymentTerms: subPaymentTerm }));
  }, [subPaymentTerm]);
  useEffect(() => {
    if (contract.quoteInfo.length <= 0) {
      setDisableRadio(false);
      setContract((prev) => ({ ...prev, docType: doc }));
    } else {
      setDisableRadio(true);
      setContract((prev) => ({ ...prev, docType: doc }));
    }
  }, [doc, contract.quoteInfo.length]);
  function handleQuoteChange(e) {
    const { name, value } = e.target;
    setContract((prev) => ({ ...prev, [name]: value }));
  }
  function handleAddress(e) {
    const { name, value } = e.target;
    const [addressType, fieldName] = name.split(".");

    if (addressType === "billToAddress" || addressType === "shipToAddress") {
      setContract((prev) => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [fieldName]: value,
        },
      }));
    } else {
      setContract((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }
  function dummyQuote() {
    const data = {
      contract: {
        billToAddress: {
          prefix: "M/s.",
          name: "KEC International Ltd.",
          a1: "Raghuram Heights",
          a2: "463",
          a3: "Dr Annie Besant Raod",
          a4: "Worli",
          a5: "Opposite Hell",
          city: "Mumbai",
          pincode: "400030",
          kci: [],
        },
        shipToAddress: {
          projectName: "Prestige City Rehab Project",
          a1: "Raghuram Heights",
          a2: "463",
          a3: "Dr Annie Besant Raod",
          a4: "Worli",
          a5: "Opposite Hell",
          city: "Mumbai",
          pincode: "400030",
          kci: [],
        },
        kindAttentionPrefix: "Mr.",
        kindAttention: "Malahari Naik",
        reference: "Our earlier quotation No EPPL/ATT/QTN/401",
        specification: "As per IS 6313 (Part 2):2013",
        note: "",
        quoteInfo: [],
        activeClauses: {
          taxation: true,
          warranty: true,
        },
      },
    };
    setContract(data.contract);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (
      contract.billToAddress.name === "" ||
      contract.billToAddress.a1 === "" ||
      contract.billToAddress.a2 === "" ||
      contract.billToAddress.a3 === "" ||
      contract.billToAddress.a4 === "" ||
      contract.billToAddress.a5 === "" ||
      contract.billToAddress.city === "" ||
      contract.billToAddress.kci.length < 1 ||
      contract.shipToAddress.name === "" ||
      contract.shipToAddress.a1 === "" ||
      contract.shipToAddress.pincode === "" ||
      contract.shipToAddress.a2 === "" ||
      contract.shipToAddress.a3 === "" ||
      contract.shipToAddress.a4 === "" ||
      contract.shipToAddress.a5 === "" ||
      contract.shipToAddress.city === "" ||
      contract.shipToAddress.pincode === "" ||
      contract.shipToAddress.kci.length < 1
    ) {
      toast.error("BillTo/ShipTo Information is incomplete!");
      return;
    }
    if (contract.salesPerson === "") {
      toast.error("Please select salesPerson!");
      return;
    }
    if (contract.quoteInfo.length <= 0) {
      toast.error("Please fill the number details.");
      return;
    }

    const data = { contract };
    const actionResult = await dispatch(createContract(data));
    const result = await unwrapResult(actionResult);
    if (result.message === "Contract Created!") {
      localStorage.removeItem("newContract");
    }
    onClose();
  }
  return (
    <div>
      {loading ? <Loading /> : null}
      <form className="">
        <div className="flex items-center justify-evenly gap-4 mb-4 flex-wrap">
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="workOrderNo" value="Work Order No" />
            </div>
            <TextInput
              name="workOrderNo"
              value={contract.workOrderNo}
              onChange={handleQuoteChange}
            />
          </div>
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="workOrderDate" value="Work Order Date" />
            </div>
            <input
              name="workOrderDate"
              type="date"
              value={contract.workOrderDate}
              onChange={handleQuoteChange}
            />
          </div>
          <div className="max-w-full">
            <div className="mb-2 block">
              <Label htmlFor="salesPerson">
                <span>Sale Person: </span>
                <span className=" text-red-500">*</span>
              </Label>
            </div>
            <Select
              name="salesPerson"
              onChange={handleQuoteChange}
              value={contract.salesPerson}
            >
              <option></option>
              {initials.length > 0 &&
                initials.map((initial) => (
                  <option
                    selected={contract.salesPerson === initial._id}
                    key={initial._id}
                    value={initial._id}
                  >
                    {initial.initials} {initial.username}
                  </option>
                ))}
            </Select>
          </div>
          <div className="max-w-full flex gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={contract.os}
                onChange={() =>
                  setContract((prev) => ({
                    ...prev,
                    os: !prev.os,
                  }))
                }
                id="os"
              />
              <Label htmlFor="os">OS</Label>
            </div>
          </div>
          <div className="">
            <div className="mb-2 block">
              <Label htmlFor="groupBy" value="Group By"></Label>
            </div>
            <Select
              name="groupBy"
              value={contract.groupBy}
              onChange={(e) => [
                setSelectedGroup(e.target.value),
                handleQuoteChange(e),
              ]}
            >
              <option></option>
              {groups?.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <Button
            outline
            gradientMonochrome="cyan"
            onClick={() =>
              duplicateBillToShipTo({ quote: contract, setQuote: setContract })
            }
          >
            Copy BillTo/ShipTo
          </Button>
          <Button outline gradientMonochrome="cyan" onClick={dummyQuote}>
            Dummy contract
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
                <Select
                  name="billToAddress.prefix"
                  onChange={handleAddress}
                  value={contract.billToAddress.prefix}
                >
                  <option></option>
                  <option
                    selected={contract.billToAddress.prefix === "M/s."}
                    value="M/s."
                  >
                    M/s.
                  </option>
                  <option
                    selected={contract.billToAddress.prefix === "Mr."}
                    value="Mr."
                  >
                    Mr.
                  </option>
                  <option
                    selected={contract.billToAddress.prefix === "Mrs."}
                    value="Mrs."
                  >
                    Mrs.
                  </option>
                </Select>
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
                  value={contract.billToAddress.name}
                  onChange={handleAddress}
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
                onChange={handleAddress}
                value={contract.billToAddress.a1}
                placeholder="Building/Office name"
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
                onChange={handleAddress}
                value={contract.billToAddress.a2}
                placeholder="Flat/Office No"
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
                onChange={handleAddress}
                value={contract.billToAddress.a3}
                placeholder="Road/Lanename"
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
                onChange={handleAddress}
                value={contract.billToAddress.a4}
                placeholder="Location"
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
                onChange={handleAddress}
                value={contract.billToAddress.a5}
                placeholder="NearBy: Landmark"
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
                value={contract.billToAddress.city}
                onChange={handleAddress}
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
                onChange={handleAddress}
                value={contract.billToAddress.pincode}
              />
            </div>

            <KCI
              quote={contract}
              setQuote={setContract}
              addressKey="billToAddress"
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
                onChange={handleAddress}
                value={contract.shipToAddress.projectName}
                type="text"
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
                onChange={handleAddress}
                value={contract.shipToAddress.a1}
                placeholder="Building/Office name"
              />
            </div>
            <div className="max-w-full">
              <div className="mb-2 block">
                <Label htmlFor="shipToAddress.a2">
                  <span>A2</span>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              <TextInput
                name="shipToAddress.a2"
                onChange={handleAddress}
                value={contract.shipToAddress.a2}
                placeholder="Flat/Office No"
              />
            </div>
            <div className="max-w-full">
              <div className="mb-2 block">
                <Label htmlFor="shipToAddress.a3">
                  <span>A3</span>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              <TextInput
                name="shipToAddress.a3"
                onChange={handleAddress}
                value={contract.shipToAddress.a3}
                placeholder="Road/Lanename"
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
                onChange={handleAddress}
                value={contract.shipToAddress.a4}
                placeholder="Location"
              />
            </div>
            <div className="max-w-full">
              <div className="mb-2 block">
                <Label htmlFor="shipToAddress.a5">
                  <span>A5</span>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              <TextInput
                name="shipToAddress.a5"
                onChange={handleAddress}
                value={contract.shipToAddress.a5}
                placeholder="NearBy: Landmark"
              />
            </div>
            <div className="max-w-full">
              <div className="mb-2 block">
                <span>City</span>
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                name="shipToAddress.city"
                value={contract.shipToAddress.city}
                onChange={handleAddress}
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
                value={contract.shipToAddress.pincode}
                onChange={handleAddress}
              />
            </div>
            <KCI
              quote={contract}
              setQuote={setContract}
              addressKey="shipToAddress"
            />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-4 gap-4 mb-4">
            <div className="max-w-full">
              <div className="mb-2 block">
                <Label htmlFor="gstNo" value="(Client) GST No:" />
              </div>
              <TextInput
                name="gstNo"
                value={contract.gstNo}
                onChange={handleQuoteChange}
              />
            </div>
          </div>
          <div className=" col-span-4 gap-4 mb-4 ">
            <div className="col-span-4 p-1">
              <div className="col-span-2">
                <fieldset className="flex gap-4 w-full justify-evenly">
                  <legend className="mb-4">Choose doc type</legend>
                  <div className="flex gap-2">
                    <Radio
                      id="united-state"
                      name="docType"
                      value="standard"
                      checked={
                        doc === "" || contract.docType === "standard"
                          ? true
                          : false
                      }
                      disabled={disableRadio}
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
                      checked={doc === "supply" ? true : false}
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
                      checked={doc === "supply/apply" ? true : false}
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
                    Payment Terms: <span className="text-red-500">*</span>
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
                value={contract.paymentTerms}
                onChange={handleQuoteChange}
              />
            </div>
          </div>
        </div>

        {doc === "standard" && (
          <InputStandard quote={contract} setQuote={setContract} />
        )}

        {doc === "supply" && (
          <InputSupply quote={contract} setQuote={setContract} />
        )}
        {doc === "supply/apply" && (
          <InputSupplyApply quote={contract} setQuote={setContract} />
        )}
        <div className="col-span-1 mb-4">
          <Label>Notes: </Label>
          <Textarea
            name="note"
            onChange={handleQuoteChange}
            value={contract.note}
          />
        </div>
        <Button type="submit" onClick={handleSubmit}>
          Submit
        </Button>
      </form>
      <CustomModal
        isOpen={areaTypeModel}
        onClose={() => setAreaTypeModel(!areaTypeModel)}
        heading="New Work Area Type"
      >
        <h1>Hey Hey!</h1>
      </CustomModal>
    </div>
  );
}

export default NewContract;
