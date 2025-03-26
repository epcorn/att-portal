import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import morpheus from "../images/morpheus.png";

// eslint-disable-next-line react/prop-types
function PopUpMorpheus({ id, disabled, setQuoteId, children }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div>
        <Button
          gradientDuoTone="purpleToPink"
          onClick={() => [setOpenModal(true), setQuoteId(id)]}
          disabled={disabled}
        >
          .docx
        </Button>
      </div>

      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <div className="max-w-md mx-auto p-4">
              <div className="mt-4">
                <img
                  src={morpheus}
                  alt="Preview"
                  className="w-full h-auto object-cover rounded-md"
                />
              </div>
            </div>
          </div>
          <div>{children}</div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PopUpMorpheus;
