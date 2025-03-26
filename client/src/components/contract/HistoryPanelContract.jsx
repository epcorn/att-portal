/* eslint-disable react/prop-types */
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { unwrapResult } from "@reduxjs/toolkit";
import { Loading, RevisionHistoryCard, ViewContract } from "../index.js";
import { archiveDataContract } from "../../redux/contract/contractSlice.js";

function HistoryPanelContract({ contractId }) {
  const dispatch = useDispatch();
  const [latest, setLatest] = useState({});
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resultAction = await dispatch(archiveDataContract(contractId));
        const result = unwrapResult(resultAction);

        const { archive: history, ...rest } = result.result;
        const obj = {
          state: rest,
          message: "",
          author: rest.createdBy,
          _id: rest._id,
          timestamp: rest.updatedAt,
        };
        setLatest(rest);
        setArchive(() => [...(history?.revisions ?? []), obj]);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, contractId]);

  const handleCardClick = (revision) => {
    const { state, changes } = revision;

    setSelectedRevision(state);
    setChanges(changes);
  };
  const revisionDetails = selectedRevision || latest;
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side: Revision History Cards */}
      <div className="w-1/4 pr-4 overflow-y-scroll h-full ">
        {/* Adjust height and add overflow-y-auto */}
        <h2 className="text-lg font-semibold sticky top-0 bg-white pb-2">
          Revision History:
        </h2>
        {/* Make the header sticky */}
        <div className="mt-2 flex flex-col gap-4 ]">
          {archive
            ?.slice()
            .reverse()
            .map((revision, index) => (
              <RevisionHistoryCard
                key={index}
                revision={revision}
                onClick={handleCardClick}
                active={
                  revision.state.contractNo === revisionDetails?.contractNo
                }
                docType="contract"
              />
            ))}
        </div>
      </div>

      {/* Right Side: Details */}

      <div className="w-3/4 overflow-y-auto h-full">
        {loading && <Loading />}
        {revisionDetails && (
          <ViewContract data={revisionDetails} changes={changes} />
        )}
      </div>
    </div>
  );
}

export default HistoryPanelContract;
