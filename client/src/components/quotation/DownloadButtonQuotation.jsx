import { useState } from "react";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { docxData } from "../../redux/quote/quoteSlice.js";
import { Button } from "flowbite-react";
import { generateQuotation } from "../../funtions/docxFn.js";

// eslint-disable-next-line react/prop-types
const DownloadButtonQuotation = ({ id, color, onClick, text, annexure }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const makeQuotation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch data from backend
      const actionResult = await dispatch(docxData(id));
      const result = unwrapResult(actionResult);
      const data = result.result;
      await generateQuotation(data, annexure);
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
        onClick={() => [makeQuotation(), onClick()]}
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : `${text}`}
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default DownloadButtonQuotation;
