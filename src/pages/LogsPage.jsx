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
        <div className="">
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
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        Project
                                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                                        </svg>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        Meta Title
                                        <span className="ml-1 text-gray-400 text-xs">(60 chars)</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        Meta Description
                                        <span className="ml-1 text-gray-400 text-xs">(160 chars)</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Headings</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sitemap</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Robots</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => {
                                const project = projects.find((p) => p._id === log.projectId._id);
                                const url = urls.find((u) => u._id === log.urlId._id);

                                const titleStatus = log.meta?.title?.recommended ? 'success' : log.meta?.title?.text ? 'warning' : 'error';
                                const descStatus = log.meta?.description?.recommended ? 'success' : log.meta?.description?.text ? 'warning' : 'error';
                                const h1Status = log.headingStructure?.h1Count === 1 ? 'success' : log.headingStructure?.h1Count > 1 ? 'warning' : 'error';
                                const h2Status = log.headingStructure?.h2Count >= 1 ? 'success' : 'warning';

                                return (
                                    <tr key={log._id} className="hover:bg-blue-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div
                                                    className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg className="h-6 w-6 text-blue-600" fill="none"
                                                         viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {project ? project.name : 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {project ? `${project.urls?.length || 0} URLs` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                                <a href={url?.url} target="_blank" rel="noopener noreferrer"
                                                   className="flex items-center">
                                                    {url?.url.replace(/^https?:\/\//, '')}
                                                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24"
                                                         stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                                    </svg>
                                                </a>
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
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                        log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                }`}>
                  {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="relative w-16 mr-2">
                                                    <div
                                                        className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                                                        <div
                                                            style={{width: `${log.seoScore}%`}}
                                                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                                                log.seoScore >= 80 ? 'bg-green-500' :
                                                                    log.seoScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span className={`font-bold ${
                                                    log.seoScore >= 80 ? 'text-green-600' :
                                                        log.seoScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                    {log.seoScore}
                  </span>
                                            </div>
                                        </td>

                                        {/* Meta Title */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-4 w-4 rounded-full mr-2 ${
                                                    titleStatus === 'success' ? 'bg-green-400' :
                                                        titleStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                                                }`}></div>
                                                <div className="text-sm text-gray-900 truncate max-w-xs"
                                                     title={log.meta?.title?.text}>
                                                    {log.meta?.title?.text || 'Not found'}
                                                    {log.meta?.title?.text && (
                                                        <span
                                                            className="text-xs text-gray-500 ml-1">({log.meta.title.length} chars)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Meta Description */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-4 w-4 rounded-full mr-2 ${
                                                    descStatus === 'success' ? 'bg-green-400' :
                                                        descStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                                                }`}></div>
                                                <div className="text-sm text-gray-900 truncate max-w-xs"
                                                     title={log.meta?.description?.text}>
                                                    {log.meta?.description?.text || 'Not found'}
                                                    {log.meta?.description?.text && (
                                                        <span
                                                            className="text-xs text-gray-500 ml-1">({log.meta.description.length} chars)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Headings */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                      h1Status === 'success' ? 'bg-green-100 text-green-800' :
                          h1Status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    H1: {log.headingStructure?.h1Count || 0}
                  </span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    h2Status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                    H2: {log.headingStructure?.h2Count || 0}
                  </span>
                                            </div>
                                        </td>

                                        {/* Sitemap */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {log.sitemap?.exists ? (
                                                    <>
                                                        <svg className="h-5 w-5 text-green-500" fill="none"
                                                             viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                        </svg>
                                                        <span className="ml-1 text-sm text-gray-900">Valid</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="h-5 w-5 text-red-500" fill="none"
                                                             viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                        </svg>
                                                        <span className="ml-1 text-sm text-gray-900">Missing</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        {/* Robots.txt */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {log.robotsTxt?.exists ? (
                                                    <>
                                                        <svg className="h-5 w-5 text-green-500" fill="none"
                                                             viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                        </svg>
                                                        <span className="ml-1 text-sm text-gray-900">Found</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="h-5 w-5 text-red-500" fill="none"
                                                             viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                        </svg>
                                                        <span className="ml-1 text-sm text-gray-900">Missing</span>
                                                    </>
                                                )}
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
                                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                                    <span className="font-medium">20</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button aria-current="page" className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                        1
                                    </button>
                                    <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                        2
                                    </button>
                                    <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                        3
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            ...
          </span>
                                    <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                        8
                                    </button>
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
}