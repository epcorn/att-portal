/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import {
  Button,
  Label,
  Select,
  Table,
  Textarea,
  TextInput,
} from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { GiCancel } from "react-icons/gi";
import { customAlphabet } from "nanoid";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { getChemicals } from "../redux/contract/contractSlice";
import { getValueFromNestedObject } from "../funtions/funtion";

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  21
);

function InputSupply({ quote, setQuote, changedFileds, orignalQuote }) {
  const [validInput, setValidInput] = useState(false);
  const infoArrayRef = useRef(quote?.quoteInfo || []);
  const [chemicalList, setChemicalList] = useState([]);
  const [infoObj, setInfoObj] = useState({
    _id: nanoid(),
    workAreaType: "",
    chemicalRate: "",
    chemicalRateUnit: "",
    chemicalQuantity: "",
    chemical: "",
    description: "",
  });
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setQuote((prev) => ({
      ...prev,
      quoteInfo: infoArrayRef.current,
    }));
  }, [setQuote]);

  useEffect(() => {
    if (
      infoObj.workAreaType !== "" &&
      infoObj.chemicalRate !== "" &&
      infoObj.chemicalQuantity !== "" &&
      infoObj.chemical !== ""
    ) {
      setValidInput(true);
    } else {
      setValidInput(false);
    }
  }, [
    infoObj.workAreaType,
    infoObj.chemicalRate,
    infoObj.chemicalRateUnit,
    infoObj.chemicalQuantity,
    infoObj.chemical,
  ]);

  useEffect(() => {
    async function fetchChemicals() {
      const actionResult = await dispatch(getChemicals());
      const result = unwrapResult(actionResult);
      setChemicalList(result.data);
    }
    fetchChemicals();
  }, [dispatch]);

  function handleInfoChange(e) {
    const { name, value } = e.target;
    const dataId = e.target.getAttribute("data-id");
    const modifiedString = `quoteInfo.${dataId}.${name}`;
    const oldValue = orignalQuote
      ? getValueFromNestedObject(orignalQuote.current, modifiedString)
      : null;
    if (oldValue) {
      if (
        oldValue.trim() !== value.trim() &&
        !changedFileds.current.includes(String(modifiedString))
      ) {
        changedFileds.current = [...changedFileds.current, modifiedString];
      } else if (
        oldValue.trim() === value.trim() &&
        changedFileds.current.includes(String(modifiedString))
      ) {
        changedFileds.current = changedFileds.current.filter(
          (keys) => keys !== modifiedString
        );
      }
    }
    setInfoObj((prev) => ({ ...prev, [name]: value }));
  }

  function deleteInfo(id) {
    infoArrayRef.current = infoArrayRef.current.filter(
      (info) => info._id !== id
    );
    setQuote((prev) => ({ ...prev, quoteInfo: infoArrayRef.current }));
  }

  function editInfo(id) {
    const info = infoArrayRef.current.find((el) => el._id === id);
    if (info) {
      setInfoObj(info);
      deleteInfo(id);
      setShowForm(true);
    } else {
      console.error(`KCI with id ${id} not found`);
    }
  }

  function moreInfo() {
    if (
      infoObj.workAreaType !== "" &&
      infoObj.workArea !== "" &&
      infoObj.serviceRate !== "" &&
      infoObj.chemical !== ""
    ) {
      infoArrayRef.current = [...infoArrayRef.current, infoObj];
      setQuote((prev) => ({ ...prev, quoteInfo: infoArrayRef.current }));
      setInfoObj({
        _id: nanoid(),
        workAreaType: "",
        workArea: "",
        workAreaUnit: "",
        serviceRate: "",
        serviceRateUnit: "",
        chemical: "",
        description: "",
      });
      setShowForm(false);
    } else {
      return toast.error("This much info is not sufficient.");
    }
  }

  return (
    <div className="bg-yellow-200 p-4 rounded-lg shadow-md">
      <Button
        color="warning"
        className="mb-2 border-2 border-yellow-800"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Hide Form" : "Add Info"}
      </Button>
      {showForm && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="border border-yellow-400 p-3 rounded bg-yellow-100">
              <Label className="text-yellow-700">Work Area Type: </Label>
              <Select
                name="workAreaType"
                onChange={handleInfoChange}
                value={infoObj.workAreaType}
                data-id={infoObj?._id}
                className="flex-1 bg-yellow-100 border-yellow-400 focus:border-yellow-600 focus:ring-yellow-600"
              >
                <option value=""></option>
                <option value="Basement Area">Basement Area</option>
                <option value="Retaining Wall">Retaining Wall</option>
                <option value="Raft">Raft</option>
                <option value="Plinth">Plinth</option>
                <option value="Periphery">Periphery</option>
                <option value="Floor">Floor</option>
                <option value="Basement Area (Horizontal)">
                  Basement Area (Horizontal)
                </option>
                <option value="Basement Area (Vertical)">
                  Basement Area (Vertical)
                </option>
              </Select>
            </div>
            <div className="border border-yellow-400 p-3 rounded bg-yellow-100">
              <Label className="text-yellow-700">Chemical Rate: </Label>
              <div className="flex gap-2">
                <TextInput
                  name="chemicalRate"
                  value={infoObj.chemicalRate}
                  onChange={handleInfoChange}
                  data-id={infoObj?._id}
                  className="flex-1 bg-yellow-100 border-yellow-400 focus:border-yellow-600 focus:ring-yellow-600"
                />
                <Select
                  name="chemicalRateUnit"
                  onChange={handleInfoChange}
                  value={infoObj.chemicalRateUnit}
                  className="flex-1 bg-yellow-100 border-yellow-400 focus:border-yellow-600 focus:ring-yellow-600"
                >
                  <option value=""></option>
                  <option value="Per Ltr.">Per Ltr.</option>
                  <option value="Lumpsum">Lumpsum</option>
                </Select>
              </div>
            </div>
            <div className="border border-yellow-400 p-3 rounded bg-yellow-100">
              <Label className="text-yellow-700">Chemical Quantity: </Label>
              <TextInput
                name="chemicalQuantity"
                value={infoObj.chemicalQuantity}
                onChange={handleInfoChange}
                data-id={infoObj?._id}
                className="bg-yellow-100 border-yellow-400 focus:border-yellow-600 focus:ring-yellow-600"
              />
            </div>
            <div className="border border-yellow-400 p-3 rounded bg-yellow-100">
              <Label className="text-yellow-700">Chemical: </Label>
              <div className="flex gap-2 items-center justify-center">
                <Select
                  name="chemical"
                  onChange={handleInfoChange}
                  value={infoObj.chemical}
                  data-id={infoObj?._id}
                  className="flex-1 bg-yellow-100 border-yellow-400 focus:border-yellow-600 focus:ring-yellow-600"
                >
                  <option value=""></option>
                  {chemicalList?.map((chem, idx) => (
                    <option key={idx}>{chem.chemical}</option>
                  ))}
                </Select>
                <div className="flex items-center justify-center">
                  <Button
                    onClick={moreInfo}
                    color={validInput ? "success" : "failure"}
                    size="xs"
                    className={`border ${
                      validInput
                        ? "animate-pulse shadow-red-500 shadow-lg"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!validInput} // Disable the button if not valid
                  >
                    ok
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="border border-yellow-400 p-3 rounded bg-yellow-100">
              <Label className="text-yellow-700">Description: </Label>
              <Textarea
                name="description"
                data-id={infoObj?._id}
                value={infoObj.description}
                onChange={handleInfoChange}
                className="bg-white border-yellow-400 focus:border-yellow-600 focus:ring-yellow-600"
              />
            </div>
          </div>
        </div>
      )}
      <div className="max-w-full overflow-x-auto mt-4">
        <Table hoverable={true} className="w-full">
          <Table.Head className="bg-yellow-200 rounded-lg">
            <Table.HeadCell className="text-yellow-700">Sr.No</Table.HeadCell>
            <Table.HeadCell className="text-yellow-700">
              Work Area Type
            </Table.HeadCell>
            <Table.HeadCell className="text-yellow-700">
              Chemical Rate
            </Table.HeadCell>
            <Table.HeadCell className="text-yellow-700">
              Chemical Quantity
            </Table.HeadCell>
            <Table.HeadCell className="text-yellow-700">
              Chemical
            </Table.HeadCell>
            <Table.HeadCell className="text-yellow-700">Edit</Table.HeadCell>
            <Table.HeadCell className="text-yellow-700">Delete</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-yellow-400">
            {infoArrayRef.current.length > 0 &&
              infoArrayRef.current.map((info, idx) => (
                <Table.Row
                  key={info._id}
                  className="bg-yellow-100 hover:bg-yellow-200"
                >
                  <Table.Cell>{idx + 1}</Table.Cell>
                  <Table.Cell className="text-nowrap">
                    {info.workAreaType}
                  </Table.Cell>
                  <Table.Cell className="text-nowrap">{`${info.chemicalRate} ${info.chemicalRateUnit}`}</Table.Cell>
                  <Table.Cell className="text-nowrap">{`${info.chemicalQuantity} Ltr`}</Table.Cell>
                  <Table.Cell className="text-nowrap">
                    {info.chemical}
                  </Table.Cell>
                  <Table.Cell className="text-nowrap">
                    <div className="flex items-center justify-center">
                      <button
                        className="bg-green-500 hover:bg-green-700 rounded-full text-white p-1"
                        onClick={() => editInfo(info._id)}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-center">
                      <button
                        className="bg-red-500 rounded-full hover:bg-red-700 text-white p-1"
                        onClick={() => deleteInfo(info._id)}
                      >
                        <GiCancel className="w-5 h-5" />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default InputSupply;
