import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../store/useKioskStore';
import {
  LayoutDashboard,
  FileText,
  Users,
  Monitor,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Download
} from 'lucide-react';

export function AdminDashboard() {
  const { t } = useTranslation();
  const { complaints } = useKioskStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    totalComplaints: complaints.length + 147,
    openComplaints: complaints.filter(c => c.status === 'open').length + 23,
    resolvedToday: 18,
    activeUsers: 1247,
    activeKiosks: 45,
    offlineKiosks: 3
  };

  const mockKiosks = [
    { id: 'K001', location: 'Municipal Office - Zone A', status: 'online', uptime: '99.2%' },
    { id: 'K002', location: 'District Collectorate', status: 'online', uptime: '98.7%' },
    { id: 'K003', location: 'City Hall - Main', status: 'offline', uptime: '95.4%' },
    { id: 'K004', location: 'Community Center - East', status: 'online', uptime: '99.8%' },
    { id: 'K005', location: 'Service Center - West', status: 'online', uptime: '97.3%' }
  ];

  const mockUsers = [
    { id: 'U001', name: 'Rajesh Kumar', consumerId: 'CONS123456', lastActive: '2026-01-30 10:30 AM' },
    { id: 'U002', name: 'Priya Sharma', consumerId: 'CONS234567', lastActive: '2026-01-30 09:45 AM' },
    { id: 'U003', name: 'Amit Patel', consumerId: 'CONS345678', lastActive: '2026-01-29 04:20 PM' },
    { id: 'U004', name: 'Sunita Reddy', consumerId: 'CONS456789', lastActive: '2026-01-30 11:15 AM' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Admin Header */}
      <header className="bg-[#0066CC] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">SUVIDHA Admin Dashboard</h1>
          <p className="text-sm opacity-90">Government Service Kiosk Management Portal</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'overview', icon: <LayoutDashboard className="w-4 h-4" />, label: t('overview') },
              { id: 'complaints', icon: <FileText className="w-4 h-4" />, label: t('complaintManagement') },
              { id: 'users', icon: <Users className="w-4 h-4" />, label: t('userManagement') },
              { id: 'kiosks', icon: <Monitor className="w-4 h-4" />, label: t('kioskStatus') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id
                    ? 'bg-[#0066CC] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 border-l-[#0066CC]">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-8 h-8 text-[#0066CC]" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{t('totalComplaints')}</p>
                <p className="text-3xl font-bold text-[#212529]">{stats.totalComplaints}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 border-l-[#FF9800]">
                <div className="flex items-center justify-between mb-3">
                  <AlertCircle className="w-8 h-8 text-[#FF9800]" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{t('openComplaints')}</p>
                <p className="text-3xl font-bold text-[#212529]">{stats.openComplaints}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 border-l-[#28A745]">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="w-8 h-8 text-[#28A745]" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{t('resolvedToday')}</p>
                <p className="text-3xl font-bold text-[#212529]">{stats.resolvedToday}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 border-l-[#0066CC]">
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-8 h-8 text-[#0066CC]" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{t('activeUsers')}</p>
                <p className="text-3xl font-bold text-[#212529]">{stats.activeUsers}</p>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-bold text-[#212529] mb-4">Complaint Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-400">Chart: Complaints over time</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-bold text-[#212529] mb-4">Service Distribution</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-400">Chart: Services breakdown</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search complaints..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200">
                  <Filter className="w-4 h-4" />
                  <span>{t('filter')}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#28A745] text-white rounded-lg text-sm font-semibold hover:bg-[#218838]">
                  <Download className="w-4 h-4" />
                  <span>{t('export')}</span>
                </button>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Complaint ID</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Service</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint, index) => (
                    <tr key={complaint.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-mono text-[#0066CC]">{complaint.complaintId}</td>
                      <td className="px-4 py-3 text-sm capitalize">{complaint.serviceType}</td>
                      <td className="px-4 py-3 text-sm">{complaint.description.substring(0, 40)}...</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${complaint.status === 'open' ? 'bg-orange-100 text-orange-700' :
                            complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              complaint.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">User ID</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Consumer ID</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user, index) => (
                    <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-mono text-[#0066CC]">{user.id}</td>
                      <td className="px-4 py-3 text-sm">{user.name}</td>
                      <td className="px-4 py-3 text-sm font-mono">{user.consumerId}</td>
                      <td className="px-4 py-3 text-sm">{user.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Kiosks Tab */}
        {activeTab === 'kiosks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 border-l-[#28A745]">
                <div className="flex items-center gap-4">
                  <Monitor className="w-10 h-10 text-[#28A745]" />
                  <div>
                    <p className="text-sm text-gray-600">Active Kiosks</p>
                    <p className="text-3xl font-bold text-[#212529]">{stats.activeKiosks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 border-l-4 border-l-[#DC3545]">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-10 h-10 text-[#DC3545]" />
                  <div>
                    <p className="text-sm text-gray-600">Offline Kiosks</p>
                    <p className="text-3xl font-bold text-[#212529]">{stats.offlineKiosks}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {mockKiosks.map((kiosk) => (
                <div key={kiosk.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kiosk.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        <Monitor className={`w-6 h-6 ${kiosk.status === 'online' ? 'text-[#28A745]' : 'text-[#DC3545]'
                          }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#212529]">{kiosk.id}</h3>
                        <p className="text-sm text-gray-600">{kiosk.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Uptime</p>
                        <p className="text-lg font-bold text-[#212529]">{kiosk.uptime}</p>
                      </div>

                      <div className={`px-4 py-2 rounded-lg text-sm font-bold ${kiosk.status === 'online'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {kiosk.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
