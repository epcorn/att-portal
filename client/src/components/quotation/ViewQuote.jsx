/* eslint-disable react/prop-types */
import { unwrapResult } from "@reduxjs/toolkit";
import { useReactToPrint } from "react-to-print";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { docxData } from "../../redux/quote/quoteSlice.js";
import {
  isRevised,
  saprateQuoteInfo,
  substringsExistInArray,
} from "../../funtions/funtion.js";
import { Button } from "flowbite-react";
import headerImage from "../../images/header.png";
import footerImage from "../../images/footer.png";
import stamp from "../../images/stamp.png";
import { Loading } from "../../components";

// eslint-disable-next-line react/prop-types, react/display-name
const ViewQuote = forwardRef((props) => {
  {
    // eslint-disable-next-line react/prop-types
    const { quoteId, data, changes = [] } = props;
    const dispatch = useDispatch();
    const [quote, setQuote] = useState({});
    const [standard, setStandard] = useState([]);
    const [applySupply, setApplySupply] = useState([]);
    const [supply, setSupply] = useState([]);
    const { loading } = useSelector((state) => state.quote);
    const componentRef = useRef();

    useEffect(() => {
      async function fn() {
        const actionResult = await dispatch(docxData(quoteId));
        const result = unwrapResult(actionResult);
        setQuote(result.result);
        if (result.result.docType) {
          result.result.docType === "standard"
            ? setStandard(result.result.quoteInfo)
            : result.result.docType === "supply/apply"
            ? setApplySupply(result.result.quoteInfo)
            : result.result.docType === "supply"
            ? setSupply(result.result.quoteInfo)
            : null;
        } else {
          const [a1, a2] = saprateQuoteInfo(result.result.quoteInfo);
          setStandard(a1);
          setApplySupply(a2);
        }
      }
      if (quoteId) {
        fn();
      } else {
        if (data?.docType) {
          data.docType === "standard"
            ? setStandard(data.quoteInfo)
            : data.docType === "supply/apply"
            ? setApplySupply(data.quoteInfo)
            : data.docType === "supply"
            ? setSupply(data.quoteInfo)
            : null;
        }
        setQuote(data ? data : []);
      }
    }, [data, dispatch, quoteId]);
    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
      onAfterPrint: async () => {
        // const resultAction = await dispatch(incPrintCount(id));
        // // eslint-disable-next-line no-unused-vars
        // const result = unwrapResult(resultAction);
        // close();
      },
    });
    return (
      <>
        {loading && <Loading />}
        <div
          ref={componentRef}
          className="max-w-7xl mx-auto my-1 p-4 bg-white shadow-md rounded-lg flex items-center justify-center border"
        >
          <div className="word-section1 p-4 w-full">
            {/* Header Image */}
            <div className="flex justify-center">
              <img src={headerImage} alt="Header Image" className="w-full " />
            </div>

            {/* Quotation Title */}
            <p className="text-center text-lg font-bold mt-4">Quotation</p>

            {/* Quotation Information */}
            <div className="mt-4">
              <p className={`text-sm font-bold `}>
                <span
                  className={` ${
                    substringsExistInArray(["quotationNo"], changes)
                      ? "bg-red-200"
                      : ""
                  }`}
                >
                  {`Quotation No:  
                ${quote.quotationNo ? quote.quotationNo : quote._id}`}
                </span>
              </p>
              <p className={`text-sm font-bold `}>
                <span>
                  {`
               Date:   
                ${
                  quote?.quotationDate
                    ? new Date(quote?.quotationDate).toLocaleDateString("en-GB")
                    : new Date(quote?.createdAt).toLocaleDateString("en-GB")
                }
               `}
                </span>
              </p>
            </div>

            {/* Bill To and Ship To Information */}
            <div className="mt-4 flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-2">
                <p className="font-bold">Bill To:</p>
                <p
                  className={` ${
                    substringsExistInArray(
                      ["billToAddress.prefix", "billToAddress.name"],
                      changes
                    )
                      ? "bg-red-200"
                      : ""
                  }`}
                >
                  {`${quote?.billToAddress?.prefix} ${quote?.billToAddress?.name}`}
                </p>
                <p
                  className={` ${
                    substringsExistInArray(
                      ["billToAddress.a1", "billToAddress.a2"],
                      changes
                    )
                      ? "bg-red-200"
                      : ""
                  }`}
                >{`${quote?.billToAddress?.a1} ${quote?.billToAddress?.a2},`}</p>
                <p
                  className={` ${
                    substringsExistInArray(["billToAddress.a3"], changes)
                      ? "bg-red-200"
                      : ""
                  }`}
                >{`${quote?.billToAddress?.a3},`}</p>
                <p
                  className={` ${
                    substringsExistInArray(["billToAddress.a4"], changes)
                      ? "bg-red-200"
                      : ""
                  }`}
                >{`${quote?.billToAddress?.a4},`}</p>
                <p
                  className={` ${
                    substringsExistInArray(
                      ["billToAddress.city", "billToAddress.pincode"],
                      changes
                    )
                      ? "bg-red-200"
                      : ""
                  }`}
                >{`${quote?.billToAddress?.city} - ${quote?.billToAddress?.pincode},`}</p>
                <p
                  className={` ${
                    substringsExistInArray(["billToAddress.a5"], changes)
                      ? "bg-red-200"
                      : ""
                  }`}
                >{`${quote?.billToAddress?.a5}.`}</p>
              </div>
              <div className="w-full md:w-1/2 p-2">
                <p className="font-bold">Ship To:</p>
                <p
                  className={`font-bold ${
                    substringsExistInArray(
                      ["shipToAddress.projectName"],
                      changes
                    )
                      ? "bg-red-200"
                      : ""
                  }`}
                >
                  {quote?.shipToAddress?.projectName}
                </p>
                <p
                  className={`${
                    substringsExistInArray(
                      ["shipToAddress.a1", "shipToAddress.a2"],
                      changes
                    )
                      ? "bg-red-200"
                      : ""
                  }`}
                >{`${quote?.shipToAddress?.a1} ${quote?.shipToAddress?.a2},`}</p>
                {quote?.shipToAddress?.a3 && (
                  <p
                    className={`${
                      substringsExistInArray(["shipToAddress.a3"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >{`${quote?.shipToAddress?.a3},`}</p>
                )}
                <p
                  className={`${
                    substringsExistInArray(["shipToAddress.a4"], changes)
                      ? "bg-red-200"
                      : ""
                  }`}
                >{`${quote?.shipToAddress?.a4},`}</p>
                <p
                  className={`${
                    substringsExistInArray(
                      ["shipToAddress.city", "shipToAddress.pincode"],
                      changes
                    )
                      ? "bg-red-200"
                      : ""
                  }`}
                >{`${quote?.shipToAddress?.city} - ${quote?.shipToAddress?.pincode},`}</p>
                {quote?.shipToAddress?.a5 && (
                  <p
                    className={`${
                      substringsExistInArray(["shipToAddress.a5"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >{`${quote?.shipToAddress?.a5}.`}</p>
                )}
              </div>
            </div>

            {/* Kind Attention */}
            {quote?.kindAttention && quote?.kindAttention?.trim() !== "NA" ? (
              <div className="mt-4">
                <p
                  className={`font-bold ${
                    substringsExistInArray(
                      ["kindAttentionPrefix", "kindAttention"],
                      changes
                    )
                      ? "bg-red-200"
                      : ""
                  }`}
                >
                  Kind Attention:
                  {`${quote?.kindAttentionPrefix} ${quote?.kindAttention}`}
                </p>
              </div>
            ) : null}

            {/* Quotation Description */}
            <div className="mt-4">
              {!isRevised(quote.quotationNo) && (
                <p
                  className={`font-bold ${
                    substringsExistInArray(["salesPerson"], changes)
                      ? "bg-red-200"
                      : ""
                  }`}
                >
                  {quote?.salesPerson?.initials === "SALES"
                    ? "We thank you for your enquiry and the opportunity given to us to quote our rates, Further to your instructions, we are pleased to submit our quotation as below"
                    : `We thank for your enquiry & the time given to our Representative ${quote?.salesPerson?.prefix} ${quote?.salesPerson?.username}`}
                </p>
              )}
              {isRevised(quote.quotationNo) ? (
                <p className="font-bold">
                  As per your requirement, submiting our revised offer as below.
                </p>
              ) : null}
            </div>

            {/* Quotation Details Table */}
            <table className="w-full mt-4">
              <tbody>
                <tr className="">
                  <td className="w-1/4 p-2  font-bold">Subject:</td>
                  <td
                    className={`w-3/4 p-2 ${
                      substringsExistInArray(["subject"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >
                    {quote?.subject}
                  </td>
                </tr>
                <tr className="">
                  <td className="w-1/4 p-2  font-bold">Reference:</td>
                  <td
                    className={`w-3/4 p-2 ${
                      substringsExistInArray(["reference"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >
                    {quote?.reference?.map((ref, idx) => (
                      <div key={idx}>
                        <span className=" font-bold ">
                          {quote.reference.length > 1 && idx + 1}
                        </span>
                        {ref}
                      </div>
                    ))}
                  </td>
                </tr>
                <tr className="">
                  <td className="w-1/4 p-2  font-bold">Treatment Type:</td>
                  <td
                    className={`w-3/4 p-2 ${
                      substringsExistInArray(["treatmentType"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >
                    {quote?.treatmentType + " [Sac-code ... 998531]"}
                  </td>
                </tr>
                <tr className="">
                  <td className="w-1/4 p-2  font-bold">Specification:</td>
                  <td
                    className={`w-3/4 p-2 ${
                      substringsExistInArray(["specification"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >
                    {quote?.specification}
                  </td>
                </tr>
                <tr className="">
                  <td className="w-1/4 p-2  font-bold">Payment Terms:</td>
                  <td
                    className={`w-3/4 p-2 ${
                      substringsExistInArray(["paymentTerms"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >
                    {String(quote?.paymentTerms)
                      .split(".")
                      .filter((v) => v.trim() !== "")
                      .map((ref, idx) => (
                        <div key={idx}>
                          <span className=" font-bold ">
                            {String(quote.paymentTerms)
                              .split(".")
                              .filter((v) => v.trim() !== "").length > 1 &&
                              idx + 1}
                          </span>
                          {ref}
                        </div>
                      ))}
                  </td>
                </tr>
                <tr className="">
                  <td className="w-1/4 p-2  font-bold">Taxation:</td>
                  <td
                    className={`w-3/4 p-2 ${
                      substringsExistInArray(["taxation"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >
                    {quote?.taxation}
                  </td>
                </tr>
                <tr className="">
                  <td className="w-1/4 p-2  font-bold">Equipments:</td>
                  <td
                    className={`w-3/4 p-2 ${
                      substringsExistInArray(["equipments"], changes)
                        ? "bg-red-200"
                        : ""
                    }`}
                  >
                    {quote?.equipments}
                  </td>
                </tr>
                <tr className="">
                  <td className="w-1/4 p-2  font-bold">Service Warranty:</td>
                  <td className="w-3/4 p-2 text-justify ">
                    10 Years In case of subterranean or ground dwelling of
                    termite infestation during the warranty period, we undertake
                    to treat the same and eradicate the termite infestation
                    without any extra cost to you. This warranty will be
                    forwarded on stamp paper.
                  </td>
                </tr>
                {quote.note && quote.note.trim() !== "" ? (
                  <tr className="">
                    <td className="w-1/4 p-2  font-bold">Notes:</td>
                    <td
                      className={`w-3/4 p-2 ${
                        substringsExistInArray(["notes"], changes)
                          ? "bg-red-200"
                          : ""
                      }`}
                    >
                      {quote?.note}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            {/* Quote Information */}
            <div className="mt-4">
              <p className="font-bold">Quote Information:</p>
              {standard.length > 0 && (
                <div>
                  <table className="min-w-full  border border-black">
                    <thead className="bg-gray-300">
                      <tr>
                        <th className="border border-black p-1 text-center font-bold">
                          Work Area Type
                        </th>
                        <th className="border border-black p-1 text-center font-bold">
                          Work Area
                        </th>
                        <th className="border border-black p-1 text-center font-bold">
                          Service Rate
                        </th>
                        <th className="border border-black p-1 text-center font-bold">
                          Chemical
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {standard.map((info) => (
                        <tr key={info._id} className={`border-t border-black `}>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [`${info._id}.workAreaType`],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >
                            {info.workAreaType}
                          </td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [
                                  `${info._id}.workArea`,
                                  `${info._id}.workAreaUnit`,
                                ],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >{`${info.workArea} ${info.workAreaUnit}`}</td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [
                                  `${info._id}.serviceRate`,
                                  `${info._id}.serviceRateUnit`,
                                ],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >{`Rs ${info.serviceRate} ${info.serviceRateUnit}`}</td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [`${info._id}.chemical`],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >
                            {info.chemical}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {applySupply.length > 0 && (
                <div>
                  <table className="min-w-full  border border-black">
                    <thead className="bg-gray-300">
                      <tr>
                        <th className="border border-black p-2 text-center font-bold">
                          Work Area Type
                        </th>
                        <th className="border border-black p-2 text-center font-bold">
                          Work Area
                        </th>
                        <th className="border border-black p-2 text-center font-bold">
                          Apply Rate
                        </th>
                        <th className="border border-black p-2 text-center font-bold">
                          Chemical Quantity
                        </th>
                        <th className="border border-black p-2 text-center font-bold">
                          Chemical Rate
                        </th>
                        <th className="border border-black p-2 text-center font-bold">
                          Chemical
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {applySupply.map((info) => (
                        <tr key={info._id} className="border-t border-black">
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [`${info._id}.workAreaType`],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >
                            {info.workAreaType}
                          </td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [
                                  `${info._id}.workArea`,
                                  `${info._id}.workAreaUnit`,
                                ],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >{`${info.workArea} ${info.workAreaUnit}`}</td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [
                                  `${info._id}.applyRate`,
                                  `${info._id}.applyRateUnit`,
                                ],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >{`Rs ${info.applyRate} ${info.applyRateUnit}`}</td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [`${info._id}.chemicalQunatity`],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >{`${info.chemicalQuantity} Ltr.`}</td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [
                                  `${info._id}.chemicalRate`,
                                  `${info._id}.chemicalRateUnit`,
                                ],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >{`${info.chemicalRate} ${info.chemicalRateUnit}`}</td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [`${info._id}.chemical`],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >
                            {info.chemical}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {supply.length > 0 && (
                <div>
                  <table className="min-w-full  border border-black">
                    <thead className="bg-gray-300">
                      <tr>
                        <th className="border border-black p-2 text-center font-bold">
                          Work Area Type
                        </th>
                        <th className="border border-black p-2 text-center font-bold">
                          Chemical Quantity
                        </th>
                        <th className="border border-black p-2 text-center font-bold">
                          Chemical Rate
                        </th>
                        <th className="border border-black p-2 text-center font-bold">
                          Chemical
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {supply.map((info) => (
                        <tr key={info._id} className="border-t border-black">
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [`${info._id}.workAreaType`],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >
                            {info.workAreaType}
                          </td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [`${info._id}.chemicalQuantity`],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >{`${info.chemicalQuantity} Ltr.`}</td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [
                                  `${info._id}.chemicalRate`,
                                  `${info._id}.chemicalRateUnit`,
                                ],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >{`Rs ${info.chemicalRate} ${info.chemicalRateUnit}`}</td>
                          <td
                            className={`border border-black p-1 text-center ${
                              substringsExistInArray(
                                [`${info._id}.chemical`],
                                changes
                              )
                                ? "bg-red-200"
                                : ""
                            }`}
                          >
                            {info.chemical}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Closing Notes */}
            <div className="mt-4">
              <p>
                We hope you will accept the same and will give us the
                opportunity to be of service to you.
              </p>
              <p className=" text-xs">
                Please call us for clarification if any.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-4">
              <p>Thanking you,</p>
              <p>Yours faithfully,</p>
              <p>For EXPRESS PESTICIDES PVT. LTD.</p>
              <div className="mt-1 flex justify-start">
                <img src={stamp} alt="Signature" className="w-12 h-10" />
              </div>
              <p>Authorized Signatory</p>
              <p
                className={` ${
                  substringsExistInArray(["salesPerson"], changes)
                    ? "bg-red-200"
                    : ""
                }`}
              >{`${quote?.createdBy?.initials}/
                    ${quote?.salesPerson?.initials}`}</p>
            </div>

            {/* Footer Image */}
            <div className="flex justify-center mt-4">
              <img
                src={footerImage}
                alt="Footer Image"
                className="w-full max-w-lg"
              />
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
  }
});

export default ViewQuote;
