import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { FiFilter, FiCalendar, FiChevronDown, FiChevronUp, FiExternalLink, FiX, FiCheck } from 'react-icons/fi';
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

    const StatusBadge = ({ status }) => {
        const statusMap = {
            success: { color: 'green', text: 'Success' },
            error: { color: 'red', text: 'Error' },
            pending: { color: 'yellow', text: 'Pending' }
        };

        const { color, text } = statusMap[status] || { color: 'gray', text: 'Unknown' };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                {text}
            </span>
        );
    };

    const ScoreIndicator = ({ score }) => {
        const getColor = (score) => {
            if (score >= 80) return 'green';
            if (score >= 50) return 'yellow';
            return 'red';
        };

        const color = getColor(score);

        return (
            <div className="flex items-center">
                <div className="w-16 mr-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-${color}-500`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>
                <span className={`font-medium text-${color}-600`}>{score}</span>
            </div>
        );
    };

    const MetaInfoCell = ({ text, length, recommended }) => {
        const status = recommended ? 'success' : text ? 'warning' : 'error';
        const statusColors = {
            success: 'green',
            warning: 'yellow',
            error: 'red'
        };

        return (
            <div className="flex items-center">
                <div className={`flex-shrink-0 h-3 w-3 rounded-full mr-2 bg-${statusColors[status]}-400`} />
                <div className="truncate max-w-xs">
                    {text || 'Not found'}
                    {text && (
                        <span className="ml-1 text-xs text-gray-500">({length} chars)</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">SEO Audit Logs</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Track and analyze your website SEO performance over time
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        {showFilters ? (
                            <>
                                <FiChevronUp className="-ml-1 mr-2 h-5 w-5" />
                                Hide Filters
                            </>
                        ) : (
                            <>
                                <FiFilter className="-ml-1 mr-2 h-5 w-5" />
                                Show Filters
                            </>
                        )}
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Project Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                <select
                                    name="projectId"
                                    value={filters.projectId}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">All Projects</option>
                                    {projects.map(project => (
                                        <option key={project._id} value={project._id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* URL Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                <select
                                    name="urlId"
                                    value={filters.urlId}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    disabled={!filters.projectId || loadingUrls}
                                >
                                    <option value="">All URLs</option>
                                    {loadingUrls ? (
                                        <option disabled>Loading URLs...</option>
                                    ) : (
                                        urls.map(url => (
                                            <option key={url._id} value={url._id}>
                                                {url.url.replace(/^https?:\/\//, '')}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="success">Success</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>

                            {/* Score Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score Range</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        name="minScore"
                                        placeholder="Min"
                                        min="0"
                                        max="100"
                                        value={filters.minScore}
                                        onChange={handleFilterChange}
                                        className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                    />
                                    <input
                                        type="number"
                                        name="maxScore"
                                        placeholder="Max"
                                        min="0"
                                        max="100"
                                        value={filters.maxScore}
                                        onChange={handleFilterChange}
                                        className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                                <div className="flex space-x-2">
                                    <DatePicker
                                        selected={filters.startDate}
                                        onChange={(date) => handleDateChange(date, 'startDate')}
                                        selectsStart
                                        startDate={filters.startDate}
                                        endDate={filters.endDate}
                                        placeholderText="Start Date"
                                        className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                    />
                                    <DatePicker
                                        selected={filters.endDate}
                                        onChange={(date) => handleDateChange(date, 'endDate')}
                                        selectsEnd
                                        startDate={filters.startDate}
                                        endDate={filters.endDate}
                                        minDate={filters.startDate}
                                        placeholderText="End Date"
                                        className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Logs Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Project / URL
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Audit Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Meta Tags
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Technical SEO
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => {
                                    const project = projects.find((p) => p._id === log.projectId._id);
                                    const url = urls.find((u) => u._id === log.urlId._id);

                                    return (
                                        <tr key={log._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {project?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            <a
                                                                href={url?.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                                            >
                                                                {url?.url.replace(/^https?:\/\//, '')}
                                                                <FiExternalLink className="ml-1 h-3 w-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={log.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <ScoreIndicator score={log.seoScore} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <div className="text-xs font-medium text-gray-500">Title</div>
                                                    <MetaInfoCell
                                                        text={log.meta?.title?.text}
                                                        length={log.meta?.title?.length}
                                                        recommended={log.meta?.title?.recommended}
                                                    />

                                                    <div className="text-xs font-medium text-gray-500 mt-2">Description</div>
                                                    <MetaInfoCell
                                                        text={log.meta?.description?.text}
                                                        length={log.meta?.description?.length}
                                                        recommended={log.meta?.description?.recommended}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-2">H1:</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            log.headingStructure?.h1Count === 1 ? 'bg-green-100 text-green-800' :
                                                                log.headingStructure?.h1Count > 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                                {log.headingStructure?.h1Count || 0}
                                                            </span>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-2">H2:</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            log.headingStructure?.h2Count >= 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                                {log.headingStructure?.h2Count || 0}
                                                            </span>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-2">Sitemap:</span>
                                                        {log.sitemap?.exists ? (
                                                            <FiCheck className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <FiX className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-2">Robots.txt:</span>
                                                        {log.robotsTxt?.exists ? (
                                                            <FiCheck className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <FiX className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Previous
                            </button>
                            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(filters.page * filters.limit, logs.length)}</span> of{' '}
                                    <span className="font-medium">{logs.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={filters.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
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
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    filters.page === pageNum
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    {totalPages > 5 && filters.page < totalPages - 2 && (
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            ...
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                                        disabled={filters.page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}