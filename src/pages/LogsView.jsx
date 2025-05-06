import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFilter, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function LogsView() {
    const { projectId, urlId } = useParams();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        minScore: '',
        maxScore: '',
        startDate: null,
        endDate: null,
        page: 1,
        limit: 10
    });
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                let endpoint = '/api/logs/';
                if (urlId) endpoint += `url/${urlId}`;
                else if (projectId) endpoint += `project/${projectId}`;

                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);
                if (filters.minScore) params.append('minScore', filters.minScore);
                if (filters.maxScore) params.append('maxScore', filters.maxScore);
                if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
                if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
                params.append('page', filters.page);
                params.append('limit', filters.limit);

                const res = await axios.get(`${endpoint}?${params.toString()}`);
                setLogs(res.data.docs || res.data);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                console.error('Error fetching logs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [filters, projectId, urlId]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleDateChange = (date, field) => {
        setFilters(prev => ({ ...prev, [field]: date, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            minScore: '',
            maxScore: '',
            startDate: null,
            endDate: null,
            page: 1,
            limit: 10
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link
                        to={projectId ? `/projects/${projectId}` : '/projects'}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
                    >
                        <FiArrowLeft className="mr-2" />
                        {urlId ? 'Back to URL Details' : 'Back to Project'}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {urlId ? 'URL Inspection History' : 'Project SEO Reports'}
                    </h1>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                    <FiFilter className="mr-2" /> Filters
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">All Statuses</option>
                                <option value="success">Success</option>
                                <option value="error">Error</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Score Range</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    name="minScore"
                                    placeholder="Min"
                                    min="0"
                                    max="100"
                                    value={filters.minScore}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border rounded"
                                />
                                <input
                                    type="number"
                                    name="maxScore"
                                    placeholder="Max"
                                    min="0"
                                    max="100"
                                    value={filters.maxScore}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Date Range</label>
                            <div className="flex space-x-2">
                                <DatePicker
                                    selected={filters.startDate}
                                    onChange={(date) => handleDateChange(date, 'startDate')}
                                    selectsStart
                                    startDate={filters.startDate}
                                    endDate={filters.endDate}
                                    placeholderText="Start Date"
                                    className="w-full p-2 border rounded"
                                />
                                <DatePicker
                                    selected={filters.endDate}
                                    onChange={(date) => handleDateChange(date, 'endDate')}
                                    selectsEnd
                                    startDate={filters.startDate}
                                    endDate={filters.endDate}
                                    minDate={filters.startDate}
                                    placeholderText="End Date"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Logs Table */}
            {!loading && logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No logs found matching your criteria
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                URL
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Issues
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                                    {log.url || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FiBarChart2 className="mr-2" />
                                        {log.seoScore || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {log.issuesCount || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        to={`/logs/${log._id}/details`}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Details
                                    </Link>
                                    {!urlId && (
                                        <Link
                                            to={`/projects/${log.projectId}/urls/${log.urlId}`}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            View URL
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="inline-flex rounded-md shadow">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={filters.page === 1}
                            className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (filters.page <= 3) {
                                pageNum = i + 1;
                            } else if (filters.page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = filters.page - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                                    className={`px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium ${
                                        filters.page === pageNum
                                            ? 'bg-blue-50 text-blue-600 border-blue-500'
                                            : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={filters.page === totalPages}
                            className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}