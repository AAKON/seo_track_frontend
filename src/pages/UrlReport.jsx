import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useParams, Link } from 'react-router-dom';

export default function UrlReport() {
    const { urlId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`/api/urls/report/${urlId}`);
                setReport(response.data);
            } catch (err) {
                console.error('Error fetching report:', err);
                setError('Failed to load report');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [urlId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-red-500 mb-4">{error}</div>
                <Link to="/projects" className="text-blue-600 hover:underline">
                    Back to Projects
                </Link>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-500 mb-4">No report data available</div>
                <Link to="/projects" className="text-blue-600 hover:underline">
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
                <Link
                    to={`/projects/${report.projectId}/urls`}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                     Back to URLs
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">SEO Report</h1>
                <div className="text-gray-600 mt-2">
                    <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {report.url}
                    </a>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                    Last checked: {new Date(report.lastCheckedAt).toLocaleString()}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800">SEO Score</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {report.seoScore || 'N/A'}
                    </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800">Issues Found</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {report.issuesCount || 0}
                    </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-800">Page Load Time</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        {report.loadTime ? `${report.loadTime}ms` : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-8">
                {/* Meta Information */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                        Meta Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-600">Title</h3>
                            <p className="mt-1 p-2 bg-gray-50 rounded">
                                {report.meta?.title || 'Not found'}
                            </p>
                            {report.meta?.title && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Length: {report.meta.title.length} characters
                                    {report.meta.title.length > 60 && (
                                        <span className="text-yellow-600 ml-2">(Too long)</span>
                                    )}
                                </p>
                            )}
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-600">Description</h3>
                            <p className="mt-1 p-2 bg-gray-50 rounded">
                                {report.meta?.description || 'Not found'}
                            </p>
                            {report.meta?.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Length: {report.meta.description.length} characters
                                    {report.meta.description.length > 160 && (
                                        <span className="text-yellow-600 ml-2">(Too long)</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Headings Structure */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                        Headings Structure
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        {report.headings?.length > 0 ? (
                            <ul className="space-y-2">
                                {report.headings.map((heading, index) => (
                                    <li key={index} className="flex items-start">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                      {heading.tag}
                    </span>
                                        <span>{heading.text}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No headings found</p>
                        )}
                    </div>
                </section>

                {/* Images Analysis */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                        Images Analysis
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border">Image</th>
                                <th className="py-2 px-4 border">Alt Text</th>
                                <th className="py-2 px-4 border">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {report.images?.length > 0 ? (
                                report.images.map((image, index) => (
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-4 text-center text-gray-500">
                                        No images found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Issues List */}
                {report.issues?.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                            Detected Issues ({report.issues.length})
                        </h2>
                        <div className="space-y-3">
                            {report.issues.map((issue, index) => (
                                <div key={index} className="p-3 bg-red-50 rounded-lg">
                                    <div className="font-medium text-red-700">{issue.message}</div>
                                    {issue.context && (
                                        <div className="mt-1 text-sm text-gray-600">
                                            Context: {issue.context}
                                        </div>
                                    )}
                                    {issue.selector && (
                                        <div className="mt-1 text-xs font-mono bg-gray-100 p-1 rounded">
                                            {issue.selector}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}