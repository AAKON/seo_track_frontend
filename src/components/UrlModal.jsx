export default function UrlModal({ url, onClose }) {
    if (!url) return null;

    const report = url.seoReport || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h2 className="text-xl font-semibold mb-4">SEO Details</h2>
                <div className="space-y-2">
                    <p><strong>URL:</strong> {url.url}</p>
                    <p><strong>Score:</strong> {report.score ?? "N/A"}</p>
                    <p><strong>Title:</strong> {report.title || "Not found"}</p>
                    <p><strong>Meta Description:</strong> {report.metaDescription || "Not found"}</p>
                    <p><strong>H1 Tags:</strong> {report.h1Count}</p>
                    <p><strong>Images without Alt:</strong> {report.imageWithoutAlt}</p>
                    <p><strong>Links:</strong> {report.linkCount}</p>
                    <p><strong>Last Checked:</strong> {new Date(url.lastCheckedAt).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
