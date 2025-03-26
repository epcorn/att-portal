import QRCode from "qrcode";

function saprateQuoteInfo(a1) {
  const array = [...a1];
  const stan = array.filter((a1) => a1.applyRate === null);
  const ApSp = array.filter((a1) => a1.applyRate !== null);
  return [stan, ApSp];
}

function getDotColor(docType) {
  switch (docType) {
    case "standard":
      return "bg-green-500";
    case "supply":
      return "bg-yellow-400";
    case "supply/apply":
      return "bg-blue-500";
    default:
      return "bg-red-500"; // Default background color if docType doesn't match the cases
  }
}

// Function to fetch image data as ArrayBuffer
const fetchImage = async (imagePath) => {
  const response = await fetch(imagePath);
  const blob = await response.blob();
  return await blob.arrayBuffer();
};

function duplicateBillToShipTo({ quote, setQuote }) {
  const { billToAddress } = quote;
  const { shipToAddress } = quote;

  // Create an object to hold the duplicated fields
  const updatedShipToAddress = {};

  // Loop through billToAddress keys and copy only those present in shipToAddress
  Object.keys(billToAddress).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(shipToAddress, key)) {
      updatedShipToAddress[key] = billToAddress[key];
    }
  });

  // Update the shipToAddress in the state
  setQuote({
    ...quote,
    shipToAddress: { ...shipToAddress, ...updatedShipToAddress },
  });
}

function getChemicalRatio(chemical) {
  if (chemical === "Chloropyriphos 20% EC") {
    return "1:475";
  } else {
    return "1:19";
  }
}

// Function to convert a base64 image to a Uint8Array
const base64ToUint8Array = (base64) => {
  const binaryString = atob(base64.split(",")[1]);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};
async function qrCodeUint8Arrayfn(id) {
  try {
    // Generate QR Code as Base64
    const qrCodeUrl = await QRCode.toDataURL(
      `https://att-quotation.onrender.com/workLog/${id}`,
      { type: "image/png" } // Explicitly specify PNG format
    );
    return base64ToUint8Array(qrCodeUrl);
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error; // Re-throw the error to be caught by the calling function
  }
}
async function base64Url(id) {
  try {
    // Generate QR Code as Base64
    const qrCodeUrl = await QRCode.toDataURL(
      `https://att-quotation.onrender.com/workLog/${id}`,
      { type: "image/png", width: 95, margin: 1 } // Explicitly specify PNG format
    );
    return qrCodeUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error; // Re-throw the error to be caught by the calling function
  }
}

const getValueFromNestedObject = (obj, name) => {
  const keys = Array.isArray(name) ? name : name.split(".");
  let result = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!result) return undefined;

    if (
      key.includes("kci") &&
      (keys[i - 1] === "billToAddress" || keys[i - 1] === "shipToAddress")
    ) {
      const kciId = keys[i + 1];
      const kciField = keys[i + 2];

      // Find the KCI object with the matching ID
      const kciObject = result.kci.find((item) => item._id === kciId);

      // If found, set result to the specified field, otherwise set to undefined
      result = kciObject ? kciObject[kciField] : undefined;

      // Skip the next two keys as we've already processed them
      i += 2;
    } else if (key.includes("quoteInfo")) {
      const infoId = keys[i + 1];
      const infoField = keys[i + 2];
      const infoObj = result.quoteInfo.find((item) => item._id === infoId);
      result = infoObj ? infoObj[infoField] : undefined;
      i += 2;
    } else {
      result = result[key];
    }
  }
  return result;
};
function substringsExistInArray(targetSubstrings, stringArray) {
  return targetSubstrings.some((substring) =>
    stringArray.some((str) => str.includes(substring))
  );
}

function isRevised(string) {
  const parts = String(string).split("/");

  const lastPart = parts[parts.length - 1];

  const regex = /R([1-9][0-9]*)/;

  return regex.test(lastPart);
}
function getFormattedDateTime() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Format: DD-MM-YYYY HH-MM-SS
  return `${day}-${month}-${year} ${hours}-${minutes}-${seconds}`;
}
export {
  saprateQuoteInfo,
  getDotColor,
  fetchImage,
  duplicateBillToShipTo,
  getChemicalRatio,
  qrCodeUint8Arrayfn,
  base64Url,
  getValueFromNestedObject,
  substringsExistInArray,
  isRevised,
  getFormattedDateTime,
};
