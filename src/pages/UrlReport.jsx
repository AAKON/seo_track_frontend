import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function UrlReport() {
    const { urlId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/urls/report/${urlId}`);

                if (!response.data) {
                    throw new Error('No data received from server');
                }

                setReport({
                    ...response.data,
                    lastCheckedAt: response.data.lastCheckedAt || new Date().toISOString(),
                    seoScore: response.data.seoScore ?? null,
                    issuesCount: response.data.issues?.length ?? 0
                });
            } catch (err) {
                console.error('Error fetching report:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load report');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [urlId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading report...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error loading report</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">No report data available</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>We couldn't find any report data for this URL.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to URLs
                </button>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">SEO Report</h1>
                        <div className="mt-2">
                            <a
                                href={report.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                            >
                                {report.url}
                            </a>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            Last checked: {new Date(report.lastCheckedAt).toLocaleString()}
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            report.status === 'success' ? 'bg-green-100 text-green-800' :
                                report.status === 'error' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                        }`}>
                            {report.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-blue-800">SEO Score</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                    {report.seoScore !== null ? report.seoScore : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 p-2 rounded-md">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-green-800">Issues Found</h3>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {report.issuesCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 p-2 rounded-md">
                                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-purple-800">Page Load Time</h3>
                                <p className="text-3xl font-bold text-purple-600 mt-1">
                                    {report.loadTime ? `${report.loadTime}ms` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="space-y-8">
                    {/* Meta Information */}
                    {/* Meta Information */}
                    <section className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Meta Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-600 mb-2">Title</h3>
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    {report.meta?.title?.text ? (
                                        <>
                                            <p className="break-words">{report.meta.title.text}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Length: {report.meta.title.length} characters
                                                {report.meta.title.length > 60 && (
                                                    <span className="text-yellow-600 ml-2">(Recommended: ≤60)</span>
                                                )}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-red-500">Not found</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-600 mb-2">Description</h3>
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    {report.meta?.description?.text ? (
                                        <>
                                            <p className="break-words">{report.meta.description.text}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Length: {report.meta.description.length} characters
                                                {report.meta.description.length > 160 && (
                                                    <span className="text-yellow-600 ml-2">(Recommended: ≤160)</span>
                                                )}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-red-500">Not found</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Headings Structure */}
                    <section className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Headings Structure</h2>
                        {report.headings?.length > 0 ? (
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {report.headings.map((heading, index) => (
                                        <div key={index} className="flex items-start">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                heading.tag === 'h1' ? 'bg-blue-100 text-blue-800' :
                                                    heading.tag === 'h2' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                                {heading.tag.toUpperCase()}
                                            </span>
                                            <span className="ml-2 break-words">{heading.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-4 rounded border border-gray-200 text-gray-500">
                                No headings found
                            </div>
                        )}
                    </section>

                    {/* Images Analysis */}
                    <section className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Images Analysis</h2>
                        <div className="overflow-x-auto">
                            {report.images?.length > 0 ? (
                                <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Image URL</th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Alt Text</th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {report.images.map((image, index) => (
                                        <tr key={index}>
                                            <td className="py-3 px-4 text-sm text-gray-800 break-all max-w-xs">
                                                {image.src}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {image.alt ? (
                                                    <span className="text-green-600">{image.alt}</span>
                                                ) : (
                                                    <span className="text-red-500">Missing</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {image.alt ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            ✓ Valid
                                                        </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            ✕ Missing
                                                        </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="bg-white p-4 rounded border border-gray-200 text-gray-500">
                                    No images found
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Issues List */}
                    {report.issues?.length > 0 && (
                        <section className="bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">
                                Detected Issues ({report.issues.length})
                            </h2>
                            <div className="space-y-3">
                                {report.issues.map((issue, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg ${
                                            issue.type === 'critical' ? 'bg-red-50 border-l-4 border-red-500' :
                                                issue.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                                                    'bg-blue-50 border-l-4 border-blue-500'
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                {issue.type === 'critical' ? (
                                                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                ) : issue.type === 'warning' ? (
                                                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium">
                                                    {issue.type === 'critical' ? 'Critical: ' :
                                                        issue.type === 'warning' ? 'Warning: ' : 'Notice: '}
                                                    {issue.message}
                                                </h3>
                                                {issue.context && (
                                                    <div className="mt-1 text-sm text-gray-600">
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}