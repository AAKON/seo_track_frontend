import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { FiFilter, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingUrls, setLoadingUrls] = useState(false);
    const [filters, setFilters] = useState({
        projectId: '',
        urlId: '',
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

    // Fetch projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get('/api/projects');
                setProjects(res.data);
            } catch (err) {
                console.error('Error fetching projects:', err);
            }
        };
        fetchProjects();
    }, []);

    // Fetch URLs when project is selected
    useEffect(() => {
        const fetchUrlsByProject = async () => {
            if (!filters.projectId) {
                setUrls([]);
                setFilters(prev => ({ ...prev, urlId: '' }));
                return;
            }

            try {
                setLoadingUrls(true);
                const res = await axios.get(`/api/urls/project/${filters.projectId}`);
                setUrls(res.data);
                // Reset URL filter when project changes
                setFilters(prev => ({ ...prev, urlId: '' }));
            } catch (err) {
                console.error('Error fetching URLs:', err);
            } finally {
                setLoadingUrls(false);
            }
        };

        fetchUrlsByProject();
    }, [filters.projectId]);

    // Fetch logs based on filters
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();

                Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== '') {
                        params.append(key, value);
                    }
                });

                const res = await axios.get(`/api/logs?${params.toString()}`);
                setLogs(res.data.docs || res.data);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                console.error('Error fetching logs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleDateChange = (date, field) => {
        setFilters(prev => ({ ...prev, [field]: date, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            projectId: '',
            urlId: '',
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
        <div className="ml-64 p-6"> {/* ml-64 to account for sidebar */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">SEO Logs</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                    {showFilters ? <FiChevronUp className="mr-2" /> : <FiChevronDown className="mr-2" />}
                    Filters
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Project</label>
                            <select
                                name="projectId"
                                value={filters.projectId}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">All Projects</option>
                                {projects.map(project => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* URL Filter - Now dynamically loaded */}
                        <div>
                            <label className="block text-sm font-medium mb-1">URL</label>
                            <select
                                name="urlId"
                                value={filters.urlId}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                                disabled={!filters.projectId || loadingUrls}
                            >
                                <option value="">All URLs</option>
                                {loadingUrls ? (
                                    <option disabled>Loading URLs...</option>
                                ) : (
                                    urls.map(url => (
                                        <option key={url._id} value={url._id}>
                                            {url.url}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Status Filter */}
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

                        {/* Score Range */}
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

                        {/* Date Range */}
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
                    <div className="flex justify-end mt-4 space-x-2">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Logs Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No logs found matching your criteria
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Project
                                </th>
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
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map(log => {
                                const project = projects.find(p => p._id === log.projectId._id);
                                const url = urls.find(u => u._id === log.urlId._id);

                                return (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {project ? (
                                                <Link
                                                    to={`/projects/${project._id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {project.name}
                                                </Link>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                                            {url ? (
                                                <a
                                                    href={url.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {url.url}
                                                </a>
                                            ) : 'N/A'}
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
                                            {log.score || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/logs/${log._id}/details`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-6 py-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                Page {filters.page} of {totalPages}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={filters.page === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={filters.page === totalPages}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}