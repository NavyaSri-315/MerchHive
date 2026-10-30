import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, UploadCloud, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { uploadCompanyDocument } from '../../store/slices/authSlice';

const DocumentUploadModal = ({ isOpen, onClose, company }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('GST Certificate / Business License');
  const [documentType, setDocumentType] = useState('gst_cert');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMsg('Please select a document file (PDF or Image)');
      return;
    }

    setIsUploading(true);
    setStatusMsg('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);
    formData.append('documentType', documentType);

    try {
      await dispatch(uploadCompanyDocument({ formData })).unwrap();
      setIsUploading(false);
      setStatusMsg('Document submitted successfully for Admin review!');
      setTimeout(() => {
        onClose();
        setStatusMsg('');
      }, 1500);
    } catch (err) {
      setIsUploading(false);
      setStatusMsg(typeof err === 'string' ? err : 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Business Verification Document</h3>
              <p className="text-xs text-slate-500">GST Registration, PAN Card, or Trade License</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Category
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="gst_cert">GST Registration Certificate (India)</option>
              <option value="pan_card">Company PAN / Tax Identification Card</option>
              <option value="incorporation_cert">Certificate of Incorporation (CIN)</option>
              <option value="trade_license">Municipal Trade License / Factory Permit</option>
              <option value="other">Other Official Verification Document</option>
            </select>
          </div>

          {/* File input drag drop box */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
            <input
              type="file"
              id="doc-upload"
              onChange={handleFileChange}
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
            />
            <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
              {file ? (
                <div className="text-xs text-blue-700 font-semibold flex items-center space-x-1">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <span className="text-xs font-semibold text-slate-700">
                    Click to browse or drop file here
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Supports PDF, PNG, JPG up to 10MB
                  </span>
                </>
              )}
            </label>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                statusMsg.includes('success')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Existing uploaded documents preview */}
          {company?.documents && company.documents.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-600 mb-2">Existing Uploaded Documents:</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {company.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-100 rounded-md"
                  >
                    <span className="truncate max-w-[240px] text-slate-800">{doc.title}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit For Verification</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
