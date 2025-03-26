/* eslint-disable react/prop-types */
import { Button, Textarea, TextInput, Label, Select } from "flowbite-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { createWorklog } from "../../redux/contract/contractSlice";

function WorklogForm({ id, contract, setWorkLogs, onClose }) {
  const dispatch = useDispatch();
  const [validInput, setValidInput] = useState(false);
  const [worklogObj, setWorklogObj] = useState({
    workAreaType: "",
    chemical: "",
    chemicalUsed: "",
    areaTreated: "",
    areaTreatedUnit: "",
    remark: "",
  });

  useEffect(() => {
    if (
      worklogObj.workAreaType !== "" &&
      worklogObj.chemical !== "" &&
      worklogObj.chemicalUsed !== "" &&
      worklogObj.areaTreated !== "" &&
      worklogObj.areaTreatedUnit !== ""
    ) {
      setValidInput(true);
    } else {
      setValidInput(false);
    }
  }, [worklogObj]);

  useEffect(() => {
    setWorklogObj((prev) => ({
      ...prev,
      areaTreatedUnit: contract?.workAreaUnit,
    }));
  }, [contract]);

  function handleWorklogChange(e) {
    const { name, value } = e.target;
    setWorklogObj((prev) => ({ ...prev, [name]: value }));
  }
  async function handleSubmit() {
    if (validInput) {
      const dispatchAction = await dispatch(createWorklog({ worklogObj, id }));
      const result = unwrapResult(dispatchAction);
      const { log } = result;
      toast.info(result.message);
      setWorkLogs((prev) => [...prev, log]);
      setWorklogObj({
        workAreaType: "",
        chemical: "",
        chemicalUsed: "",
        areaTreated: "",
        areaTreatedUnit: contract?.quoteInfo[0]?.workAreaUnit,
        remark: "",
      });
      onClose();
    } else {
      toast.error("Invalid input, please fill all fields.");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h3 className="text-xl font-semibold text-center mb-4">Worklog Form</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="workAreaType" value="Work Area Type" />
          <Select
            id="workAreaType"
            name="workAreaType"
            placeholder="Enter work area type"
            value={worklogObj.workAreaType}
            onChange={handleWorklogChange}
            required
          >
            <option></option>
            {contract?.quoteInfo.map((info) => (
              <option key={info._id}>{info.workAreaType}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="chemical" value="Chemical" />
          <Select
            id="chemical"
            name="chemical"
            placeholder="Enter chemical used"
            value={worklogObj.chemical}
            onChange={handleWorklogChange}
            required
          >
            <option></option>
            {contract?.quoteInfo.map((info) => (
              <option key={info._id}>{info.chemical}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="chemicalUsed" value="Chemical Used (Quantity)" />
          <TextInput
            id="chemicalUsed"
            name="chemicalUsed"
            placeholder="Enter Chemical used quantity (in ml)"
            value={worklogObj.chemicalUsed}
            onChange={handleWorklogChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="areaTreated" value="Area Treated" />
          <div className="grid grid-cols-12 gap-1">
            <TextInput
              id="areaTreated"
              name="areaTreated"
              placeholder="Enter work area treated"
              value={worklogObj.areaTreated}
              onChange={handleWorklogChange}
              required
              className="col-span-10"
            />
            <TextInput
              id="areaTreatedUnit"
              name="areaTreatedUnit"
              value={contract?.workAreaUnit}
              onChange={handleWorklogChange}
              required
              className="col-span-2"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="remark" value="Remark" />
          <Textarea
            id="remark"
            name="remark"
            placeholder="Enter any remarks"
            value={worklogObj.remark}
            onChange={handleWorklogChange}
            rows={3}
          />
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          fullSized
          disabled={!validInput}
        >
          Add Worklog
        </Button>
      </div>
    </div>
  );
}

export default WorklogForm;
