import express from "express";
import { protect, authorizeRoles } from "../../middleware/auth.middleware.js";
import {
  getAllRadiologyRequests,
  getRadiologyRequestById,
  getTemplate,
  processRadiologyRequest,
  uploadRadiologyReport,
  getCompletedRadiologyRequests,
  getPatientRadiologyHistory,
  getPatientRadiologyResults,
  cancelRadiologyRequest,
  deleteRadiologyRequest,
} from "./radiology.controller.js";

const router = express.Router();

const radiologyAccess = authorizeRoles("admin", "nurse", "doctor", "radiology");

// Get all pending/processing requests
router.get("/requests", protect, radiologyAccess, getAllRadiologyRequests);

// Get completed requests
router.get("/requests/completed", protect, radiologyAccess, getCompletedRadiologyRequests);

// Get single request with template
router.get("/requests/:id", protect, radiologyAccess, getRadiologyRequestById);

// Get template for a scan type
router.get("/template/:scanType", protect, radiologyAccess, getTemplate);

// Mark as processing
router.put("/requests/:id/process", protect, radiologyAccess, processRadiologyRequest);

// Upload report/findings
router.put("/requests/:id/report", protect, radiologyAccess, uploadRadiologyReport);

// Cancel request
router.put("/requests/:id/cancel", protect, radiologyAccess, cancelRadiologyRequest);

// Patient radiology history
router.get("/patients/:patientId", protect, radiologyAccess, getPatientRadiologyHistory);

// Get patient's completed radiology results
router.get("/results/:patientId", protect, radiologyAccess, getPatientRadiologyResults);

// Delete request
router.delete("/requests/:id", protect, radiologyAccess, deleteRadiologyRequest);

export default router;