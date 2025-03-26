import ExcelJS from "exceljs";
import brevo from "@getbrevo/brevo";

// Define headers configuration
const WORKSHEET_HEADERS = {
  Quotes: [
    { header: "REP", key: "salesPerson", width: 15 },
    { header: "Date", key: "quotationDate", width: 15 },
    { header: "Quote No", key: "quotationNo", width: 15 },
    { header: "Name of Client", key: "clientName", width: 30 },
    { header: "Area", key: "area", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Contact Nos", key: "contactNos", width: 15 },
    { header: "Remark", key: "remark", width: 30 },
  ],
  Contracts: [
    { header: "REP", key: "salesPerson", width: 15 },
    { header: "Date", key: "quotationDate", width: 15 },
    { header: "Contract No", key: "quotationNo", width: 15 },
    { header: "Name of Client", key: "clientName", width: 30 },
    { header: "Area", key: "area", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Contact Nos", key: "contactNos", width: 15 },
    { header: "Remark", key: "remark", width: 30 },
  ],
  MonthlyQuotes: [
    { header: "REP", key: "salesPerson", width: 15 },
    { header: "Date", key: "quotationDate", width: 15 },
    { header: "Quote No", key: "quotationNo", width: 15 },
    { header: "Name of Client", key: "clientName", width: 30 },
    { header: "Area", key: "area", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Contact Nos", key: "contactNos", width: 15 },
    { header: "Remark", key: "remark", width: 30 },
  ],
};

// Function to create and configure worksheets
function configureWorksheets(workbook, headersConfig) {
  console.log(headersConfig);
  if (!headersConfig || Object.keys(headersConfig).length === 0) {
    console.error("No headers configuration provided");
    return {};
  }

  const worksheets = {};
  for (const [name, columns] of Object.entries(headersConfig)) {
    console.log(`Creating worksheet: ${name}`);
    console.log(`Columns: `, columns);
    const worksheet = workbook.addWorksheet(name);
    worksheet.columns = columns;
    worksheets[name] = worksheet;
  }
  return worksheets;
}

// Modularized data processing function
function processRowData(quotation) {
  const clientName = quotation.billToAddress.name;
  const area =
    quotation.quoteInfo.map((quote) => quote.workArea).join("& ") || "";
  const amount =
    quotation.quoteInfo
      .map(
        (quote) =>
          `${quote.serviceRate} ${quote.serviceRateUnit}- ${quote.chemical}`
      )
      .join("& ") || "";
  const contactNosBillTo =
    quotation.billToAddress.kci
      .map((kci) => `${kci.contact} (${kci.name})`)
      .join(", ") || "";
  const contactNosShipTo =
    quotation.shipToAddress.kci
      .map((kci) => `${kci.contact} (${kci.name})`)
      .join(", ") || "";
  const contactNos =
    [contactNosBillTo, contactNosShipTo].filter(Boolean).join("& ") || "";

  return {
    salesPerson: quotation.salesPerson.initials,
    quotationDate: quotation.quotationDate,
    quotationNo: quotation.quotationNo || quotation._id,
    clientName,
    area,
    amount,
    contactNos,
    remark: quotation.note || "",
  };
}

// Main function
function createExcelBuilder1(headers) {
  const workbook = new ExcelJS.Workbook();
  console.log(headers);
  const worksheets = configureWorksheets(workbook, headers);

  async function addData(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    }

    dataArray.forEach((data) => {
      worksheets[String(data.salesPerson.initials)].addRow(
        processRowData(data)
      );
    });

    return addData;
  }

  return addData;
}

function createHeader(array) {
  const header = {};
  for (const data of array) {
    const initials = String(data.salesPerson.initials);
    if (!header[initials]) {
      header[initials] = [
        { header: "REP", key: "salesPerson", width: 15 },
        { header: "Date", key: "quotationDate", width: 15 },
        { header: "Quote No", key: "quotationNo", width: 15 },
        { header: "Name of Client", key: "clientName", width: 30 },
        { header: "Area", key: "area", width: 15 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Contact Nos", key: "contactNos", width: 15 },
        { header: "Remark", key: "remark", width: 30 },
      ];
    }
  }
  return header;
}

async function sendExel(base64File) {
  // Set up Brevo client
  let defaultClient = brevo.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_KEY;
  let apiInstance = new brevo.TransactionalEmailsApi();

  let sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = {
    name: "EPCORN",
    email: process.env.EA_EMAIL,
  };

  sendSmtpEmail.to = [
    { email: process.env.NO_REPLY_EMAIL },
    //{ email: process.env.OFFICE_EMAIL },
  ];

  sendSmtpEmail.templateId = 9;

  // Attach the file directly using base64
  sendSmtpEmail.attachment = [
    {
      content: base64File,
      name: "Report.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  ];

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

export { createHeader, createExcelBuilder1, sendExel };
