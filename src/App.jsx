import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useState } from 'react'
import Settings from "./pages/Settings"
import Analytics from "./pages/Analytics"
import Home from "./pages/Home"
import Projects from "./pages/Projects.jsx"
import Urls from "./pages/Urls.jsx"
import ProjectReport from "./pages/ProjectReport.jsx";
import UrlReport from "./pages/UrlReport.jsx";
import LogsPage from "./pages/LogsPage.jsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return Boolean(localStorage.getItem('token'))
    })

    return (
        <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

            <Route
                path="/*"
                element={
                    isAuthenticated ? (
                        <Dashboard setIsAuthenticated={setIsAuthenticated} />
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            >
                <Route index element={<Home />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:projectId/urls" element={<Urls />} />
                <Route path="projects/:projectId/report" element={<ProjectReport />} />
                <Route path="urls/:urlId/report" element={<UrlReport />} />
                <Route path="logs" element={<LogsPage />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
    )
}

export default App
