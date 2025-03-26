import { useState } from "react";
import { Button, Label, Select, Spinner, TextInput } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { searchQuotes } from "../redux/quote/quoteSlice";
import { searchContracts } from "../redux/contract/contractSlice";
import { searchCards } from "../redux/card/cardSlice";
import { useLocation } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const Search = ({ setExtraQuery }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { initials } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  // Determine if the current route is for quotes
  const isQuotes = pathname === "/quotes";

  // Compute field names and labels based on the current route
  const documentField = isQuotes ? "quotationNo" : "contractNo";
  const documentLabel = isQuotes ? "Quotation No" : "Contract No";
  const dateLabelFrom = isQuotes ? "Quotation Date/From" : "Contract Date/From";
  const dateLabelTo = isQuotes ? "Quotation Date/To" : "Contract Date/To";

  // Consolidate all form fields into one state object
  const [formData, setFormData] = useState({
    createdBy: "",
    projectName: "",
    clientName: "",
    quotationNo: "",
    contractNo: "",
    fromDate: "",
    toDate: "",
  });

  // A generic change handler that updates formData based on the input's name
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Build the query string using URLSearchParams
  const handleSearch = async () => {
    const params = new URLSearchParams();

    // Add common fields
    if (formData.createdBy) params.append("createdBy", formData.createdBy);
    if (formData.projectName)
      params.append("projectName", formData.projectName);
    if (formData.clientName) params.append("clientName", formData.clientName);
    if (formData.fromDate) params.append("fromDate", formData.fromDate);
    if (formData.toDate) params.append("toDate", formData.toDate);

    // Add the document-specific field
    if (isQuotes && formData.quotationNo) {
      params.append("quotationNo", formData.quotationNo);
    } else if (!isQuotes && formData.contractNo) {
      params.append("contractNo", formData.contractNo);
    }

    const query = params.toString();

    // Choose the appropriate search action based on the route
    const searchAction =
      pathname === "/quotes"
        ? searchQuotes
        : pathname === "/contracts"
        ? searchContracts
        : searchCards;

    try {
      setLoading(true);
      const resultAction = await dispatch(searchAction(query));
      setExtraQuery(query);
      // Unwrap the result to throw if there is an error
      unwrapResult(resultAction);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center sm:justify-evenly pr-6 flex-wrap">
        <div>
          <Label htmlFor={documentField} className="font-bold text-blue-600">
            {documentLabel}
          </Label>
          <div className="flex items-center justify-center">
            <TextInput
              type="text"
              name={documentField}
              id={documentField}
              value={formData[documentField]}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="createdBy" className="font-bold text-blue-600">
            Created By
          </Label>
          <div className="flex items-center justify-center">
            <Select
              name="createdBy"
              id="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
            >
              <option value=""></option>
              {initials?.map((initial) => (
                <option value={initial._id} key={initial._id}>
                  {initial.initials} {initial.username}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="projectName" className="font-bold text-blue-600">
            Project Name
          </Label>
          <div className="flex items-center justify-center">
            <TextInput
              type="text"
              name="projectName"
              id="projectName"
              value={formData.projectName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="clientName" className="font-bold text-blue-600">
            Client Name
          </Label>
          <div className="flex items-center justify-center">
            <TextInput
              type="text"
              name="clientName"
              id="clientName"
              value={formData.clientName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="fromDate" className="font-bold text-blue-600">
            {dateLabelFrom}
          </Label>
          <div className="flex items-center justify-center">
            <input
              type="date"
              name="fromDate"
              id="fromDate"
              value={formData.fromDate}
              className="w-full px-3 py-2 border rounded-md"
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="toDate" className="font-bold text-blue-600">
            {dateLabelTo}
          </Label>
          <div className="flex items-center justify-center">
            <input
              type="date"
              name="toDate"
              id="toDate"
              value={formData.toDate}
              className="w-full px-3 py-2 border rounded-md"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-2">
        <Button gradientDuoTone="redToYellow" onClick={handleSearch}>
          {loading ? (
            <div className="flex items-center justify-center">
              <span className="pr-3">Searching...</span>
              <Spinner size="sm" />
            </div>
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Search;
