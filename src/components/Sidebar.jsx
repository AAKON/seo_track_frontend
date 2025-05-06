import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation()

    const isActive = (path) => {
        if (path === '') return location.pathname === '/'
        return location.pathname.startsWith(`/${path}`)
    }

    const menuItems = [
        { path: '', label: 'Home', icon: '🏠' },
        { path: 'projects', label: 'Projects', icon: '📊' },
        { path: 'logs', label: 'Logs', icon: '📊' }
    ]

    return (
        <div
            className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen
      `}
        >
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700 md:hidden">
                <h3 className="text-xl font-semibold">Dashboard</h3>
                <button onClick={onClose}>
                    <X className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="p-4 border-b border-gray-700 hidden md:block">
                <h3 className="text-xl font-semibold">Dashboard</h3>
            </div>

            <ul className="p-2">
                {menuItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            to={`/${item.path}`}
                            className={`flex items-center p-3 rounded-lg mb-1 ${isActive(item.path) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                            onClick={onClose} // close sidebar on mobile nav
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
