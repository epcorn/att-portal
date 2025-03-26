/* eslint-disable react/prop-types */
import { FaScissors } from "react-icons/fa6";

function TestChalan({ selectedDc, contract }) {
  return (
    <div className="max-w-2xl mx-auto overflow-hidden m-2">
      <Chalan
        selectedDc={selectedDc}
        contract={contract}
        copyFor="Office Copy"
      />
      <div className="flex justify-center items-center">
        <FaScissors />
        <span>- - - - - - - - - - - - - - - - - - </span>
        <FaScissors />
        <span>- - - - - - - - - - - - - - - - - - </span>
        <FaScissors />
      </div>
      <Chalan
        selectedDc={selectedDc}
        contract={contract}
        copyFor="Client Copy"
      />
    </div>
  );
}

const Chalan = ({ selectedDc = {}, contract = {}, copyFor = "" }) => {
  // Safely access nested properties
  const shipToAddress = contract?.shipToAddress || {};
  const dcObj = selectedDc?.dcObj || [];

  return (
    <div className="p-2 md:p-3 border border-black max-w-2xl mx-auto text-sm md:text-base">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
        <p className="font-bold order-2 md:order-1">{copyFor}</p>
        <div className="order-1 md:order-2">
          <p className="text-center font-medium">MATERIAL CHALLAN</p>
        </div>
        <p className="font-semibold order-3">
          NO <span>{selectedDc?.dcCount || "-"}</span>
        </p>
      </div>

      {/* Company Name */}
      <p className="text-center text-2xl md:text-3xl font-semibold mb-2">
        EPCORN
      </p>
      <p className="text-sm text-center mb-4 border-b border-b-black"></p>

      {/* Shipping and Date Section */}
      <div className="mb-4 flex flex-col md:grid md:grid-cols-12 w-full border border-black">
        <p className="font-semibold md:col-span-8 border-b md:border-b-0 md:border-r border-black p-2">
          <span className="mr-1">Ship To: </span>
          <br />
          <span className="text-sm">
            {shipToAddress.a1 || ""}
            {shipToAddress.a2 ? `, ${shipToAddress.a2}` : ""}
            {shipToAddress.a3 ? `, ${shipToAddress.a3}` : ""}
            {shipToAddress.a4 ? `, ${shipToAddress.a4}` : ""}
            {shipToAddress.a5 ? `, ${shipToAddress.a5}` : ""}
            {shipToAddress.city ? `, ${shipToAddress.city}` : ""}
            {shipToAddress.pincode ? `-${shipToAddress.pincode}` : ""}
          </span>
        </p>
        <div className="text-sm md:col-span-4 p-2 md:p-4">
          <p className="mb-2 md:mb-[30px]">
            <span className="mr-1">Date:</span>
            <span>
              {selectedDc?.createdAt
                ? new Date(selectedDc.createdAt).toLocaleDateString()
                : "-"}
            </span>
          </p>
          <p className="mt-2 md:mt-[30px]">
            <span className="mr-1">S.C:</span>
            <span>{contract?.contractNo || "-"}</span>
          </p>
        </div>
      </div>

      <p className="mb-4 mt-4 text-xs text-justify">
        We are sending with our man the following mentioned material for the
        Anti Termite works on a returnable basis.
      </p>

      {/* Table Section */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full border border-black text-xs md:text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-1 md:p-2 text-left">
                Sr No
              </th>
              <th className="border-r border-black p-1 md:p-2 text-center">
                <p>Chemical Name</p>
                <p>Batch No</p>
              </th>
              <th className="border-r border-black p-1 md:p-2 text-left">
                Packaging
              </th>
              <th className="border-r border-black p-1 md:p-2 text-left">
                QUANTITY (KGS/LTR)
              </th>
              <th className="p-1 md:p-2 text-left">TOTAL QUANTITY</th>
            </tr>
          </thead>
          <tbody>
            {dcObj.map((dc, idx) => (
              <tr
                key={`${dc?.chemical}-${idx}`}
                className="border-b border-black"
              >
                <td className="border-r border-black p-1 md:p-2">{idx + 1}</td>
                <td className="border-r border-black p-1 md:p-2 text-center">
                  <p>{dc?.chemical || "-"}</p>
                  <p>{dc?.batchNo || "-"}</p>
                </td>
                <td className="border-r border-black p-1 md:p-2">
                  {dc?.packaging || "-"}
                </td>
                <td className="border-r border-black p-1 md:p-2">
                  {dc?.chemicalqty || "-"}
                </td>
                <td className="border-r border-black p-1 md:p-2">
                  {dc?.packaging && dc?.chemicalqty
                    ? qunatyCalculator(dc.packaging, dc.chemicalqty)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mt-6">
        <div className="text-sm">
          <p>For EPCORN</p>
          <br />
          <p>ATT Service Dept</p>
        </div>
        <p className="text-sm">Receiver Signature</p>
      </div>
    </div>
  );
};

export default TestChalan;

function qunatyCalculator(packaging, quantity) {
  const [num, unit] = packaging.split(" ");
  console.log(num);
  console.log(quantity);
  return `${Number(num) * Number(quantity)} ${unit}`;
}
