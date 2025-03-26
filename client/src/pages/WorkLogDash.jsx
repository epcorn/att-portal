import headerTransparent from "../images/headerTransparent.png";
import qrcodeSample from "../images/qrcodeSample.png";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const WorkLogDash = () => {
  useEffect(() => {
    const qrScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10, // Frames per second
        qrbox: { width: "500px", height: "500px" }, // Scanner box dimensions
      },
      /* verbose= */ false
    );

    qrScanner.render(
      (decodedText, decodedResult) => {
        console.log(decodedResult);
        alert(`QR Code Scanned: ${decodedText}`);
      },
      (error) => {
        console.error(`Error scanning QR code: ${error}`);
      }
    );

    return () => {
      qrScanner.clear();
    };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Section - Service Card */}
      <div className="bg-pink-400 p-6 rounded-md shadow-md">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <img
            src={headerTransparent}
            className="w-full h-18 mr-2 bg-pink-400"
            alt="Logo"
          />
        </div>

        {/* Client & Project Details */}
        <div className=" mb-4">
          <p className="font-medium mb-2">
            Client: M/s. Cowtown Infotech Services Ltd
          </p>
          <p className="mb-2">Project: Lodha Stella Project (Tower B)</p>
          <p>
            Address: Kapurbawdi, Ghodbunder Road, Thane (W),
            <br />
            Pin Code - 400 607
          </p>
        </div>

        {/* Contact Details and QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Contact Details */}
          <div>
            <p className=" font-medium mb-2">Site Contact Details</p>
            <p className=" text-sm mb-1">
              Contact Person: Mr. Amey Bannore (P.M)
            </p>
            <p className=" text-sm mb-1">Telephone: 98191 26973</p>
            <p className=" text-sm mb-1">Email: amey.bannore@lodhagroup.com</p>
            <p className=" text-sm mt-3">
              Contact Person: Mr. Rohan Singh (S.E)
            </p>
            <p className=" text-sm">Telephone: 90041 99633</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center items-center">
            <div className="bg-white p-2 rounded-md">
              <img
                src={qrcodeSample}
                alt="QR Code"
                className="h-32 w-32 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className=" text-sm mt-6">
          <p>Ref: EPPL/OTN/ATT/174</p>
          <p>Date: 30/09/2024</p>
        </div>
      </div>

      {/* Right Section - QR Code Scanner */}
      <div className=" w-full h-full flex flex-col items-center justify-center bg-gray-100 p-1 rounded-md shadow-md">
        <h3 className="text-gray-700 font-semibold text-lg mb-2">
          Scan the Actual Service Card
        </h3>
        <div
          id="qr-reader"
          className="w-full h-2/4 lg:h-full flex justify-center items-center bg-gray-300 border-2 border-dashed border-gray-500 rounded-md"
        ></div>
        <p className="text-gray-500 text-sm text-center mt-2">
          Point your camera at the QR Code to scan.
        </p>
      </div>
    </div>
  );
};

export default WorkLogDash;
