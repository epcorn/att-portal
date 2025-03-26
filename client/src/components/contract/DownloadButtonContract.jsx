import { useState } from "react";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { docxData } from "../../redux/contract/contractSlice.js";
import { Button } from "flowbite-react";
import { generateContract } from "../../funtions/docxFn.js";
// eslint-disable-next-line react/prop-types, no-unused-vars
const DownloadButtonContract = ({ id, color, onClick, text, annexure }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const makeContract = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch data from backend
      const actionResult = await dispatch(docxData(id));
      const result = unwrapResult(actionResult);
      const data = result.result;
      await generateContract(data, annexure);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        color={color}
        onClick={() => [makeContract(), onClick()]}
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : `${text}`}
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default DownloadButtonContract;
