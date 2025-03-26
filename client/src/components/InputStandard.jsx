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
import { getChemicals } from "../redux/contract/contractSlice";
import { useDispatch } from "react-redux";
import { getValueFromNestedObject } from "../funtions/funtion";

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  21
);

function InputStandard({ quote, setQuote, changedFileds, orignalQuote }) {
  const [validInput, setValidInput] = useState(false);
  const [chemicalList, setChemicalList] = useState([]);
  const [infoObj, setInfoObj] = useState({
    _id: nanoid(),
    workAreaType: "",
    workArea: "",
    workAreaUnit: "",
    serviceRate: "",
    serviceRateUnit: "",
    chemical: "",
    description: "",
  });
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const infoArrayRef = useRef(quote?.quoteInfo || []);

  //effect to set the infoArray initially
  useEffect(() => {
    infoArrayRef.current = quote?.quoteInfo;
  }, [quote.quoteInfo]);

  //fetch chemical
  useEffect(() => {
    async function fetchChemicals() {
      const actionResult = await dispatch(getChemicals());
      const result = unwrapResult(actionResult);
      setChemicalList(result.data);
    }
    fetchChemicals();
  }, [dispatch]);

  //effect to set validInput variable
  useEffect(() => {
    if (
      infoObj.workAreaType !== "" &&
      infoObj.workArea !== "" &&
      infoObj.serviceRate !== "" &&
      infoObj.chemical !== ""
    ) {
      setValidInput(true);
    } else {
      setValidInput(false);
    }
  }, [
    infoObj.workAreaType,
    infoObj.workArea,
    infoObj.workAreaUnit,
    infoObj.serviceRate,
    infoObj.serviceRateUnit,
    infoObj.chemical,
  ]);

  useEffect(() => {
    let newServiceRateUnit = "";

    switch (infoObj.workAreaUnit) {
      case "Sq.fts":
        newServiceRateUnit = "Per Sq.ft";
        break;
      case "Sq.mts":
        newServiceRateUnit = "Per Sq.mt";
        break;
      case "R.fts":
        newServiceRateUnit = "Per R.ft";
        break;
      case "R.mts":
        newServiceRateUnit = "Per R.mt";
        break;
      default:
        newServiceRateUnit = "";
    }

    setInfoObj((prevInfoObj) => ({
      ...prevInfoObj,
      serviceRateUnit: newServiceRateUnit,
    }));
  }, [infoObj.workAreaUnit]);

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
    <div className="bg-lime-200 p-4 rounded-lg shadow-md">
      {/* Toggle button to show/hide the form */}
      <Button
        gradientMonochrome="lime"
        className="mb-2 border-2 border-lime-800"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Hide Form" : "Add Info"}
      </Button>
      {showForm && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="border border-lime-400 p-3 rounded bg-lime-100">
              <Label className="text-lime-700">Work Area Type: </Label>
              <Select
                name="workAreaType"
                onChange={handleInfoChange}
                value={infoObj.workAreaType}
                data-id={infoObj?._id}
                className="bg-lime-50 border-lime-400 focus:border-lime-600 focus:ring-lime-600 flex-1"
              >
                <option value=""></option>
                <option>Basement Area</option>
                <option>Retaining Wall</option>
                <option>Raft</option>
                <option>Plinth</option>
                <option>Periphery</option>
                <option>Floor</option>
                <option>Basement Area (Horizontal)</option>
                <option>Basement Area (Vertical)</option>
              </Select>
            </div>
            <div className="border border-lime-400 p-3 rounded bg-lime-100">
              <Label className="text-lime-700">Work Area: </Label>
              <div className="flex gap-2">
                <TextInput
                  name="workArea"
                  value={infoObj.workArea}
                  onChange={handleInfoChange}
                  data-id={infoObj?._id}
                  className="flex-1 bg-lime-50 border-lime-400 focus:border-lime-600 focus:ring-lime-600"
                />
                <Select
                  name="workAreaUnit"
                  onChange={handleInfoChange}
                  value={infoObj.workAreaUnit}
                  data-id={infoObj?._id}
                  className="flex-1 bg-lime-50 border-lime-400 focus:border-lime-600 focus:ring-lime-600"
                >
                  <option value=""></option>
                  <option value="Sq.fts">Sq.fts</option>
                  <option value="Sq.mts">Sq.mts</option>
                  <option value="R.fts">R.fts</option>
                  <option value="R.mts">R.mts</option>
                </Select>
              </div>
            </div>
            <div className="border border-lime-400 p-3 rounded bg-lime-100">
              <Label className="text-lime-700">Service Rate: </Label>
              <div className="flex gap-2">
                <TextInput
                  name="serviceRate"
                  value={infoObj.serviceRate}
                  onChange={handleInfoChange}
                  data-id={infoObj?._id}
                  className="flex-1 bg-lime-50 border-lime-400 focus:border-lime-600 focus:ring-lime-600"
                />
                <Select
                  name="serviceRateUnit"
                  onChange={handleInfoChange}
                  value={infoObj.serviceRateUnit}
                  className="flex-1 bg-lime-50 border-lime-400 focus:border-lime-600 focus:ring-lime-600"
                >
                  <option value=""></option>
                  <option value="Per Sq.ft">Per Sq.ft</option>
                  <option value="Per Sq.mt">Per Sq.mt</option>
                  <option value="Per R.ft">Per R.ft</option>
                  <option value="Per R.mt">Per R.mt</option>
                  <option value="Lumpsum">Lumpsum</option>
                </Select>
              </div>
            </div>
            <div className="border border-lime-400 p-3 rounded bg-lime-100">
              <Label className="text-lime-700">Chemical: </Label>
              <div className="flex gap-2 items-center justify-center">
                <Select
                  name="chemical"
                  onChange={handleInfoChange}
                  value={infoObj.chemical}
                  data-id={infoObj?._id}
                  className="flex-1 bg-lime-50 border-lime-400 focus:border-lime-600 focus:ring-lime-600"
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
            <div className="border border-lime-400 p-3 rounded bg-lime-100">
              <Label className="text-lime-700">Description: </Label>
              <div className="flex gap-2">
                <Textarea
                  name="description"
                  value={infoObj.description}
                  onChange={handleInfoChange}
                  className="flex-1 bg-white border-lime-400 focus:border-lime-600 focus:ring-lime-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-full overflow-x-auto mt-4">
        <Table hoverable={true} className="w-full">
          <Table.Head className="bg-lime-200 rounded-lg">
            <Table.HeadCell className="text-lime-700">Sr.No</Table.HeadCell>
            <Table.HeadCell className="text-lime-700">
              Work Area Type
            </Table.HeadCell>
            <Table.HeadCell className="text-lime-700">Work Area</Table.HeadCell>
            <Table.HeadCell className="text-lime-700">
              Service Rate
            </Table.HeadCell>
            <Table.HeadCell className="text-lime-700">Chemical</Table.HeadCell>
            <Table.HeadCell className="text-lime-700">Edit</Table.HeadCell>
            <Table.HeadCell className="text-lime-700">Delete</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-lime-400">
            {infoArrayRef.current.length > 0 &&
              infoArrayRef.current.map((info, idx) => (
                <Table.Row
                  key={info._id}
                  className="bg-lime-100 hover:bg-lime-200"
                >
                  <Table.Cell>{idx + 1}</Table.Cell>
                  <Table.Cell className="text-nowrap">
                    {info.workAreaType}
                  </Table.Cell>
                  <Table.Cell className="text-nowrap">{`${info.workArea} ${info.workAreaUnit}`}</Table.Cell>
                  <Table.Cell className="text-nowrap">{`${info.serviceRate} ${info.serviceRateUnit}`}</Table.Cell>
                  <Table.Cell className="text-nowrap">
                    {info.chemical}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="bg-green-500 hover:bg-green-700 rounded-full text-white p-1"
                        onClick={() => editInfo(info._id)}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
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

export default InputStandard;
