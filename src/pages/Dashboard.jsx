import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { Menu } from 'lucide-react'

export default function Dashboard({ setIsAuthenticated }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleLogout = () => {
        setIsAuthenticated(false)
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev)
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

            {/* Main content */}
            <div className="flex-1 flex flex-col w-full">
                <Navbar onLogout={handleLogout} onToggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
