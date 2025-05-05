import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function LogDetailsView() {
    const { logId } = useParams();
    const navigate = useNavigate();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const res = await axios.get(`/api/logs/${logId}`);
                setLog(res.data);
            } catch (err) {
                console.error('Error fetching log:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLog();
    }, [logId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!log) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-red-500 mb-4">Log not found</div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline"
                >
                    ← Back to logs
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <FiArrowLeft className="mr-2" /> Back to logs
                </button>
                <h1 className="text-2xl font-bold text-gray-800">SEO Report Details</h1>
                <div className="text-gray-600 mt-2">
                    <a href={log.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {log.url}
                    </a>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()} •
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
            {log.status}
          </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('issues')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'issues'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Issues ({log.issuesCount || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'details'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Technical Details
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-800">SEO Score</h3>
                            <p className="text-3xl font-bold text-blue-600">
                                {log.score || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-800">Page Load Time</h3>
                            <p className="text-3xl font-bold text-green-600">
                                {log.loadTime ? `${log.loadTime}ms` : 'N/A'}
                            </p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-medium text-purple-800">Links Found</h3>
                            <p className="text-3xl font-bold text-purple-600">
                                {log.links?.total || 0}
                            </p>
                            <p className="text-sm text-purple-700 mt-1">
                                {log.links?.internal || 0} internal / {log.links?.external || 0} external
                            </p>
                        </div>

                        <div className="md:col-span-3 bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Meta Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600">Title</h4>
                                    <p className="mt-1 p-2 bg-white rounded border">
                                        {log.meta?.title || 'Not found'}
                                    </p>
                                    {log.meta?.title && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Length: {log.meta.title.length} characters
                                            {log.meta.title.length > 60 && (
                                                <span className="text-yellow-600 ml-2">(Too long)</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600">Description</h4>
                                    <p className="mt-1 p-2 bg-white rounded border">
                                        {log.meta?.description || 'Not found'}
                                    </p>
                                    {log.meta?.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Length: {log.meta.description.length} characters
                                            {log.meta.description.length > 160 && (
                                                <span className="text-yellow-600 ml-2">(Too long)</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div>
                        {log.issues?.length > 0 ? (
                            <div className="space-y-3">
                                {log.issues.map((issue, index) => (
                                    <div key={index} className={`p-4 rounded-lg ${
                                        issue.type === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
                                    }`}>
                                        <div className="flex justify-between">
                                            <h3 className={`font-medium ${
                                                issue.type === 'critical' ? 'text-red-700' : 'text-yellow-700'
                                            }`}>
                                                {issue.message}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                issue.type === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                        {issue.type}
                      </span>
                                        </div>
                                        {issue.context && (
                                            <div className="mt-2 text-sm text-gray-700">
                                                {issue.context}
                                            </div>
                                        )}
                                        {issue.selector && (
                                            <div className="mt-2">
                                                <code className="text-xs bg-gray-100 p-1 rounded">
                                                    {issue.selector}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No issues found in this scan
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">Headings Structure</h3>
                            {log.headings?.length > 0 ? (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <ul className="space-y-2">
                                        {log.headings.map((heading, index) => (
                                            <li key={index} className="flex items-start">
                        <span className={`inline-block px-2 py-1 rounded text-xs mr-2 ${
                            heading.tag === 'h1' ? 'bg-blue-100 text-blue-800' :
                                heading.tag === 'h2' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                          {heading.tag}
                        </span>
                                                <span className="truncate">{heading.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-gray-500">No headings found</div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">Images Analysis</h3>
                            {log.images?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border">
                                        <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-2 px-4 border">Image</th>
                                            <th className="py-2 px-4 border">Alt Text</th>
                                            <th className="py-2 px-4 border">Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {log.images.map((image, index) => (
                                            <tr key={index} className="border-t">
                                                <td className="py-2 px-4 border max-w-xs truncate">
                                                    {image.src}
                                                </td>
                                                <td className="py-2 px-4 border">
                                                    {image.alt || <span className="text-red-500">Missing</span>}
                                                </td>
                                                <td className="py-2 px-4 border">
                                                    {image.alt ? (
                                                        <span className="text-green-500">✓</span>
                                                    ) : (
                                                        <span className="text-red-500">✕</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-gray-500">No images found</div>
                            )}
                        </div>

                        {log.error && (
                            <div className="bg-red-50 p-4 rounded-lg">
                                <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
                                <pre className="text-sm text-red-700 whitespace-pre-wrap">{log.error}</pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}