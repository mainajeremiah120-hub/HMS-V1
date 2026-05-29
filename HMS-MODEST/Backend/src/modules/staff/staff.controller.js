import Staff from "./staff.model.js";
import User from "../auth/auth.model.js";
import { generateRandomPassword } from "../auth/auth.controller.js";
import { sendStaffWelcomeEmail } from "../../services/mail.service.js";

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "radiology") return "radiologist";
  if (value === "pharmacy") return "pharmacist";
  if (value === "lab") return "lab";
  if (value === "reception") return "receptionist";
  if (value === "cashier") return "cashier";
  return value;
};

const normalizeDepartment = (department) => {
  const value = String(department || "").trim();
  switch (value.toLowerCase()) {
    case "administration":
      return "Administration";
    case "reception":
      return "reception";
    case "clinical consultation":
      return "Clinical Consultation";
    case "ward":
      return "Ward";
    case "pharmacy":
      return "Pharmacy";
    case "laboratory":
      return "Laboratory";
    case "radiology":
      return "Radiology";
    case "cashier":
      return "cashier";
    default:
      return value;
  }
};

// @desc    Create new staff record and associated user account
export const createStaff = async (req, res) => {
  try {
    const normalizedRole = normalizeRole(req.body.role);
    const normalizedDepartment = normalizeDepartment(req.body.department);
    const staffData = {
      ...req.body,
      role: normalizedRole,
      department: normalizedDepartment,
    };

    // 1. Create the detailed staff record in the Staff collection
    const staff = await Staff.create(staffData);

    // 2. Generate a secure random password using your helper
    const defaultPassword = generateRandomPassword(); 

    // 3. Create the linked User account
    // Pass the plain string; your User model should handle hashing via a pre-save hook
    await User.create({
      name: staff.fullName,
      email: staff.email,
      password: defaultPassword, 
      role: staff.role,
      staffId: staff._id,
    });

    // 4. Send the welcome email with the readable password
    await sendStaffWelcomeEmail({
      to: staff.email,
      fullName: staff.fullName,
      role: staff.role,
      email: staff.email,
      password: defaultPassword, 
    });

    // 5. Success response
    res.status(201).json({ 
      success: true, 
      message: "Staff and user account created successfully",
      staff, 
      tempPassword: defaultPassword // For development testing
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all staff records
export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update staff details
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Staff.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!updated) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, message: "Staff updated", staff: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete staff and associated user
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    
    const staffMember = await Staff.findById(id);
    if (staffMember) {
      // Delete the login account first
      await User.findOneAndDelete({ email: staffMember.email });
    }
    
    await Staff.findByIdAndDelete(id);
    res.json({ success: true, message: "Staff and user account deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};