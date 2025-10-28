import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// FIX: Changed `JSX.Element` to `React.ReactElement` to resolve namespace issue.
const NavIcon: React.FC<{ path: string, icon: React.ReactElement, label: string, onClick: () => void }> = ({ path, icon, label, onClick }) => (
    <NavLink 
        to={path} 
        onClick={onClick}
        className={({ isActive }) => 
            `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-brand-primary text-white shadow-lg' 
                : 'text-medium-text hover:bg-dark-border hover:text-light-text'
            }`
        }
    >
        {icon}
        <span className="ml-4 font-medium">{label}</span>
    </NavLink>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    if (!user || location.pathname === '/login' || location.pathname === '/select-plan') {
        return <>{children}</>;
    }
    
    const navItems = [
        { path: '/', label: 'Dashboard', icon: <HomeIcon /> },
        { path: '/plan', label: 'Meu Plano', icon: <CalendarIcon /> },
        { path: '/profile', label: 'Perfil', icon: <UserIcon /> },
    ];

    if (user.email === 'admin@corrida.com') {
        navItems.push({ path: '/admin', label: 'Admin', icon: <ShieldIcon /> });
    }

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
    }

    const sidebarContent = (
         <div className="flex flex-col h-full p-4">
            <div className="flex items-center mb-8">
                <span className="text-2xl font-bold text-light-text">🏃‍♂️ Corrida App</span>
            </div>
            <nav className="flex-1">
                {navItems.map(item => <NavIcon key={item.path} {...item} onClick={() => setIsMobileMenuOpen(false)} />)}
            </nav>
            <div className="mt-auto">
                <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full p-3 rounded-lg text-medium-text hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
                >
                    <LogoutIcon />
                    <span className="ml-4 font-medium">Sair</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-dark-bg text-light-text">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 bg-dark-card border-r border-dark-border">
                {sidebarContent}
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                 {/* Mobile Header */}
                <header className="lg:hidden flex justify-between items-center p-4 bg-dark-card border-b border-dark-border">
                    <span className="text-xl font-bold text-light-text">🏃‍♂️ Corrida App</span>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed top-0 left-0 w-full h-full bg-dark-card z-50 pt-16">
                        {sidebarContent}
                    </div>
                )}
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};


// SVG Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l.004.004a11.994 11.994 0 0017.992 0l.004-.004A12.02 12.02 0 0021 7.944a11.955 11.955 0 01-2.382-3.016z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;


export default Layout;
