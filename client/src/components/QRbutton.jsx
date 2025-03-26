/* eslint-disable react/prop-types */
import { Button } from "flowbite-react";
import { base64Url } from "../funtions/funtion.js";
import { Document, Packer } from "docx";
import { saveAs } from "file-saver";
import { MdFileDownload } from "react-icons/md";
import { workLogdocx } from "../funtions/docxFn.js";

const QRCodeComponent = ({ id, data }) => {
  const downloadQRCode = async () => {
    const qrCodeUrl = await base64Url(id);
    if (qrCodeUrl) {
      // Check if the URL starts with the correct data URL scheme
      if (qrCodeUrl.startsWith("data:image/png;base64,")) {
        const link = document.createElement("a");
        link.href = qrCodeUrl;
        link.download = `qrcode_${id}.png`; // Filename for the downloaded QR code
        link.click();
      } else {
        console.error("Invalid QR Code URL");
      }
    }
  };

  const downloadWorkLog = async () => {
    const { firstTable, divider, secondTable } = await workLogdocx(data);
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Arial",
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 500, // 0.5 cm in twips
                bottom: 500, // 0.5 cm in twips
                left: 800, // 1.27 cm in twips
                right: 800, // 1.27 cm in twips
              },
            },
          },
          children: [firstTable, divider, secondTable],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(
      blob,
      `Contract_${data?.contractNo ? data.contractNo : data._id}.docx`
    );
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <Button onClick={downloadQRCode} color="yellow">
        <div className="flex justify-center items-center gap-2">
          <span>QR Code</span>
          <MdFileDownload size={20} />
        </div>
      </Button>
      <Button onClick={downloadWorkLog} color="red">
        <div className="flex justify-center items-center gap-2">
          <span>WorkLog</span>
          <MdFileDownload size={20} />
        </div>
      </Button>
    </div>
  );
};

export default QRCodeComponent;
