/* eslint-disable react/prop-types */
import { Button, TextInput, Label, Select, Spinner } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDC, getChemicals } from "../../redux/contract/contractSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

function DCForm({ id, contract, setDCs, onClose }) {
  const { loading } = useSelector((store) => store.contract);
  const dispatch = useDispatch();
  const [validInput, setValidInput] = useState(false);
  const [chemicalList, setChemicalList] = useState([]);
  const [batchNos, setBatchNos] = useState([]);
  const [dcObj, setDcObj] = useState({
    chemical: "",
    batchNo: "",
    chemicalqty: "",
    packaging: "",
  });
  const dcArryRef = useRef([]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setDcObj((prev) => ({ ...prev, [name]: value }));
  }
  useEffect(() => {
    if (
      dcObj.chemical !== "" &&
      dcObj.batchNo !== "" &&
      dcObj.chemicalqty !== ""
    ) {
      setValidInput(true);
    } else {
      setValidInput(false);
    }
  }, [dcObj]);

  useEffect(() => {
    async function fetchChemicals() {
      const actionResult = await dispatch(getChemicals());
      const result = unwrapResult(actionResult);
      setChemicalList(result.data);
    }
    fetchChemicals();
  }, [dispatch]);

  useEffect(() => {
    const selectChemical = chemicalList.find(
      (obj) => obj.chemical === dcObj.chemical
    );
    setBatchNos(selectChemical?.batchNos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dcObj.chemical]);

  async function handleSubmit() {
    if (validInput) {
      dcArryRef.current = [...dcArryRef.current, dcObj];
      const dispatchAction = await dispatch(
        createDC({ id, dcObj: dcArryRef.current })
      );
      const result = unwrapResult(dispatchAction);
      toast.info(result.message);
      setDCs((prev) => [...prev, result.dc]);
      setDcObj({
        chemical: "",
        batchNo: "",
        chemicalqty: "",
        packaging: "",
      });
      onClose();
    } else {
      toast.error("Invalid input, please fill all fields.");
    }
  }
  function addMore() {
    dcArryRef.current = [...dcArryRef.current, dcObj];
    setDcObj({
      chemical: "",
      batchNo: "",
      chemicalqty: "",
      packaging: "",
    });
  }
  return (
    <div className="max-w-md mx-auto p-6">
      <h3 className="text-xl font-semibold text-center mb-4">DC Form</h3>
      <form className="space-y-4">
        <div>
          <Label htmlFor="chemical" value="Chemical" />
          <Select
            id="chemical"
            name="chemical"
            placeholder="Enter chemical name"
            value={dcObj.chemical}
            onChange={handleInputChange}
            required
          >
            <option></option>
            {contract?.quoteInfo.map((info) => (
              <option key={info._id}>{info.chemical}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="batchNo" value="Batch Number" />
          <Select
            id="batchNo"
            name="batchNo"
            placeholder="Select batch number"
            value={dcObj.batchNo}
            onChange={handleInputChange}
            required
          >
            <option></option>
            {batchNos?.map((no, idx) => (
              <option key={idx}>{no}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="packaging" value="Packaging" />
          <Select
            id="packaging"
            name="packaging"
            placeholder="Enter packaging name"
            value={dcObj.packaging}
            onChange={handleInputChange}
            required
          >
            <option></option>
            <option>250 ml</option>
            <option>500 ml</option>
            <option>1 Liter</option>
            <option>5 Liters</option>
            <option>20 Liters</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="chemicalqty" value="Quantity" />
          <TextInput
            id="chemicalqty"
            name="chemicalqty"
            placeholder="Enter quantity"
            value={dcObj.chemicalqty}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button
          type="button"
          disabled={!validInput}
          onClick={handleSubmit}
          fullSized
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Spinner size="sm" className="mr-2" />
              <span>Logging in...</span>
            </div>
          ) : (
            "Submit"
          )}
        </Button>
        <Button
          type="button"
          disabled={!validInput}
          onClick={addMore}
          fullSized
        >
          Add More
        </Button>
      </form>
    </div>
  );
}

export default DCForm;
