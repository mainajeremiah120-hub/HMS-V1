import { useState, useEffect } from "react";
import API from "../api/axios";

// ==================== PENDING TAB ====================
function PendingTab({ onProcess, onDelete, refreshKey }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserRole = () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed?.role || null;
    } catch (e) {
      console.error("Error parsing user:", e);
      return null;
    }
  };

  const userRole = getUserRole();
  const canDelete = userRole === "admin" || userRole === "radiology";

  const fetchRequests = async () => {
    try {
      const res = await API.get("/radiology/requests?status=pending");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshKey]);

  const urgencyColors = {
    routine: "bg-green-100 text-green-700",
    urgent: "bg-yellow-100 text-yellow-700",
    emergency: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        Pending Radiology Requests
      </h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending requests
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Scan Type</th>
                <th className="px-6 py-3 text-left">Body Part</th>
                <th className="px-6 py-3 text-left">Doctor</th>
                <th className="px-6 py-3 text-left">Urgency</th>
                <th className="px-6 py-3 text-left">Cost</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
                {canDelete && (
                  <th className="px-6 py-3 text-left">Delete</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {r.patient?.fullName}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.scanType}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.bodyPart}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.doctor?.fullName}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${urgencyColors[r.urgency]}`}
                    >
                      {r.urgency}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    KES {r.scanCost}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => onProcess(r)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition"
                    >
                      Process
                    </button>
                  </td>

                  {canDelete && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          onDelete(r._id, r.patient?.fullName)
                        }
                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==================== PROCESSING TAB ====================
function ProcessingTab({ onEnterReport, refreshKey }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/radiology/requests?status=processing");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshKey]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        Processing Radiology Requests
      </h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No requests being processed
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Scan Type</th>
                <th className="px-6 py-3 text-left">Body Part</th>
                <th className="px-6 py-3 text-left">Doctor</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {r.patient?.fullName}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.scanType}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.bodyPart}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.doctor?.fullName}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => onEnterReport(r)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition"
                    >
                      Enter Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==================== COMPLETED TAB ====================
function CompletedTab({ onViewReport, onDelete, refreshKey }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserRole = () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed?.role || null;
    } catch (e) {
      console.error("Error parsing user:", e);
      return null;
    }
  };

  const userRole = getUserRole();
  const canDelete = userRole === "admin" || userRole === "radiology";

  const fetchRequests = async () => {
    try {
      const res = await API.get("/radiology/requests/completed");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshKey]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        Completed Radiology Reports
      </h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No completed reports
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Scan Type</th>
                <th className="px-6 py-3 text-left">Body Part</th>
                <th className="px-6 py-3 text-left">Doctor</th>
                <th className="px-6 py-3 text-left">Reported</th>
                <th className="px-6 py-3 text-left">Actions</th>
                {canDelete && (
                  <th className="px-6 py-3 text-left">Delete</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {r.patient?.fullName}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.scanType}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.bodyPart}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.doctor?.fullName}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {r.resultUploadedAt
                      ? new Date(
                          r.resultUploadedAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewReport(r)}
                      className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 transition"
                    >
                      View Report
                    </button>
                  </td>

                  {canDelete && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          onDelete(r._id, r.patient?.fullName)
                        }
                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==================== REPORT ENTRY MODAL ====================
function ReportEntryModal({ request, onClose, onSave }) {
  const [findings, setFindings] = useState([]);
  const [impression, setImpression] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [radiologistNotes, setRadiologistNotes] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await API.get(
          `/radiology/template/${encodeURIComponent(
            request.scanType
          )}`
        );

        setFindings(
          res.data.template.map((f) => ({
            finding: f.finding,
            severity: f.severity || "normal",
            location: f.location || "",
            notes: "",
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchTemplate();
  }, [request]);

  const handleFindingChange = (index, field, value) => {
    const updated = [...findings];
    updated[index][field] = value;
    setFindings(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await API.put(`/radiology/requests/${request._id}/report`, {
        findings,
        impression,
        recommendation,
        radiologistNotes,
        imageUrls: imageUrls
          ? imageUrls.split(",").map((u) => u.trim())
          : [],
        imageCount: imageUrls
          ? imageUrls.split(",").filter(Boolean).length
          : 0,
      });

      onSave();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload report");
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    normal: "text-green-700",
    mild: "text-yellow-600",
    moderate: "text-orange-600",
    severe: "text-red-700 font-bold",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Enter Radiology Report
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {request.scanType} — {request.bodyPart} —{" "}
            {request.patient?.fullName}
          </p>
        </div>

        <div className="p-6">
          <table className="w-full text-sm mb-6">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Finding</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Severity</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {findings.map((f, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 font-medium">
                    {f.finding}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={f.location}
                      onChange={(e) =>
                        handleFindingChange(
                          index,
                          "location",
                          e.target.value
                        )
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={f.severity}
                      onChange={(e) =>
                        handleFindingChange(
                          index,
                          "severity",
                          e.target.value
                        )
                      }
                      className={`border border-gray-300 rounded px-2 py-1 text-sm ${severityColors[f.severity]}`}
                    >
                      <option value="normal">Normal</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={f.notes}
                      onChange={(e) =>
                        handleFindingChange(
                          index,
                          "notes",
                          e.target.value
                        )
                      }
                      placeholder="Additional notes..."
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impression
            </label>

            <textarea
              rows={3}
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Overall radiology impression..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendation
            </label>

            <textarea
              rows={3}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Recommendations..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radiologist Notes
            </label>

            <textarea
              rows={2}
              value={radiologistNotes}
              onChange={(e) => setRadiologistNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URLs (comma separated)
            </label>

            <textarea
              rows={2}
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder="https://image1.com, https://image2.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Report"}
            </button>

            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== REPORT MODAL ====================
function RadiologyReportModal({ request, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b no-print">
          <h2 className="text-lg font-bold text-gray-800">
            Radiology Report
          </h2>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
            >
              🖨️ Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>

        <div className="print-area p-8">
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Hospital Management System
            </h1>

            <p className="text-gray-500">
              Radiology Department
            </p>

            <h2 className="text-lg font-semibold text-blue-700 mt-2">
              Radiology Report
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Patient Information
              </h3>

              <p className="text-sm">
                <span className="font-medium">Name:</span>{" "}
                {request.patient?.fullName}
              </p>

              <p className="text-sm">
                <span className="font-medium">Gender:</span>{" "}
                {request.patient?.gender}
              </p>

              <p className="text-sm">
                <span className="font-medium">Phone:</span>{" "}
                {request.patient?.phone}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Scan Information
              </h3>

              <p className="text-sm">
                <span className="font-medium">Scan Type:</span>{" "}
                {request.scanType}
              </p>

              <p className="text-sm">
                <span className="font-medium">Body Part:</span>{" "}
                {request.bodyPart}
              </p>

              <p className="text-sm">
                <span className="font-medium">Doctor:</span>{" "}
                {request.doctor?.fullName}
              </p>

              <p className="text-sm">
                <span className="font-medium">Date:</span>{" "}
                {request.resultUploadedAt
                  ? new Date(
                      request.resultUploadedAt
                    ).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          {request.clinicalNotes && (
            <div className="mb-4 bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700">
                Clinical Notes
              </p>

              <p className="text-sm text-gray-600">
                {request.clinicalNotes}
              </p>
            </div>
          )}

          {request.findings?.length > 0 && (
            <table className="w-full text-sm mb-6 border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">
                    Finding
                  </th>
                  <th className="px-4 py-2 text-left border">
                    Severity
                  </th>
                  <th className="px-4 py-2 text-left border">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left border">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>
                {request.findings.map((f, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">
                      {f.finding}
                    </td>

                    <td className="px-4 py-2 border capitalize">
                      {f.severity}
                    </td>

                    <td className="px-4 py-2 border">
                      {f.location || "—"}
                    </td>

                    <td className="px-4 py-2 border">
                      {f.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {request.impression && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-1">
                Impression
              </h3>

              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {request.impression}
              </p>
            </div>
          )}

          {request.recommendation && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-1">
                Recommendation
              </h3>

              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {request.recommendation}
              </p>
            </div>
          )}

          {request.radiologistNotes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-1">
                Radiologist Notes
              </h3>

              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {request.radiologistNotes}
              </p>
            </div>
          )}

          <div className="text-center mt-6 pt-4 border-t text-xs text-gray-400">
            <p>Generated by HMS — Hospital Management System</p>
            <p>Printed on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================
const tabs = [
  { id: "pending", label: "⏳ Pending" },
  { id: "processing", label: "🩻 Processing" },
  { id: "completed", label: "✅ Completed" },
];

function Radiology() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReportEntryModal, setShowReportEntryModal] =
    useState(false);
  const [showReportModal, setShowReportModal] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProcess = async (request) => {
    try {
      await API.put(
        `/radiology/requests/${request._id}/process`
      );

      setRefreshKey((k) => k + 1);
      setActiveTab("processing");
    } catch (err) {
      alert("Failed to process request");
    }
  };

  const handleEnterReport = async (request) => {
    try {
      const res = await API.get(
        `/radiology/requests/${request._id}`
      );

      setSelectedRequest(res.data.radiologyRequest);
      setShowReportEntryModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load request");
    }
  };

  const handleViewReport = async (request) => {
    try {
      const res = await API.get(
        `/radiology/requests/${request._id}`
      );

      setSelectedRequest(res.data.radiologyRequest);
      setShowReportModal(true);
    } catch (err) {
      console.error(err);
      alert("Could not load report");
    }
  };

  const handleDelete = async (id, patientName) => {
    if (
      window.confirm(
        `Delete radiology record for ${
          patientName || "this patient"
        }?`
      )
    ) {
      try {
        await API.delete(`/radiology/requests/${id}`);

        alert("Radiology record deleted.");
        setRefreshKey((k) => k + 1);
      } catch (err) {
        console.error(err);
        alert(
          err.response?.data?.message ||
            "Failed to delete record"
        );
      }
    }
  };

  const handleSave = () => {
    setRefreshKey((k) => k + 1);
    setActiveTab("completed");
  };

  return (
    <div>
      <div className="no-print">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Radiology Department
        </h1>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "pending" && (
          <PendingTab
            refreshKey={refreshKey}
            onProcess={handleProcess}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "processing" && (
          <ProcessingTab
            refreshKey={refreshKey}
            onEnterReport={handleEnterReport}
          />
        )}

        {activeTab === "completed" && (
          <CompletedTab
            refreshKey={refreshKey}
            onViewReport={handleViewReport}
            onDelete={handleDelete}
          />
        )}
      </div>

      {showReportEntryModal && selectedRequest && (
        <ReportEntryModal
          request={selectedRequest}
          onClose={() => setShowReportEntryModal(false)}
          onSave={handleSave}
        />
      )}

      {showReportModal && selectedRequest && (
        <RadiologyReportModal
          request={selectedRequest}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

export default Radiology;