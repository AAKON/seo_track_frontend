import { useState, useEffect } from "react";
import axios from '../api/axiosInstance';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function Urls() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [urls, setUrls] = useState([]);
    const [project, setProject] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ url: "" });
    const [editId, setEditId] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const pageSize = 5;

    useEffect(() => {
        fetchProject();
        fetchUrls();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const res = await axios.get(`/api/projects/${projectId}`);
            setProject(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUrls = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/urls/project/${projectId}`);
            setUrls(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`/api/urls/${editId}`, formData);
            } else {
                await axios.post("/api/urls", { ...formData, projectId });
            }
            setModalOpen(false);
            setFormData({ url: "" });
            setEditId(null);
            fetchUrls();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (url) => {
        setFormData({ url: url.url });
        setEditId(url._id);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this URL?")) {
            await axios.delete(`/api/urls/${id}`);
            fetchUrls();
        }
    };

    const handleRunReport = async (urlId) => {
        try {
            await axios.put(`/api/urls/${urlId}`, { url: urls.find(u => u._id === urlId).url });
            fetchUrls();
        } catch (err) {
            console.error(err);
        }
    };

    const paginatedUrls = urls.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(urls.length / pageSize);

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">URLs</h1>
                    {project && (
                        <p className="text-gray-600">
                            Project: {project.name} (Check every {project.intervalInHours} hours)
                        </p>
                    )}
                </div>
                <button
                    onClick={() => {
                        setModalOpen(true);
                        setFormData({ url: "" });
                        setEditId(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Add URL
                </button>
            </div>

            {/* Table */}
            <table className="w-full text-left border mt-4">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2">URL</th>
                    <th className="p-2">Last Checked</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {paginatedUrls.map((url) => (
                    <tr key={url._id} className="border-t">
                        <td className="p-2 max-w-xs truncate" title={url.url}>
                            {url.url}
                        </td>
                        <td className="p-2">
                            {new Date(url.lastCheckedAt).toLocaleString()}
                        </td>
                        <td className="p-2">
                            {url.seoReport?.status ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                        OK
                                    </span>
                            ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                        Error
                                    </span>
                            )}
                        </td>
                        <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleEdit(url)}
                                    className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 transition"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(url._id)}
                                    className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                                >
                                    🗑️ Delete
                                </button>

                                <button
                                    onClick={() => handleRunReport(url._id)}
                                    className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700 transition"
                                >
                                    🔄 Run Report
                                </button>

                                <Link
                                    to={`/urls/${url._id}/report`}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    View Report
                                </Link>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Empty state */}
            {urls.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No URLs found for this project. Add one to get started.
                </div>
            )}

            {/* Pagination */}
            {urls.length > 0 && (
                <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-blue-600 text-white' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Back button */}
            <div className="mt-4">
                <button
                    onClick={() => navigate('/projects')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Projects
                </button>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {editId ? "Edit URL" : "Add New URL"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">URL</label>
                                <input
                                    type="url"
                                    className="mt-1 block w-full border rounded p-2"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editId ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}