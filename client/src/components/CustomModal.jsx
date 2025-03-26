/* eslint-disable react/prop-types */
import { Modal } from "flowbite-react";
import { useEffect } from "react";

const CustomModal = ({ isOpen, onClose, children, heading, size, bg }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <Modal size={size} show={isOpen} onClose={() => [onClose()]}>
          <Modal.Header className={`${bg}`}>{heading}</Modal.Header>
          <Modal.Body className={`${bg}`}>{children}</Modal.Body>
        </Modal>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-25"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default CustomModal;
