import RadiologyRequest from "../clinical/radiologyRequest.model.js";
import { getRadiologyTemplate, getRadiologyScanCost } from "../radiology/radiologyTemplates.js";
import Billing from "../billing/billing.model.js";
import { uploadImageStream } from "../../config/cloudinary.js";

// @desc    Get all pending/processing radiology requests
// @route   GET /api/radiology/requests
// @access  Radiology, Admin
export const getAllRadiologyRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status
      ? { status }
      : { status: { $in: ["pending", "processing"] } };

    const radiologyRequests = await RadiologyRequest.find(filter)
      .populate("patient", "fullName phone gender bloodGroup dateOfBirth")
      .populate("doctor", "fullName department")
      .populate("reportedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(radiologyRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single radiology request with template
// @route   GET /api/radiology/requests/:id
// @access  Radiology, Admin
export const getRadiologyRequestById = async (req, res) => {
  try {
    const radiologyRequest = await RadiologyRequest.findById(req.params.id)
      .populate("patient", "fullName phone gender bloodGroup dateOfBirth")
      .populate("doctor", "fullName department")
      .populate("reportedBy", "fullName");

    if (!radiologyRequest) {
      return res.status(404).json({ message: "Radiology request not found" });
    }

    // Load template if no findings yet
    const template = getRadiologyTemplate(radiologyRequest.scanType);

    res.status(200).json({ radiologyRequest, template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get radiology template for a scan type
// @route   GET /api/radiology/template/:scanType
// @access  Radiology, Admin
export const getTemplate = async (req, res) => {
  try {
    const scanType = decodeURIComponent(req.params.scanType);
    const template = getRadiologyTemplate(scanType);
    res.status(200).json({ scanType, template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark radiology request as processing
// @route   PUT /api/radiology/requests/:id/process
// @access  Radiology, Admin
export const processRadiologyRequest = async (req, res) => {
  try {
    const radiologyRequest = await RadiologyRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "processing",
        reportedBy: req.user._id,
      },
      { new: true }
    )
      .populate("patient", "fullName phone")
      .populate("doctor", "fullName department");

    if (!radiologyRequest) {
      return res.status(404).json({ message: "Radiology request not found" });
    }

    res.status(200).json({ message: "Radiology request marked as processing", radiologyRequest });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Upload radiology findings/report
// @route   PUT /api/radiology/requests/:id/report
// @access  Radiology, Admin
 export const uploadRadiologyReport = async (req, res) => {
  try {
    const { findings, impression, recommendation, radiologistNotes, imageUrls, imageCount } = req.body;

    const radiologyRequest = await RadiologyRequest.findById(req.params.id).populate("patient");

    if (!radiologyRequest) {
      return res.status(404).json({ message: "Radiology request not found" });
    }

    // 1. Update the Request
    radiologyRequest.findings = findings || [];
    radiologyRequest.impression = impression || null;
    radiologyRequest.recommendation = recommendation || null;
    radiologyRequest.radiologistNotes = radiologistNotes || null;
    radiologyRequest.imageUrls = imageUrls || [];
    radiologyRequest.imageCount = imageCount || 0;
    radiologyRequest.status = "completed";
    radiologyRequest.resultUploadedAt = new Date();
    radiologyRequest.reportedBy = req.user._id;

    await radiologyRequest.save();

    // 2. NEW: Add logic to update the Billing Record
    // Find the patient's active, unpaid bill
    let bill = await Billing.findOne({ 
      patient: radiologyRequest.patient._id, 
      paymentStatus: { $ne: "Paid" } 
    });

    const cost = getRadiologyScanCost(radiologyRequest.scanType);
    const radiologyCharge = {
      radiologyRequestId: radiologyRequest._id,
      testName: radiologyRequest.scanType,
      cost,
      status: "Pending"
    };

    if (bill) {
      bill.radiologyCharges.push(radiologyCharge);
    } else {
      bill = new Billing({
        patient: radiologyRequest.patient._id,
        radiologyCharges: [radiologyCharge],
        paymentStatus: "Unpaid",
        paymentMethod: "Cash"
      });
    }

    await bill.save();

    const populated = await radiologyRequest.populate([
      { path: "patient", select: "fullName phone gender bloodGroup dateOfBirth" },
      { path: "doctor", select: "fullName department" },
      { path: "reportedBy", select: "fullName" },
    ]);

    res.status(200).json({ message: "Radiology report uploaded and billed successfully", radiologyRequest: populated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @desc    Get completed radiology requests
// @route   GET /api/radiology/requests/completed
// @access  Radiology, Admin
export const getCompletedRadiologyRequests = async (req, res) => {
  try {
    const radiologyRequests = await RadiologyRequest.find({ status: "completed" })
      .populate("patient", "fullName phone gender bloodGroup dateOfBirth")
      .populate("doctor", "fullName department")
      .populate("reportedBy", "fullName")
      .sort({ resultUploadedAt: -1 });

    res.status(200).json(radiologyRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient radiology history
// @route   GET /api/radiology/patients/:patientId
// @access  Radiology, Admin, Doctor
export const getPatientRadiologyHistory = async (req, res) => {
  try {
    const radiologyRequests = await RadiologyRequest.find({ patient: req.params.patientId })
      .populate("doctor", "fullName department")
      .populate("reportedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(radiologyRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient's completed radiology results (for doctor to view)
// @route   GET /api/radiology/results/:patientId
// @access  Doctor, Radiology, Admin
export const getPatientRadiologyResults = async (req, res) => {
  try {
    const radiologyRequests = await RadiologyRequest.find({
      patient: req.params.patientId,
      status: "completed",
    })
      .populate("doctor", "fullName department")
      .populate("reportedBy", "fullName")
      .sort({ resultUploadedAt: -1 });

    res.status(200).json(radiologyRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel radiology request
// @route   PUT /api/radiology/requests/:id/cancel
// @access  Radiology, Admin
export const cancelRadiologyRequest = async (req, res) => {
  try {
    const radiologyRequest = await RadiologyRequest.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!radiologyRequest) {
      return res.status(404).json({ message: "Radiology request not found" });
    }

    res.status(200).json({ message: "Radiology request cancelled", radiologyRequest });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete radiology request
// @route   DELETE /api/radiology/requests/:id
// @access  Admin
export const deleteRadiologyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRequest = await RadiologyRequest.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({ success: false, message: "Radiology record not found." });
    }

    return res.status(200).json({ success: true, message: "Radiology record successfully deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upload multiple radiology scan images to Cloudinary (or local fallback)
// @route   POST /api/radiology/upload
// @access  Radiology, Admin
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) =>
      uploadImageStream(file.buffer, file.originalname)
    );

    const imageUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      message: "Images uploaded successfully",
      urls: imageUrls,
      count: imageUrls.length,
    });
  } catch (error) {
    console.error("Radiology upload error:", error);
    res.status(500).json({ message: "Failed to upload images", error: error.message });
  }
};