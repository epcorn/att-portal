import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import { CgDanger } from "react-icons/cg";
import { MdVerified } from "react-icons/md";
import { toast } from "react-toastify";

// eslint-disable-next-line react/prop-types
function PopUp({ click, approved, id }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <button
        onClick={
          approved
            ? () => toast.error("Already approved")
            : () => setOpenModal(true)
        }
        className={
          approved === true
            ? "bg-green-400 rounded-lg flex items-center justify-center text-white hover:cursor-default"
            : "bg-orange-500 rounded-lg flex items-center justify-center text-white"
        }
      >
        {approved ? <MdVerified size="15px" /> : <CgDanger size="15px" />}
      </button>
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <span
              className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200"
              style={{ fontSize: "40px" }}
            >
              &#128529;
            </span>
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure? One will not be able to edit this.
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => [setOpenModal(false), click(id)]}
              >
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PopUp;
