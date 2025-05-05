import { useState, useEffect } from "react";
import axios from '../api/axiosInstance'; // ← use custom instance
import { Link } from 'react-router-dom';
export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", intervalInHours: "" });
    const [editId, setEditId] = useState(null);
    const [page, setPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get("/api/projects");
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`/api/projects/${editId}`, formData);
            } else {
                await axios.post("/api/projects", formData);
            }
            setModalOpen(false);
            setFormData({ name: "", intervalInHours: "" });
            setEditId(null);
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (project) => {
        setFormData({ name: project.name, intervalInHours: project.intervalInHours });
        setEditId(project._id);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this project?")) {
            await axios.delete(`/api/projects/${id}`);
            fetchProjects();
        }
    };

    const paginatedProjects = projects.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(projects.length / pageSize);

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
                <button
                    onClick={() => {
                        setModalOpen(true);
                        setFormData({ name: "", intervalInHours: "" });
                        setEditId(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Add Project
                </button>
            </div>

            {/* Table */}
            <table className="w-full text-left border mt-4">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Interval (hours)</th>
                    <th className="p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {paginatedProjects.map((project) => (
                    <tr key={project._id} className="border-t">
                        <td className="p-2">{project.name}</td>
                        <td className="p-2">{project.intervalInHours}</td>
                        <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleEdit(project)}
                                    className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 transition"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(project._id)}
                                    className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                                >
                                    🗑️ Delete
                                </button>

                                <Link
                                    to={`/projects/${project._id}/urls`}
                                    className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition"
                                >
                                    🔗 View URLs
                                </Link>

                                <Link
                                    to={`/projects/${project._id}/report`}
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

            {/* Pagination */}
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

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {editId ? "Edit Project" : "New Project"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Project Name</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border rounded p-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Interval (hours)</label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full border rounded p-2"
                                    value={formData.intervalInHours}
                                    onChange={(e) =>
                                        setFormData({ ...formData, intervalInHours: e.target.value })
                                    }
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
                                    {editId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
