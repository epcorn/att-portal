import { Button } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { getSingleContract } from "../../redux/contract/contractSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { Loading } from "..";

// eslint-disable-next-line react/prop-types
const Warrenty = ({ id }) => {
  const dispatch = useDispatch();
  const [contract, setContract] = useState(null);
  const componentRef = useRef(null);
  const [warranty, setWarranty] = useState({
    warrantyPeriod: {
      from: "",
      to: "",
    },
    warrantyDetails: [],
  });
  const [workArea, setWorkArea] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function fn() {
      setLoading(true);
      const actionResult = await dispatch(getSingleContract(id));
      const result = unwrapResult(actionResult);
      setContract(result.result);
      setLoading(false);
    }
    if (id) {
      fn();
    }
  }, [id]);

  useEffect(() => {
    if (contract) {
      setWorkArea(contract.quoteInfo);
    }
  }, [contract]);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: async () => {},
  });
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <div
        ref={componentRef}
        className="max-w-5xl bg-slate-100 mx-auto rounded-lg border border-gray-300 shadow-lg print:max-w-none print:bg-white"
      >
        <div className="border border-gray-400 p-6 bg-white shadow-md rounded-md">
          <p className="flex justify-end mb-4 text-gray-700">
            <span className="font-semibold">Warranty Number:</span>
            <span className="ml-2 text-lg">
              {contract?.warranty?.warrantyNo}
            </span>
          </p>
          <h1 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
            Pre-Construction Anti-Termite Treatment Service Warranty
          </h1>
          <p className="mb-4 text-gray-700">
            <span className="font-semibold">Issue Date:</span>
            <span className="ml-2">12/08/2024</span>
          </p>
          <div className="grid grid-cols-12 border-b pb-6 mb-6">
            <div className="col-span-6 border-r pr-6">
              <p className="font-bold">To,</p>
              <p>
                {`${contract?.billToAddress?.prefix} ${contract?.billToAddress?.name}`}
              </p>
              <p>{`${contract?.billToAddress?.a1} ${contract?.billToAddress?.a2},`}</p>
              <p>{`${contract?.billToAddress?.a3},`}</p>
              <p>{`${contract?.billToAddress?.a4},`}</p>
              <p>{`${contract?.billToAddress?.city} - ${contract?.billToAddress?.pincode},`}</p>
              <p>{`${contract?.billToAddress?.a5}.`}</p>
            </div>

            <div className="col-span-6 flex flex-col justify-center items-start pl-6">
              <p className="font-semibold text-lg text-gray-800 mb-1">
                &rdquo;Project Detail&rdquo;
              </p>
              <p className="font-bold">
                {contract?.shipToAddress?.projectName}
              </p>
              <p>{`${contract?.shipToAddress?.a1} ${contract?.shipToAddress?.a2},`}</p>
              {contract?.shipToAddress?.a3 && (
                <p>{`${contract?.shipToAddress?.a3},`}</p>
              )}
              <p>{`${contract?.shipToAddress?.a4},`}</p>
              <p>{`${contract?.shipToAddress?.city} - ${contract?.shipToAddress?.pincode},`}</p>
              {contract?.shipToAddress?.a5 && (
                <p>{`${contract?.shipToAddress?.a5}.`}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-12 mb-6">
            <div className="col-span-6 flex flex-col">
              <p className="font-semibold text-lg">
                <span>*</span> Service Warranty Period:
              </p>
              <p className="ml-2">
                From:
                <input
                  type="date"
                  onChange={(e) =>
                    setWarranty((state) => ({
                      ...state,
                      warrantyPeriod: {
                        ...state.warrantyPeriod,
                        from: e.target.value,
                      },
                    }))
                  }
                  name="from"
                />
              </p>
              <p className="ml-2">
                Upto:{" "}
                <input
                  name="to"
                  type="date"
                  onChange={(e) =>
                    setWarranty((state) => ({
                      ...state,
                      warrantyPeriod: {
                        ...state.warrantyPeriod,
                        to: e.target.value,
                      },
                    }))
                  }
                />
              </p>
            </div>
            {workArea.length == 1 && (
              <div className="col-span-6 flex justify-center items-center ">
                <div className="w-full ">
                  <span className="text-lg font-semibold ">Chemical Name:</span>
                  {workArea?.map((info, idx) => (
                    <span key={idx} className="font-semibold">
                      {info.chemical}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-justify text-gray-700 leading-relaxed mb-6">
            This service warranty is provided in accordance of the guidelines
            laid for the best practices in Anti Termite Treatment as in
            accordance of ISTM 2024 “Indian Standard of Termite Management”
            whereby the document is used by the accredited Professional Pest
            Management Company.
          </p>
          {workArea.length <= 1 && (
            <div className="mt-6 mb-6">
              <table className="min-w-full border border-gray-500 table-fixed">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-500 p-2 text-center font-semibold">
                      Type of Structure
                    </th>
                    <th className="border border-gray-500 p-2 text-center font-semibold">
                      Area Treated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workArea?.map((info, idx) => (
                    <tr key={idx} className="">
                      <td className="border border-gray-500 p-2 text-center flex-1">
                        {info?.workAreaType}
                      </td>
                      <td className="border border-gray-500 p-2 text-center flex-1">
                        <div className=" inline">
                          <input
                            className="bg-gray-200 text-black border border-blue-400 w-[70px] rounded-md p-1 shadow-sm focus:outline-none focus:ring-transparent focus:ring-blue-300"
                            placeholder="Enter value"
                            value={info.workArea}
                          />
                          <span>{info.workAreaUnit}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {workArea.length > 1 && (
            <div className="mt-6 mb-6">
              <table className="min-w-full border border-gray-500 table-fixed">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-500 p-2 text-center font-semibold">
                      Type of Structure
                    </th>
                    <th className="border border-gray-500 p-2 text-center font-semibold">
                      Chemical Name
                    </th>
                    <th className="border border-gray-500 p-2 text-center font-semibold">
                      Area Treated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workArea?.map((info, idx) => (
                    <tr key={idx} className="">
                      <td className="border border-gray-500 p-2 text-center flex-1">
                        {info?.workAreaType}
                      </td>
                      <td className="border border-gray-500 p-2 text-center flex-1">
                        {info?.chemical}
                      </td>
                      <td className="border border-gray-500 p-2 text-center flex-1">
                        <div className=" inline">
                          <input
                            className="bg-gray-200 text-black border border-blue-400 w-[70px] rounded-md p-1 shadow-sm focus:outline-none focus:ring-transparent focus:ring-blue-300"
                            placeholder="Enter value"
                            value={info.workArea}
                          />
                          <span>{info.workAreaUnit}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-justify text-gray-700 leading-relaxed mb-6">
            <span className="ml-4 text-justify">Hereby</span> certified that the
            structure described in “Project Detail” has been treated against
            subterranean termite and is treated as per mutually agreed
            application standard, for managing termite escalations in the
            treated area, for a period as specified above<span>*</span>. In the
            event if the said structure is found infested with subterranean
            termites at any time during the period of service warranty, we
            undertake to carry out needed treatment using the same chemicals as
            used during the service, such treatment as may be necessary will be
            implemented by us to render the said structure free from termite
            infestation at no extra cost for such treatment to the owner of the
            said premises.
          </p>
          <p className="text-justify text-gray-700 leading-relaxed mb-6">
            <span className="ml-4 text-justify">This</span> Service warranty
            does not cover any responsibility towards the termite infestation
            which would have entered the structure through any future additions
            or extensions made to the structure post our initial treatment or
            through untreated areas. It is in the interest of the owner to
            ensure that any future additions or extensions to the structure and
            any soil matter brought or placed inside the structure are promptly
            treated against termites and covered by a separate Service Warranty.
          </p>
          <div className="flex items-center mt-10">
            <div>
              <p>
                For
                <span className="font-bold">EXPRESS PESTICIDES PVT.LTD.</span>
              </p>
              <p className="mt-16">Authorized Signatory</p>
            </div>
            <div className="ml-auto relative flex justify-center items-center w-36 h-36 border-2 border-gray-800 rounded-full">
              <p className="absolute text-center text-lg">Warranty Seal</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-2">
        <Button gradientDuoTone="purpleToPink" onClick={() => handlePrint()}>
          <span className="mr-2">Print</span>
        </Button>
      </div>
    </>
  );
};

export default Warrenty;
