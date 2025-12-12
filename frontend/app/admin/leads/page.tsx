'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filters, setFilters] = useState({ status: '', source: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [syncingLeadId, setSyncingLeadId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [filters.status, filters.source, pagination.page]);

  const loadLeads = async () => {
    try {
      const data = await apiClient.getLeads({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        source: filters.source || undefined,
        search: filters.search || undefined,
      });
      setLeads(data.leads);
      setPagination({ ...pagination, total: data.pagination.total });
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await apiClient.exportLeads();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export leads:', error);
      alert('Failed to export leads');
    } finally {
      setExporting(false);
    }
  };


  const handleScoreLead = async (lead: any) => {
    try {
      const result = await apiClient.scoreLead({
        email: lead.email,
        company: lead.company,
        source: lead.source,
        notes: lead.notes,
      });
      
      // Update lead with score
      await apiClient.updateLead(lead.id, {
        score: result.score,
        tags: result.tags,
      });
      
      loadLeads();
      alert(`Lead scored: ${result.score}/100\nReasons: ${result.reasons.join(', ')}`);
    } catch (error) {
      console.error('Failed to score lead:', error);
      alert('Failed to score lead');
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      await apiClient.updateLead(leadId, { status: newStatus });
      loadLeads();
    } catch (error) {
      console.error('Failed to update lead:', error);
      alert('Failed to update lead');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await apiClient.deleteLead(id);
      loadLeads();
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead');
    }
  };

  const handleSyncLead = async (leadId: string) => {
    setSyncingLeadId(leadId);
    try {
      await apiClient.syncLead(leadId);
      alert('Lead sync initiated successfully.');
    } catch (error: any) {
      console.error('Failed to sync lead:', error);
      alert(error.response?.data?.error || 'Failed to sync lead. Check CRM configuration.');
    } finally {
      setSyncingLeadId(null);
    }
  };

  return (
    <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="contact_form">Contact Form</option>
              <option value="landing_page">Landing Page</option>
            </select>
            <button
              onClick={loadLeads}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Leads Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => {
                  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim();
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {fullName || lead.email}
                        </span>
                        {fullName && (
                          <span className="block text-xs text-gray-500">{lead.email}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.company || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.source || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.score !== null && lead.score !== undefined ? (
                          <span className={`px-2 py-1 text-xs rounded ${
                            lead.score >= 75 ? 'bg-green-100 text-green-800' :
                            lead.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {lead.score}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleScoreLead(lead)}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            Score
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                          className={`text-xs rounded px-2 py-1 border ${
                            lead.status === 'new' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            lead.status === 'converted' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleSyncLead(lead.id)}
                          disabled={syncingLeadId === lead.id}
                          className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                        >
                          {syncingLeadId === lead.id ? 'Syncing...' : 'Sync to CRM'}
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {leads.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No leads found</p>
              </div>
            )}
          </div>
        )}

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Lead Details</h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-semibold">Name:</label>
                  <p>{selectedLead.first_name} {selectedLead.last_name}</p>
                </div>
                <div>
                  <label className="font-semibold">Email:</label>
                  <p>{selectedLead.email}</p>
                </div>
                <div>
                  <label className="font-semibold">Company:</label>
                  <p>{selectedLead.company || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">Phone:</label>
                  <p>{selectedLead.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">Source:</label>
                  <p>{selectedLead.source || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">Score:</label>
                  <p>{selectedLead.score !== null ? selectedLead.score : 'Not scored'}</p>
                </div>
                <div>
                  <label className="font-semibold">Notes:</label>
                  <p className="whitespace-pre-wrap">{selectedLead.notes || 'No notes'}</p>
                </div>
                <div>
                  <label className="font-semibold">Created:</label>
                  <p>{new Date(selectedLead.created_at).toLocaleString()}</p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => handleSyncLead(selectedLead.id)}
                    disabled={syncingLeadId === selectedLead.id}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {syncingLeadId === selectedLead.id ? 'Syncing...' : 'Sync to CRM'}
                  </button>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

