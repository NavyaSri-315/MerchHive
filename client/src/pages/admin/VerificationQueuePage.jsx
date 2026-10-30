import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  FileText,
  ExternalLink,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import API from '../../api/axios';

const VerificationQueuePage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionModal, setActionModal] = useState({ open: false, company: null, action: 'approve' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [creditLimit, setCreditLimit] = useState(1000000); // 10 Lakhs
  const [statusMsg, setStatusMsg] = useState('');

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admin/verification-queue', {
        params: { status: filter },
      });
      setCompanies(response.data.companies || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load queue', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [filter]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const { company, action } = actionModal;
    if (!company) return;

    try {
      await API.put(`/admin/verify-company/${company._id}`, {
        status: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: action === 'reject' ? rejectionReason : '',
        creditLimit: action === 'approve' ? creditLimit : undefined,
      });

      setStatusMsg(`Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${company.name}`);
      setActionModal({ open: false, company: null, action: 'approve' });
      setRejectionReason('');
      loadCompanies();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg('Operation failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Admin Analytics</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-purple-700" />
              <h1 className="text-2xl font-black text-slate-900">
                Company KYC & Document Verification Queue
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Validate GST Registration, Tax identification, and assign verified trading status & credit limits
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'pending' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
            {statusMsg}
          </div>
        )}

        {/* Company Queue Cards */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading company submissions...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Queue is Clear</h3>
            <p className="text-xs text-slate-500 mt-1">All company verification requests have been addressed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {companies.map((comp) => (
              <div
                key={comp._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
              >
                {/* Left: Company Details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-base font-black text-slate-900">{comp.name}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        comp.verificationStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.verificationStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {comp.verificationStatus}
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Type: {comp.businessType?.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Tax ID / GST: <span className="font-mono font-bold text-slate-900">{comp.taxId}</span> • Registered by: <span className="font-semibold text-slate-800">{comp.user?.name}</span> ({comp.user?.email})
                  </p>
                  <p className="text-xs text-slate-500">
                    Facility: {comp.address?.street}, {comp.address?.city}, {comp.address?.state} {comp.address?.zip}
                  </p>

                  {comp.rejectionReason && (
                    <p className="text-xs text-red-600 font-medium">
                      Rejection Note: {comp.rejectionReason}
                    </p>
                  )}

                  {/* Uploaded Documents List */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Submitted Proofs:</span>
                    {comp.documents && comp.documents.length > 0 ? (
                      comp.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-medium rounded-md border border-slate-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>{doc.title || 'GST Document'}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No files attached yet</span>
                    )}
                  </div>
                </div>

                {/* Right: Decision Controls */}
                <div className="flex items-center space-x-3 shrink-0">
                  {comp.verificationStatus !== 'approved' && (
                    <button
                      onClick={() =>
                        setActionModal({ open: true, company: comp, action: 'approve' })
                      }
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Approve & Verify
                    </button>
                  )}

                  {comp.verificationStatus !== 'rejected' && (
                    <button
                      onClick={() =>
                        setActionModal({ open: true, company: comp, action: 'reject' })
                      }
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Reject Submission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Confirmation Modal */}
        {actionModal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <h3 className="text-base font-bold text-slate-900">
                {actionModal.action === 'approve'
                  ? `Approve Verification for ${actionModal.company?.name}`
                  : `Reject Documentation for ${actionModal.company?.name}`}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {actionModal.action === 'approve'
                  ? 'This unlocks immediate wholesale catalog listing and B2B order placements.'
                  : 'Please provide a clear reason for the business to rectify their paperwork.'}
              </p>

              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                {actionModal.action === 'approve' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned B2B Credit Limit (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-bold text-slate-900"
                      required
                    />
                    <span className="text-[10px] text-slate-400">Default: 10 Lakhs Net 30 Line</span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rejection Reason (Feedback for Business)
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. GST Certificate blurred or expired, mismatch in legal business name..."
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActionModal({ open: false, company: null, action: 'approve' })}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs cursor-pointer ${
                      actionModal.action === 'approve'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    Confirm {actionModal.action === 'approve' ? 'Approval' : 'Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationQueuePage;
