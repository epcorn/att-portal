import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getSingleContract } from "../redux/contract/contractSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { PageHeader, ManageDC, ManageWorkLog } from "../components";

function WorkLog() {
  const [contract, setContract] = useState();
  const [activeForm, setActiveForm] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    async function fn() {
      try {
        const actionResult = await dispatch(getSingleContract(id));
        const result = unwrapResult(actionResult);
        setContract(result.result);
      } catch (error) {
        navigate("/");
      }
    }
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <PageHeader
        bgColor="bg-[#6FDCE3]"
        recentTitle="Select an action to proceed"
      />
      <div className="flex justify-center mt-6">
        <Button
          onClick={() => setActiveForm("dc")}
          className={`mx-2 ${
            activeForm === "dc" ? "bg-blue-600 text-white" : null
          }`}
        >
          Make DC
        </Button>
        <Button
          onClick={() => setActiveForm("worklog")}
          className={`mx-2 ${
            activeForm === "worklog" ? "bg-blue-600 text-white" : null
          }`}
        >
          Make Worklog
        </Button>
      </div>
      {activeForm === "dc" && (
        <ManageDC id={contract?._id} contract={contract} />
      )}
      {activeForm === "worklog" && (
        <ManageWorkLog id={contract?._id} contract={contract} />
      )}
    </div>
  );
}

export default WorkLog;
