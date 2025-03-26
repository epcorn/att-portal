import { Contract, Counter, Quotation, QuoteArchive } from "../models/index.js";
import ExcelJS from "exceljs";
import brevo from "@getbrevo/brevo";
import { createExcelBuilder as excelBuilder } from "../utils/functions.js";

function differenceBetweenArrays(A, B) {
  return A.filter((element) => !B.includes(element));
}

const removeIdFromDocuments = (documents) => {
  return documents.map(({ id, ...rest }) => rest);
};
const remove_IdFromObj = (obj) => {
  const { _id, ...rest } = obj;
  return rest;
};

async function createQuoteArchiveEntry(
  quoteId,
  state,
  author,
  message,
  changes
) {
  const theArchive = await QuoteArchive.findOne({ quotationId: quoteId });
  if (theArchive) {
    theArchive.revisions.push({ state, author, message, changes });
    await theArchive.save();
  } else {
    const newArchive = new QuoteArchive({
      quotationId: quoteId,
      revisions: [{ state, author, message, changes }],
    });
    await newArchive.save();
  }
}

async function createContractArchiveEntry(
  contractId,
  state,
  author,
  message,
  changes
) {
  const theArchive = await QuoteArchive.findOne({ contractId });
  if (theArchive) {
    theArchive.revisions.push({ state, author, message, changes });
    await theArchive.save();
  } else {
    const newArchive = new QuoteArchive({
      contractId,
      revisions: [{ state, author, message, changes }],
    });
    await newArchive.save();
  }
}

function isRevised(string) {
  const parts = String(string).split("/");

  const lastPart = parts[parts.length - 1];

  const regex = /R([1-9][0-9]*)/;

  return regex.test(lastPart);
}

function createExcelBuilder() {
  // Initialize workbook in closure scope
  const workbook = new ExcelJS.Workbook();
  const worksheetQuote = workbook.addWorksheet("Quotes");
  const worksheetContract = workbook.addWorksheet("Contracts");
  const worksheetMonthelyQuote = workbook.addWorksheet("Monthely Quote");

  // Set up headers
  worksheetQuote.columns = [
    { header: "REP", key: "salesPerson", width: 15 },
    { header: "Date", key: "quotationDate", width: 15 },
    { header: "Quote No", key: "quotationNo", width: 15 },
    { header: "Name of Client", key: "clientName", width: 30 },
    { header: "Area", key: "area", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Contact Nos", key: "contactNos", width: 15 },
    { header: "Remark", key: "remark", width: 30 },
  ];

  worksheetContract.columns = [
    { header: "REP", key: "salesPerson", width: 15 },
    { header: "Date", key: "quotationDate", width: 15 },
    { header: "Contract No", key: "quotationNo", width: 15 },
    { header: "Name of Client", key: "clientName", width: 30 },
    { header: "Area", key: "area", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Contact Nos", key: "contactNos", width: 15 },
    { header: "Remark", key: "remark", width: 30 },
  ];

  worksheetMonthelyQuote.columns = [
    { header: "REP", key: "salesPerson", width: 15 },
    { header: "Date", key: "quotationDate", width: 15 },
    { header: "Quote No", key: "quotationNo", width: 15 },
    { header: "Name of Client", key: "clientName", width: 30 },
    { header: "Area", key: "area", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Contact Nos", key: "contactNos", width: 15 },
    { header: "Remark", key: "remark", width: 30 },
  ];

  // Inner function that processes data and maintains chainability
  async function addData(data) {
    if (data && data.length === 0) {
      return addData;
    }
    if (!data) {
      // If called without data, return the workbook buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    }
    // Process the data
    data.forEach((quotation) => {
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

      // Choose worksheet based on quotation type
      const worksheet =
        quotation.type === "contract"
          ? worksheetContract
          : quotation.type === "monthlyQuote"
          ? worksheetMonthelyQuote
          : worksheetQuote;

      worksheet.addRow({
        salesPerson: quotation.salesPerson.initials,
        quotationDate: quotation.quotationDate,
        quotationNo: quotation.quotationNo || quotation._id,
        clientName: clientName,
        area: area,
        amount: amount,
        contactNos: contactNos,
        remark: quotation.note || "",
      });
    });

    // Return the function itself for chaining
    return addData;
  }

  return addData;
}

async function generateAndSendReport(data) {
  const { weeklyDataContract, weeklyDataQuote, monthelyDataQuote, subdata } =
    data;
  try {
    let weeklyDataContractNew = weeklyDataContract.map((data) => ({
      ...data,
      type: "contract",
    }));
    let monthelyDataQuoteNew = monthelyDataQuote.map((data) => ({
      ...data,
      type: "monthlyQuote",
    }));
    const builder = excelBuilder();
    const r1 = await builder(weeklyDataQuote); // Add weekly quote data
    const r2 = await r1(weeklyDataContractNew); // Add weekly contract data
    const rf = await r2(monthelyDataQuoteNew); //Add monthely data
    const excelBuffer = await rf(); // Complete and get the buffer

    //const excelBuffer = await generateExcel(data);
    const base64File = excelBuffer.toString("base64");

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
    sendSmtpEmail.params = subdata;

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
    return base64File;
  } catch (error) {
    console.error("Error in generate and send report:", error);
    throw new Error("Failed to generate and send report");
  }
}
async function manageDcCounter() {
  let dcCounter = await Counter.findById("dcCounter");
  if (!dcCounter) {
    dcCounter = await new Counter({ _id: "dcCounter", seq: 0 }).save();
  }
  // Increment the counter and get the new sequence number
  dcCounter = await Counter.findByIdAndUpdate(
    "dcCounter",
    { $inc: { seq: 1 } },
    { new: true }
  );
  return dcCounter.seq;
}
async function manageWarrantyCounter() {
  let warrantyCounter = await Counter.findById("warrantyCounter");
  if (!warrantyCounter) {
    warrantyCounter = await new Counter({
      _id: "warrantyCounter",
      seq: 0,
    }).save();
  }
  // Increment the counter and get the new sequence number
  warrantyCounter = await Counter.findByIdAndUpdate(
    "warrantyCounter",
    { $inc: { seq: 1 } },
    { new: true }
  );
  return warrantyCounter.seq;
}
async function getStatsForEmail(lastMonday, endOfWeek) {
  const totalQuotations = await Quotation.countDocuments({
    quotationDate: { $gte: lastMonday, $lt: endOfWeek },
  });

  const approveCount = await Quotation.countDocuments({
    quotationDate: { $gte: lastMonday, $lt: endOfWeek },
    approved: true,
  });
  const approvePending = await Quotation.countDocuments({
    quotationDate: { $gte: lastMonday, $lt: endOfWeek },
    approved: false,
  });
  const contractified = await Quotation.countDocuments({
    quotationDate: { $gte: lastMonday, $lt: endOfWeek },
    contractified: true,
  });
  //contract
  const totalContracts = await Contract.countDocuments({
    contractDate: { $gte: lastMonday, $lt: endOfWeek },
  });
  const approvedCountContract = await Contract.countDocuments({
    contractDate: { $gte: lastMonday, $lt: endOfWeek },
    approved: true,
  });
  const approvePendingContract = await Contract.countDocuments({
    contractDate: { $gte: lastMonday, $lt: endOfWeek },
    approved: false,
  });
  const subdata = {
    totalQuotations,
    contractified,
    approveCount,
    approvePending,
    totalContracts,
    approvedCountContract,
    approvePendingContract,
    fromDate: lastMonday.toLocaleDateString(),
    toDate: endOfWeek.toLocaleDateString(),
  };
  return subdata;
}

// Utility to Create Excel Workbook
function createExcelBuilder2(sheetConfigs) {
  const workbook = new ExcelJS.Workbook();
  const worksheets = {};

  // Dynamically create worksheets with given headers
  sheetConfigs.forEach(({ sheetName, headers }) => {
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = headers;
    worksheets[sheetName] = worksheet;
  });

  // Function to add data to a specific worksheet
  async function addData(sheetName, data) {
    console.log(`here: ${sheetName}`);
    console.log(`worksheets: ${worksheets}`);
    const worksheet = worksheets[sheetName];
    if (!worksheet) throw new Error(`Worksheet ${sheetName} not found`);

    if (data && data.length === 0) return addData;

    if (!data) {
      // Return the Excel file as a buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    }

    data.forEach((row) => worksheet.addRow(row));

    return addData;
  }

  return addData;
}
// Utility to Send Email via Brevo
async function sendEmail({
  sender,
  recipients,
  subject,
  templateId,
  attachment,
  params,
}) {
  const defaultClient = brevo.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_KEY;

  const apiInstance = new brevo.TransactionalEmailsApi();
  const emailData = new brevo.SendSmtpEmail({
    sender,
    to: recipients,
    subject,
    templateId,
    params,
    attachment: [
      {
        content: attachment,
        name: "Report.xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });

  await apiInstance.sendTransacEmail(emailData);
}
// Main Function to Generate and Email Report
async function generateAndSendReport2({ data, emailConfig, sheetConfigs }) {
  try {
    const builder = createExcelBuilder2(sheetConfigs);

    // Add data to worksheets
    for (const { sheetName, data: sheetData } of data) {
      await builder(sheetName, sheetData);
    }

    // Generate Excel buffer
    const excelBuffer = await builder();

    // Convert buffer to base64
    const base64File = excelBuffer.toString("base64");

    // Send email with attachment
    await sendEmail({ ...emailConfig, attachment: base64File });

    console.log("Report sent successfully!");
    return base64File;
  } catch (error) {
    console.error("Error in generateAndSendReport:", error);
    throw new Error("Failed to generate and send report");
  }
}

/**
 *
 * @param {string} id
 * @param {number} limit
 * @returns {Array}
 */
async function findSimilarQuotations(referenceId, limit = 3) {
  try {
    const referenceQuotation = await Quotation.findById(referenceId).populate(
      "quoteInfo"
    );

    if (!referenceQuotation) {
      console.log("Reference quotation not found");
      return [];
    }

    const referenceName = referenceQuotation.billToAddress?.name || "";
    const referenceWorkAreas = referenceQuotation.quoteInfo
      .map((q) => q.workArea)
      .filter(Boolean);

    // Fetch all quotations
    const allQuotations = await Quotation.find().populate("quoteInfo");

    // Step 1: Filter by name similarity (≥ 80%)
    const filteredQuotations = allQuotations.filter((q) => {
      const currentName = q.billToAddress?.name || "";
      return similarityPercentage(referenceName, currentName) >= 80;
    });

    // Step 2: Filter by workArea closeness (within 10%)
    const finalQuotations = filteredQuotations.filter((q) => {
      const targetWorkAreas = q.quoteInfo
        .map((q) => q.workArea)
        .filter(Boolean);
      return isWorkAreaClose(referenceWorkAreas, targetWorkAreas);
    });
    return finalQuotations.slice(0, limit);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return [];
  }
}

function levenshteinDistance(a, b) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function similarityPercentage(str1, str2) {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return ((1 - distance / maxLength) * 100).toFixed(2); // Percentage similarity
}

function isWorkAreaClose(referenceWorkAreas, targetWorkAreas, tolerance = 0.1) {
  return referenceWorkAreas.some((refArea) =>
    targetWorkAreas.some((targetArea) => {
      const diff = Math.abs(refArea - targetArea);
      const threshold = refArea * tolerance; // 10% of refArea
      return diff <= threshold;
    })
  );
}

export {
  generateAndSendReport,
  generateAndSendReport2,
  manageDcCounter,
  manageWarrantyCounter,
  differenceBetweenArrays,
  removeIdFromDocuments,
  remove_IdFromObj,
  createQuoteArchiveEntry,
  isRevised,
  createContractArchiveEntry,
  createExcelBuilder,
  getStatsForEmail,
  findSimilarQuotations,
};
