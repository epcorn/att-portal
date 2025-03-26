import Correspondence from "../models/correspondenceModel.js";
import Quotation from "../models/quotationModel.js";
import Contract from "../models/contractModel.js";
import { cloudinaryService } from "../config/cloudinary.js";
// Helper function to validate parent document

const validateParentDocument = async (quotationId, contractId) => {
  if (quotationId) {
    const exists = await Quotation.exists({ _id: quotationId });
    return exists ? { parentField: "quotation", parentId: quotationId } : null;
  }
  if (contractId) {
    const exists = await Contract.exists({ _id: contractId });
    return exists ? { parentField: "contract", parentId: contractId } : null;
  }
  return null;
};

export const addFileToCorrespondence = async (req, res, next) => {
  let uploadFile = null;
  try {
    const { quotationId, contractId, direction } = req.body;
    // Validate input
    if (!quotationId && !contractId) {
      return res
        .status(400)
        .json({ message: "Either quotationId or contractId is required" });
    }
    if (!["inward", "outward"].includes(direction)) {
      return res.status(400).json({ message: "Invalid direction" });
    }

    // Validate parent document exists
    const parent = await validateParentDocument(quotationId, contractId);
    if (!parent) {
      return res.status(404).json({ message: "Parent document not found" });
    }
    uploadFile = await cloudinaryService.uploadDocument(
      req.file.buffer,
      quotationId ? quotationId : contractId,
      req.file.originalname
    );
    req.body.url = uploadFile.url;
    req.body.publicId = uploadFile.publicId;
    req.body.uploadedBy = req.user.username;
    req.body.resourceType = uploadFile.resourceType;
    // Find or create correspondence
    let correspondence = await Correspondence.findOne({
      [parent.parentField]: parent.parentId,
    });

    if (!correspondence) {
      correspondence = new Correspondence({
        [parent.parentField]: parent.parentId,
        [direction]: { files: [{ ...req.body }] },
      });
    } else {
      correspondence[direction].files.push(req.body);
    }

    await correspondence.save();
    res.status(201).json({ message: "File uploaded", result: correspondence });
  } catch (error) {
    if (uploadFile && uploadFile.publicId) {
      try {
        await cloudinaryService.deleteDocument(
          uploadFile.publicId,
          uploadFile.resourceType
        );
        console.log(`Cleaned up orphaned file: ${uploadFile.publicId}`);
      } catch (cleanupError) {
        throw new Error(`Failed to clean up file: ${cleanupError}`);
      }
    }
    console.error(error);
    next(error);
  }
};

// Get Correspondence by Parent ID
export const getCorrespondence = async (req, res, next) => {
  try {
    const { quotationId, contractId } = req.body;
    const parent = await validateParentDocument(quotationId, contractId);
    if (!parent) {
      return res.status(404).json({ error: "Parent document not found" });
    }
    const correspondence = await Correspondence.findOne({
      [parent.parentField]: parent.parentId,
    });

    if (!correspondence) {
      return res
        .status(200)
        .json({ message: "No corespondence yet!", result: null });
    }

    res.json({ result: correspondence });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Update File Metadata
export const updateFile = async (req, res, next) => {
  try {
    const { correspondenceId, direction, publicId } = req.params;
    const updateData = req.body;

    const result = await Correspondence.findOneAndUpdate(
      {
        _id: correspondenceId,
        [`${direction}.files.publicId`]: publicId,
      },
      {
        $set: {
          [`${direction}.files.$[elem].title`]: updateData.title,
          [`${direction}.files.$[elem].description`]: updateData.description,
          [`${direction}.files.$[elem].category`]: updateData.category,
          [`${direction}.files.$[elem].tags`]: updateData.tags,
        },
      },
      {
        arrayFilters: [{ "elem.publicId": publicId }],
        new: true,
      }
    );

    if (!result) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Delete File
export const deleteFile = async (req, res) => {
  try {
    const { direction, publicId, resourceType } = req.body;
    const { correspondenceId } = req.params;

    if (!correspondenceId || !direction || !publicId || !resourceType) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const updatedDocument = await Correspondence.findOneAndUpdate(
      { _id: correspondenceId },
      { $pull: { [`${direction}.files`]: { publicId } } },
      { new: true, projection: { _id: 1 } }
    ).lean(); // Improves read performance

    if (!updatedDocument) {
      return res
        .status(404)
        .json({ error: "Correspondence not found or file does not exist" });
    }

    try {
      await cloudinaryService.deleteDocument(publicId, resourceType);
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
      return res.status(500).json({
        error: "File deleted from DB but failed to remove from Cloudinary",
      });
    }

    res.json({ message: "File successfully deleted", correspondenceId });
  } catch (error) {
    console.error("Error deleting file:", error);
    res
      .status(500)
      .json({ error: "An internal error occurred while deleting the file" });
  }
};

// Delete Entire Correspondence
export const deleteCorrespondence = async (req, res) => {
  try {
    const { correspondenceId } = req.params;
    const result = await Correspondence.findByIdAndDelete(correspondenceId);

    if (!result) {
      return res.status(404).json({ error: "Correspondence not found" });
    }

    /* Also Delete,
       Remaing images form cloudianry
    */

    res.json({ message: "Correspondence deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
