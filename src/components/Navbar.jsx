import { Menu } from 'lucide-react'

export default function Navbar({ onLogout, onToggleSidebar }) {
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left side: Sidebar toggle (mobile only) */}
                <button
                    className="md:hidden text-gray-700"
                    onClick={onToggleSidebar}
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Right side: Logout button */}
                <div className="ml-auto">
                    <button
                        onClick={onLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}
