import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle2, Clock, Upload, ShieldCheck, XCircle } from 'lucide-react';
import DocumentUploadModal from './DocumentUploadModal';

const VerificationBanner = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [modalOpen, setModalOpen] = useState(false);

  if (!isAuthenticated || !user || user.role === 'superadmin') {
    return null;
  }

  const company = user.company;
  const status = company?.verificationStatus || 'unregistered';

  if (status === 'approved') {
    return null; // Silent when verified and good to go
  }

  return (
    <>
      <div
        className={`w-full py-2.5 px-4 text-xs font-medium border-b flex items-center justify-between transition-all ${
          status === 'pending'
            ? 'bg-amber-500/10 text-amber-900 border-amber-300/40'
            : status === 'rejected'
            ? 'bg-red-500/10 text-red-900 border-red-300/40'
            : 'bg-blue-500/10 text-blue-900 border-blue-300/40'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            {status === 'pending' ? (
              <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            ) : status === 'rejected' ? (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
            )}

            <div>
              <span className="font-bold">
                {status === 'pending'
                  ? 'Verification Pending:'
                  : status === 'rejected'
                  ? 'Verification Rejected:'
                  : 'Action Required:'}
              </span>{' '}
              {status === 'pending' ? (
                <span>
                  Your business credentials ({company?.name || 'Company'}, Tax ID: {company?.taxId || 'Pending'}) are under SuperAdmin review. Trading & order placement will unlock once verified.
                </span>
              ) : status === 'rejected' ? (
                <span>
                  Reason: {company?.rejectionReason || 'Submitted business documentation was invalid.'} Please upload an updated GST/License.
                </span>
              ) : (
                <span>Please complete your company profile and upload verification documents.</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="shrink-0 flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Documents</span>
          </button>
        </div>
      </div>

      <DocumentUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        company={company}
      />
    </>
  );
};

export default VerificationBanner;
