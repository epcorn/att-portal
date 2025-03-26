/* eslint-disable react/prop-types */
const RevisionHistoryCard = ({
  revision,
  onClick,
  active,
  docType = "quote",
}) => {
  const { author, state, timestamp, changes } = revision;
  const { quotationNo, shipToAddress, _id } = state;
  const formattedDate = new Date(timestamp).toLocaleDateString("en-GB");
  const formattedTime = new Date(timestamp).toLocaleTimeString();
  const cardStyles = active
    ? "w-sm bg-red-200 shadow-lg rounded-lg overflow-hidden mb-4 border-2 border-red-500"
    : "w-sm bg-white shadow-lg rounded-lg overflow-hidden mb-4";

  return (
    <div onClick={() => onClick({ state, changes })} className={cardStyles}>
      <div className="bg-gray-800 text-white text-center py-2">
        {docType === "quote" ? (
          <h2 className="text-xl font-bold">
            Quotation No: {quotationNo ? quotationNo : _id}
          </h2>
        ) : (
          <h2 className="text-xl font-bold">
            Contract No: {state.contractNo ? state.contractNo : _id}
          </h2>
        )}
      </div>
      <div className="p-4">
        {state?.contractified && (
          <div className=" text-orange-500 flex items-center justify-center">
            <h3 className="text-lg font-semibold">Contract</h3>
          </div>
        )}
        <div className="mb-2">
          <span className="font-semibold">Author:</span> {author?.prefix}{" "}
          {author?.username} ({author?.initials})
        </div>
        <div className="mb-2">
          <span className="font-semibold">Date:</span> {formattedDate}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Time:</span> {formattedTime}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Project Name:</span>{" "}
          {shipToAddress?.projectName}
        </div>
        {revision?.message && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Revision Reason:</h3>
            <p className="text-gray-700">{revision.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionHistoryCard;
