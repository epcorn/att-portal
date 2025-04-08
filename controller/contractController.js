import { isValidObjectId } from "mongoose";
import {
  ChemicalBatchNos,
  Contract,
  Counter,
  DC,
  Quotation,
  QuoteInfo,
  WorkLogs,
} from "../models/index.js";
import {
  differenceBetweenArrays,
  remove_IdFromObj,
  createContractArchiveEntry,
  generateAndSendReport,
  manageWarrantyCounter,
  manageDcCounter,
  getStatsForEmail,
  removeIdFromDocuments,
} from "../utils/functions.js";
import Warranty from "../models/warrantyModel.js";

import dayjs from "dayjs";

const create = async (req, res, next) => {
  try {
    const { contract } = req.body;
    const {
      contractNo,
      os,
      contractDate,
      salesPerson,
      billToAddress,
      shipToAddress,
      emailTo,
      note,
      docType,
      quoteInfo,
      workOrderNo,
      workOrderDate,
      gstNo,
      paymentTerms,
      groupBy,
    } = contract;
    billToAddress.kci = removeIdFromDocuments(billToAddress.kci);
    shipToAddress.kci = removeIdFromDocuments(shipToAddress.kci);
    let quoteInfoIds = [];
    for (let i = 0; i < quoteInfo.length; i++) {
      const quoteData = remove_IdFromObj(quoteInfo[i]);
      const newInfo = await QuoteInfo.create(quoteData);
      quoteInfoIds.push(newInfo._id);
    }
    const newContract = await Contract.create({
      contractNo,
      os,
      contractDate: contractDate || Date.now(),
      salesPerson,
      billToAddress,
      shipToAddress,
      emailTo,
      note,
      docType,
      workOrderDate,
      workOrderNo,
      gstNo,
      paymentTerms,
      groupBy,
      quoteInfo: quoteInfoIds,
      createdBy: req.user.id,
    });
    const populatedContract = await newContract.populate(
      "createdBy",
      "username"
    );

    res
      .status(200)
      .json({ message: "Contract Created!", result: populatedContract });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const contracts = async (req, res, next) => {
  try {
    // Parse and set start and end of the day for fromDate and toDate
    const startOfDay = req.query.fromDate
      ? new Date(req.query.fromDate)
      : new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = req.query.toDate ? new Date(req.query.toDate) : new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    // Build the query object
    const query = {
      ...(req.query.createdBy && {
        createdBy: req.query.createdBy,
      }),
      ...(req.query.projectName && {
        "shipToAddress.projectName": {
          $regex: new RegExp(req.query.projectName, "i"),
        },
      }),
      ...(req.query.clientName && {
        "billToAddress.name": {
          $regex: new RegExp(req.query.clientName, "i"),
        },
      }),
      ...(req.query.contractNo && {
        contractNo: { $regex: new RegExp(req.query.contractNo, "i") },
      }),
      ...(req.query.approved && {
        approved: true,
      }),
    };

    // Add date filters to the query
    if (req.query.fromDate && req.query.toDate) {
      query.contractDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (req.query.fromDate) {
      query.contractDate = {
        $gte: startOfDay,
      };
    } else if (req.query.toDate) {
      query.contractDate = {
        $lte: endOfDay,
      };
    }

    // Fetch the quotes based on the constructed query
    const contracts = await Contract.find(query)
      .lean()
      .populate("createdBy", "username")
      .populate("quotation", "quotationNo")
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    // Get today's date for counting today's quotes
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalContracts = await Contract.countDocuments();
    const todayContracts = await Contract.countDocuments({
      createdAt: { $gte: today },
    });
    const contractWithoutQuote = await Contract.countDocuments({
      quotation: null,
    });
    const approvedCount = await Contract.countDocuments({ approved: true });
    const approvePending = await Contract.countDocuments({
      approved: false,
    });
    const withoutNumberContract = await Contract.countDocuments({
      $or: [
        { contractNo: { $exists: false } },
        { contractNo: "" },
        { contractNo: null },
      ],
    });

    res.status(200).json({
      message: "Contracts Retrieved",
      result: contracts,
      totalContracts,
      todayContracts,
      approvedCount,
      approvePending,
      contractWithoutQuote,
      withoutNumberContract,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const contractify = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quote = await Quotation.findById(id)
      .populate("quoteInfo")
      .populate({ path: "createdBy", select: "-password" })
      .populate({ path: "salesPerson", select: "-password" })
      .populate("createdBy", "username");

    if (quote.contractified) {
      return res
        .status(404)
        .json({ message: "Already Contract, please refresh" });
    }
    if (!quote) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    if (!quote.approved) {
      return res.status(403).json({ message: "Document not approved yet!" });
    }

    const {
      contractNo,
      salesPerson,
      billToAddress,
      shipToAddress,
      emailTo,
      note,
      docType,
      quoteInfo,
      workOrderNo,
      workOrderDate,
      gstNo,
      groupBy,
    } = quote;

    // Copying quoteInfo and creating new QuoteInfo documents
    let quoteInfoIds = [];
    for (let i = 0; i < quoteInfo.length; i++) {
      const { _id, __v, ...rest } = quoteInfo[i].toObject();
      const newQuoteInfo = await QuoteInfo.create(rest);
      quoteInfoIds.push(newQuoteInfo._id);
    }

    // Creating the new contract
    const newContract = await Contract.create({
      quotation: quote._id,
      contractNo,
      salesPerson,
      billToAddress,
      shipToAddress,
      emailTo,
      note,
      docType,
      workOrderDate,
      workOrderNo,
      gstNo,
      quoteInfo: quoteInfoIds,
      createdBy: req.user.id,
      groupBy,
    });
    quote.contractified = true;
    await quote.save();
    res.status(200).json({ message: "Contract Created!", result: quote });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const singleContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id)
      .populate("quoteInfo")
      .populate({ path: "salesPerson", select: "-password" })
      .populate({ path: "createdBy", select: "-password" });
    if (!contract) {
      res.status(400).json({ message: "No such Contract" });
      return;
    }
    res.status(200).json({
      message: "",
      result: contract,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const update = async (req, res, next) => {
  try {
    const contractId = req.params.id;
    const { message, contract: updatedData, modified } = req.body;
    const { quoteInfo, ...otherFields } = updatedData;
    const { _id, ...rest } = otherFields;
    const isapproved = await Contract.isApproved(contractId);
    if (isapproved) {
      const { _id, ...state } = await Contract.findById(contractId)
        .populate("quoteInfo")
        .populate({ path: "salesPerson", select: "-password" })
        .populate({ path: "createdBy", select: "-password" })
        .lean();
      const author = req.user.id;
      await createContractArchiveEntry(
        contractId,
        state,
        author,
        message,
        modified
      );
    }

    // Fetch the existing quotation document
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Update the fields directly on the document
    Object.assign(contract, rest);

    // Save the updated quotation
    await contract.save();

    // Update or create quoteInfo documents
    const updatedQuoteInfoIds = [];
    for (const info of quoteInfo) {
      let quoteInfoDoc;
      if (info._id && isValidObjectId(info._id) && info._id.length !== 21) {
        quoteInfoDoc = await QuoteInfo.findByIdAndUpdate(info._id, info, {
          new: true,
          runValidators: true,
        });
      } else if (info?._id.length == 21) {
        const noIdInfo = remove_IdFromObj(info);
        quoteInfoDoc = new QuoteInfo(noIdInfo);
        await quoteInfoDoc.save();
      } else {
        //throw exception
      }
      updatedQuoteInfoIds.push(quoteInfoDoc._id);
    }

    if (!isapproved) {
      const { quoteInfo: oldIdArray } = await Contract.findById(
        contractId
      ).select("quoteInfo");

      // Convert IDs to strings for comparison
      const oldIdArrayStrings = oldIdArray.map((id) => id.toString());
      const updatedQuoteInfoIdsStrings = updatedQuoteInfoIds.map((id) =>
        id.toString()
      );

      const differenceIds = differenceBetweenArrays(
        oldIdArrayStrings,
        updatedQuoteInfoIdsStrings
      );

      if (differenceIds.length > 0) {
        await QuoteInfo.deleteMany({ _id: { $in: differenceIds } });
      }
    }

    // Update the quotation with the new quoteInfo ids
    contract.quoteInfo = updatedQuoteInfoIds;
    await contract.save();
    await contract.reviseContractNo();

    // Fetch the updated quotation with populated quoteInfo & send resposnse
    const finalContract = await Contract.findById(contractId)
      .populate("quoteInfo")
      .populate("createdBy");
    res
      .status(200)
      .json({ message: "Contract Updated", result: finalContract });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const docData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await Contract.findById(id)
      .populate("quoteInfo")
      .populate("salesPerson")
      .populate("createdBy")
      .lean();
    res.status(200).json({
      message: "Nothing to say for now.",
      result: data,
    });
  } catch (error) {
    next(error);
  }
};
//######Uncomment generateContractNo for automatic No###########
const approve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await Contract.findByIdAndUpdate(id)
      .populate("quoteInfo")
      .populate({ path: "createdBy", select: "-password" })
      .populate({ path: "salesPerson", select: "-password" })
      .lean();
    if (data.approved) {
      res.status(404).json({ message: "Contract Already approved" });
      return;
    }
    const author = req.user.id;
    await createContractArchiveEntry(id, data, author, "Approved");
    const finalData = await Contract.findByIdAndUpdate(id)
      .populate("quoteInfo")
      .populate({ path: "createdBy", select: "-password" })
      .populate({ path: "salesPerson", select: "-password" });
    await finalData.approve();
    await finalData.generateContractNo();
    res.status(200).json({
      message: "Contract Approved.",
      result: finalData,
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};
const createWarrenty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contract = Contract.findById(id);
    if (!contract) {
      return res.status(404).json({ message: "No such contract" });
    }
    const warrantyCount = await manageWarrantyCounter();
    const warranty = await Warranty.create({
      ...req.body,
      warrantyNo: `${contract.contentNo}/SW/${warrantyCount}`,
    });
    contract.warranty = warranty;
    res.status(200).json({ message: "Warrenty Created!" });
  } catch (error) {
    next(error);
  }
};
const printCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await Contract.findByIdAndUpdate(id)
      .populate("quoteInfo")
      .populate("createdBy");
    await data.incPrintCount();
    res.status(200).json({
      message: "Printed.",
      result: data,
    });
  } catch (error) {
    next(error);
  }
};
const createWorklog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ message: "No such Contract" });
    }

    const {
      workAreaType,
      chemical,
      chemicalUsed,
      remark,
      areaTreated,
      areaTreatedUnit,
    } = req.body;

    let log = await WorkLogs.create({
      workAreaType,
      chemical,
      chemicalUsed,
      remark,
      areaTreated,
      areaTreatedUnit,
      entryBy: req.user.id,
    });

    // Update the contract with the new worklog
    contract.worklogs.push(log._id);
    await contract.save();
    log = await WorkLogs.findById(log._id).populate("entryBy");
    // Respond with the created worklog
    res.status(201).json({ message: "Worklog Created", log });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};
const getWorklogs = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the contract by ID and populate the related fields
    const data = await Contract.findById(id).populate({
      path: "worklogs",
      populate: { path: "entryBy", model: "User" },
    });

    // Check if the contract was found
    if (!data) {
      // Return a 404 Not Found status if the contract does not exist
      return res.status(404).json({
        message: "Contract not found",
        result: null,
      });
    }

    // Return the found data with a 200 OK status
    res.status(200).json({
      message: "",
      result: data,
    });
  } catch (error) {
    // Pass any errors to the error-handling middleware
    next(error);
  }
};
const createDC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ message: "No such Contract" });
    }
    const dcCount = await manageDcCounter();
    let dc = await DC.create({
      dcCount,
      dcObj: req.body.dcObj,
      entryBy: req.user.id,
    });

    // Update the contract with the new worklog
    contract.dcs.push(dc._id);
    await contract.save();

    dc = await DC.findById(dc._id).populate("entryBy");
    // Respond with the created worklog
    res.status(201).json({ message: "Worklog Created", dc });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};
const getDCs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await Contract.findById(id).populate({
      path: "dcs",
      populate: { path: "entryBy", model: "User" },
    });
    res.status(200).json({
      message: "",
      result: data,
    });
  } catch (error) {
    next(error);
  }
};
const getChemical = async (req, res, next) => {
  try {
    const allChemicals = await ChemicalBatchNos.find();
    res.status(200).json({ data: allChemicals });
  } catch (error) {
    next(error);
  }
};
const addChemical = async (req, res, next) => {
  const { chemical } = req.body;
  try {
    const newChemical = new ChemicalBatchNos({
      chemical,
    });
    await newChemical.save();
    res
      .status(201)
      .json({ message: "Chemical added successfully", data: newChemical });
  } catch (error) {
    next(error);
  }
};
const addBatchNumber = async (req, res, next) => {
  const { chemicalId } = req.params;
  const { batchNo } = req.body;

  try {
    const updatedChemical = await ChemicalBatchNos.findByIdAndUpdate(
      { _id: chemicalId },
      { $addToSet: { batchNos: batchNo } },
      { new: true }
    );

    if (!updatedChemical) {
      return res.status(404).json({ error: "Chemical not found" });
    }

    res
      .status(200)
      .json({ message: "Batch number added", data: updatedChemical });
  } catch (error) {
    next(error);
  }
};
const deleteBatchNumber = async (req, res, next) => {
  const { chemicalId } = req.params;
  const { batchNo } = req.body;

  try {
    const updatedChemical = await ChemicalBatchNos.findByIdAndUpdate(
      { _id: chemicalId },
      { $pull: { batchNos: batchNo } }, // Removes the specified batch number
      { new: true }
    );

    if (!updatedChemical) {
      return res.status(404).json({ error: "Chemical not found" });
    }

    res
      .status(200)
      .json({ message: "Batch number deleted", data: updatedChemical });
  } catch (error) {
    next(error);
  }
};
const deleteChemical = async (req, res, next) => {
  const { chemicalId } = req.params;
  try {
    const deletedChemical = await ChemicalBatchNos.findByIdAndDelete({
      _id: chemicalId,
    });

    if (!deletedChemical) {
      return res.status(404).json({ message: "Chemical not found" });
    }

    res
      .status(200)
      .json({ message: "Chemical deleted", data: deletedChemical });
  } catch (error) {
    next(error);
  }
};
const deletedContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findOneAndDelete({ _id: contractId });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json({ message: "Contract Deleted!" });
  } catch (error) {
    next(error);
  }
};
const getArchive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await Contract.findById(id)
      .populate("quoteInfo")
      .populate("salesPerson")
      .populate("createdBy")
      .populate({
        path: "archive",
        populate: { path: "revisions.author", model: "User" },
      })
      .lean();
    res.status(200).json({
      message: "Nothing to say for now.",
      result: data,
    });
  } catch (error) {
    next(error);
  }
};
const genReport = async (req, res, next) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getUTCDay();
    const lastMonday = new Date(today);
    lastMonday.setUTCDate(
      today.getUTCDate() - (dayOfWeek === 1 ? 7 : (dayOfWeek + 6) % 7)
    );
    lastMonday.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date(lastMonday);
    endOfWeek.setUTCDate(lastMonday.getUTCDate() + 7);
    const startDate = new Date(Date.UTC(2025, 0, 18)); // 18 Jan 2025 (UTC)
    const endDate = new Date(Date.UTC(2025, 0, 25));
    const weeklyDataQuote = await Quotation.find({
      quotationDate: { $gte: startDate, $lt: endDate },
    })
      .populate("quoteInfo")
      .populate("salesPerson")
      .populate("createdBy")
      .sort({ "salesPerson._id": 1 })
      .lean();
    // Get the start and end of the current month
    const startOfMonth = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      1
    );
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const endOfMonth = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth() + 1,
      0
    );
    endOfMonth.setUTCHours(23, 59, 59, 999);
    const monthelyDataQuote = await Quotation.find({
      quotationDate: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    })
      .populate("quoteInfo")
      .populate("salesPerson")
      .populate("createdBy")
      .lean();
    const weeklyDataContract = await Contract.find({
      contractDate: { $gte: lastMonday, $lt: endOfWeek },
    })
      .populate("quoteInfo")
      .populate("salesPerson")
      .populate("createdBy")
      .lean();

    const subdata = await getStatsForEmail(lastMonday, endOfWeek);
    const sheetConfigs = [
      {
        sheetName: "Quotes",
        headers: [
          { header: "REP", key: "salesPerson", width: 15 },
          { header: "Date", key: "quotationDate", width: 15 },
          { header: "Quote No", key: "quotationNo", width: 15 },
          { header: "Name of Client", key: "clientName", width: 30 },
          { header: "Area", key: "area", width: 15 },
          { header: "Amount", key: "amount", width: 15 },
          { header: "Contact Nos", key: "contactNos", width: 15 },
          { header: "Remark", key: "remark", width: 30 },
        ],
      },
      {
        sheetName: "Contracts",
        headers: [
          { header: "REP", key: "salesPerson", width: 15 },
          { header: "Date", key: "quotationDate", width: 15 },
          { header: "Contract No", key: "quotationNo", width: 15 },
          { header: "Name of Client", key: "clientName", width: 30 },
          { header: "Area", key: "area", width: 15 },
          { header: "Amount", key: "amount", width: 15 },
          { header: "Contact Nos", key: "contactNos", width: 15 },
          { header: "Remark", key: "remark", width: 30 },
        ],
      },
      {
        sheetName: "Monthly Quote",
        headers: [
          { header: "REP", key: "salesPerson", width: 15 },
          { header: "Date", key: "quotationDate", width: 15 },
          { header: "Quote No", key: "quotationNo", width: 15 },
          { header: "Name of Client", key: "clientName", width: 30 },
          { header: "Area", key: "area", width: 15 },
          { header: "Amount", key: "amount", width: 15 },
          { header: "Contact Nos", key: "contactNos", width: 15 },
          { header: "Remark", key: "remark", width: 30 },
        ],
      },
    ];
    const emailConfig = {
      sender: { name: "EPCORN", email: process.env.EA_EMAIL },
      recipients: [{ email: process.env.NO_REPLY_EMAIL }],
      subject: "Monthly Report",
      templateId: 9,
      params: subdata,
    };
    const data = [
      {
        sheetName: "Quotes",
        data: [...weeklyDataQuote],
      },
      { sheetName: "Contracts", data: [...weeklyDataContract] },
      {
        sheetName: "Monthly Quote",
        data: [...monthelyDataQuote],
      },
    ];
    //await generateAndSendReport2({ data, emailConfig, sheetConfigs });
    const base64File = await generateAndSendReport({
      weeklyDataContract,
      weeklyDataQuote,
      monthelyDataQuote,
      subdata,
    });

    res.status(200).json("ok");
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const genMonthlyReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    let startDate, endDate;

    if (fromDate && toDate) {
      startDate = new Date(fromDate);
      endDate = new Date(toDate);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
    } else {
      const today = new Date();
      startDate = new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);
      endDate = new Date(today.getUTCFullYear(), today.getUTCMonth() + 1, 0);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
    }

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    const periodDataQuote = await Quotation.find({
      quotationDate: { $gte: startDate, $lt: endDate },
    })
      .populate("quoteInfo")
      .populate("salesPerson")
      .populate("createdBy")
      .sort({ "salesPerson._id": 1 })
      .lean();

    // const monthlyDataQuote = await Quotation.find({
    //   quotationDate: { $gte: startDate, $lt: endDate },
    // })
    //   .populate("quoteInfo")
    //   .populate("salesPerson")
    //   .populate("createdBy")
    //   .lean();

    const periodDataContract = await Contract.find({
      contractDate: { $gte: startDate, $lt: endDate },
    })
      .populate("quoteInfo")
      .populate("salesPerson")
      .populate("createdBy")
      .lean();

    const subdata = await getStatsForEmail();

    await generateAndSendReport({
      weeklyDataContract: periodDataContract,
      weeklyDataQuote: periodDataQuote,
      subdata,
    });

    res.send("OK");
  } catch (error) {
    next(error);
  }
};

const dashboardData = async (req, res, next) => {
  try {
    const quotationData = await getBarChartData(Quotation, "quotationDate");
    const contractData = await getBarChartData(Contract, "contractDate");
    res.status(200).json({ quotationData, contractData });
  } catch (error) {
    next(error);
  }
};

async function getBarChartData(db, dateField) {
  const now = dayjs();
  let currentFYStart, currentFYEnd, lastFYStart, lastFYEnd;
  const currentYear = now.year();

  if (now.month() >= 3) {
    currentFYStart = dayjs(new Date(currentYear, 3, 1));
    currentFYEnd = dayjs(new Date(currentYear + 1, 2, 31, 23, 59, 59, 999));

    lastFYStart = dayjs(new Date(currentYear - 1, 3, 1));
    lastFYEnd = dayjs(new Date(currentYear, 2, 31, 23, 59, 59, 999));
  } else {
    currentFYStart = dayjs(new Date(currentYear - 1, 3, 1));
    currentFYEnd = dayjs(new Date(currentYear, 2, 31, 23, 59, 59, 999));

    lastFYStart = dayjs(new Date(currentYear - 2, 3, 1));
    lastFYEnd = dayjs(new Date(currentYear - 1, 2, 31, 23, 59, 59, 999));
  }

  // ---------------------
  // Helper function to get aggregated data for a given financial year range
  async function getFYData(startDate, endDate) {
    return db.aggregate([
      {
        $match: {
          [dateField]: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $addFields: {
          calMonth: { $month: `$${dateField}` },
        },
      },
      {
        $addFields: {
          finMonth: {
            $cond: [
              { $gte: ["$calMonth", 4] },
              { $subtract: ["$calMonth", 3] },
              { $add: ["$calMonth", 9] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$finMonth",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  // Fetch data for both financial years
  const [currentFYData, lastFYData] = await Promise.all([
    getFYData(currentFYStart, currentFYEnd),
    getFYData(lastFYStart, lastFYEnd),
  ]);

  // ---------------------
  // Convert data arrays into lookup maps
  const createMap = (data) =>
    data.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

  const currentFYMap = createMap(currentFYData);
  const lastFYMap = createMap(lastFYData);

  // Month index to abbreviation mapping
  const monthMapping = {
    1: "Apr",
    2: "May",
    3: "Jun",
    4: "Jul",
    5: "Aug",
    6: "Sep",
    7: "Oct",
    8: "Nov",
    9: "Dec",
    10: "Jan",
    11: "Feb",
    12: "Mar",
  };

  // Build the final bar chart data
  return Array.from({ length: 12 }, (_, i) => ({
    name: monthMapping[i + 1],
    thisYear: currentFYMap[i + 1] || 0,
    lastYear: lastFYMap[i + 1] || 0,
  }));
}

export {
  create,
  contracts,
  contractify,
  singleContract,
  update,
  approve,
  printCount,
  docData,
  createDC,
  createWorklog,
  getWorklogs,
  getDCs,
  addBatchNumber,
  addChemical,
  deleteBatchNumber,
  deleteChemical,
  getChemical,
  deletedContract,
  getArchive,
  genReport,
  genMonthlyReport,
  dashboardData,
};
