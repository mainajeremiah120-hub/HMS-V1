export const radiologyTemplates = {
  "X-Ray": [
    { finding: "Chest Wall", severity: "normal", location: "Anterior" },
    { finding: "Lungs", severity: "normal", location: "Bilateral" },
    { finding: "Mediastinum", severity: "normal", location: "Central" },
    { finding: "Heart Silhouette", severity: "normal", location: "Central" },
    { finding: "Diaphragm", severity: "normal", location: "Bilateral" },
    { finding: "Pleura", severity: "normal", location: "Bilateral" },
  ],

  "Ultrasound": [
    { finding: "Organ Visualization", severity: "normal", location: "Target area" },
    { finding: "Echogenicity", severity: "normal", location: "Organ" },
    { finding: "Size", severity: "normal", location: "Organ" },
    { finding: "Vascularity", severity: "normal", location: "Organ" },
    { finding: "Free Fluid", severity: "normal", location: "Peritoneal" },
    { finding: "Lymph Nodes", severity: "normal", location: "Regional" },
  ],

  "CT Scan": [
    { finding: "Brain Parenchyma", severity: "normal", location: "Bilateral" },
    { finding: "Ventricles", severity: "normal", location: "Central" },
    { finding: "Sulci", severity: "normal", location: "Cortical" },
    { finding: "Gray-White Matter", severity: "normal", location: "Bilateral" },
    { finding: "Bone Windows", severity: "normal", location: "Skull" },
    { finding: "Sinuses", severity: "normal", location: "Paranasal" },
    { finding: "Soft Tissues", severity: "normal", location: "Periorbital" },
  ],

  "MRI": [
    { finding: "T1 Signal", severity: "normal", location: "Brain" },
    { finding: "T2 Signal", severity: "normal", location: "Brain" },
    { finding: "FLAIR Signal", severity: "normal", location: "Brain" },
    { finding: "DWI Signal", severity: "normal", location: "Brain" },
    { finding: "ADC Signal", severity: "normal", location: "Brain" },
    { finding: "Gradient Echo", severity: "normal", location: "Brain" },
  ],

  "Mammogram": [
    { finding: "Breast Density", severity: "normal", location: "Bilateral" },
    { finding: "Parenchymal Pattern", severity: "normal", location: "Bilateral" },
    { finding: "Masses", severity: "normal", location: "Bilateral" },
    { finding: "Microcalcifications", severity: "normal", location: "Bilateral" },
    { finding: "Architectural Distortion", severity: "normal", location: "Bilateral" },
    { finding: "Skin Thickening", severity: "normal", location: "Bilateral" },
  ],

  "Fluoroscopy": [
    { finding: "Contrast Flow", severity: "normal", location: "Vessel" },
    { finding: "Vessel Patency", severity: "normal", location: "Target" },
    { finding: "Luminal Narrowing", severity: "normal", location: "Vessel" },
    { finding: "Filling Defect", severity: "normal", location: "Vessel" },
    { finding: "Extravasation", severity: "normal", location: "Vessel" },
    { finding: "Collateral Vessels", severity: "normal", location: "Regional" },
  ],

  "PET Scan": [
    { finding: "FDG Uptake", severity: "normal", location: "Organ" },
    { finding: "Standardized Uptake Value (SUV)", severity: "normal", location: "Lesion" },
    { finding: "Metabolic Activity", severity: "normal", location: "Tumor" },
    { finding: "Perfusion", severity: "normal", location: "Organ" },
    { finding: "Hypometabolism", severity: "normal", location: "Region" },
    { finding: "Hypermetabolism", severity: "normal", location: "Lesion" },
  ],

  "DEXA Scan": [
    { finding: "Lumbar Spine BMD", severity: "normal", location: "L1-L4" },
    { finding: "Femoral Neck BMD", severity: "normal", location: "Hip" },
    { finding: "Total Hip BMD", severity: "normal", location: "Hip" },
    { finding: "T-Score", severity: "normal", location: "Spine" },
    { finding: "Z-Score", severity: "normal", location: "Spine" },
    { finding: "Fracture Risk", severity: "normal", location: "Skeletal" },
  ],

  "Other": [
    { finding: "Observation", severity: "normal", location: "Area of Interest" },
    { finding: "Additional Finding", severity: "normal", location: "Other" },
  ],
};

export const getRadiologyTemplate = (scanType) => {
  return radiologyTemplates[scanType] || radiologyTemplates["Other"];
};

export const RADIOLOGY_FEES = {
  "X-Ray": 500,
  "Ultrasound": 800,
  "CT Scan": 3000,
  "MRI": 5000,
  "Mammogram": 2000,
  "Fluoroscopy": 2500,
  "PET Scan": 8000,
  "DEXA Scan": 1500,
  "Other": 1000,
};

export const getRadiologyScanCost = (scanType) => {
  return RADIOLOGY_FEES[scanType] || RADIOLOGY_FEES["Other"];
};