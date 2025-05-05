import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import UrlModal from "../components/UrlModal"; // You'll create this next

export default function Urls() {
    const { projectId } = useParams();
    const [urls, setUrls] = useState([]);
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUrls = async () => {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/urls/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUrls(res.data);
        };
        fetchUrls();
    }, [projectId]);

    const openModal = (url) => {
        setSelectedUrl(url);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUrl(null);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Project URLs</h1>
            <table className="w-full bg-white rounded shadow overflow-hidden">
                <thead className="bg-gray-100 text-left">
                <tr>
                    <th className="p-3">URL</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                {urls.map(url => (
                    <tr key={url._id} className="border-t">
                        <td className="p-3">{url.url}</td>
                        <td className="p-3">{url.seoReport?.score ?? "N/A"}</td>
                        <td className="p-3 space-x-2">
                            <button
                                onClick={() => openModal(url)}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Details
                            </button>
                            {/* Edit/Delete buttons here if needed */}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {isModalOpen && (
                <UrlModal url={selectedUrl} onClose={closeModal} />
            )}
        </div>
    );
}
