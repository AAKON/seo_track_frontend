import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const baseURL = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('token');

export default function ProjectReport() {
    const { projectId } = useParams();
    const [reportData, setReportData] = useState([]);
    const [projectName, setProjectName] = useState("");

    useEffect(() => {
        axios
            .get(`${baseURL}/api/projects/${projectId}/report`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setProjectName(res.data.projectName);
                setReportData(res.data.report);
            })
            .catch(err => console.error(err));
    }, [projectId]);

    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-2">SEO Report for:</h2>
            <h3 className="text-xl text-blue-700 font-semibold mb-6">{projectName}</h3>

            {/* Bar Chart */}
            <div className="mb-10">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData}>
                        <XAxis dataKey="url" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#3182ce" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border">
                    <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                        <th className="px-4 py-2 border">#</th>
                        <th className="px-4 py-2 border">URL</th>
                        <th className="px-4 py-2 border">SEO Score</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData.map((item, index) => (
                        <tr key={item.url} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">{index + 1}</td>
                            <td className="px-4 py-2 border">{item.url}</td>
                            <td className="px-4 py-2 border font-semibold text-blue-600">{item.score}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
