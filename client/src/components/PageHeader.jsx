/* eslint-disable react/prop-types */
import Refresh from "./Refresh";

const PageHeader = ({ bgColor, recentTitle, nextNumber, buttons }) => {
  return (
    <div
      className={`h-16 text-lg flex items-center justify-between font-medium border border-black rounded-tl-lg rounded-br-lg ${bgColor}`}
    >
      <div className="m-2">
        <Refresh />
      </div>

      {nextNumber && (
        <div>
          <span>{nextNumber.label}: </span>
          <span className="bg-yellow-300 text-black font-bold px-2 py-1 rounded-md">
            {nextNumber.value + 1}
          </span>
        </div>
      )}

      <div className="flex-grow mr-4 flex items-center justify-evenly">
        <div className="flex items-center justify-center">
          <h3>{recentTitle}</h3>
        </div>
      </div>

      <div className="flex items-center gap-2">{buttons}</div>
    </div>
  );
};

export default PageHeader;
