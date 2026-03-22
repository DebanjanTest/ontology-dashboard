import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardLayout({ children, activeNav, activePage }) {
    const { theme: t } = useTheme();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on navigation on mobile
    useEffect(() => {
        if (isMobile) {
            setIsMobileSidebarOpen(false);
        }
    }, [activePage, isMobile]);

    return (
        <div className="dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: t.bg }}>
            {/* Top Bar handles global navigation and branding */}
            <TopBar activeNav={activeNav} toggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} isMobileMenuOpen={isMobileSidebarOpen} />
            
            <div className="main-content" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                
                {/* Desktop Sidebar OR Mobile Slide-Out Drawer */}
                <AnimatePresence>
                    {(!isMobile || isMobileSidebarOpen) && (
                        <>
                            {/* Mobile Backdrop */}
                            {isMobile && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    style={{
                                        position: 'fixed', inset: 0, zIndex: 40,
                                        background: 'rgba(10, 14, 26, 0.4)', backdropFilter: 'blur(4px)'
                                    }}
                                />
                            )}
                            
                            {/* The Sidebar Itself */}
                            <motion.div 
                                initial={isMobile ? { x: '-100%' } : { x: 0 }}
                                animate={{ x: 0 }}
                                exit={isMobile ? { x: '-100%' } : { x: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                style={{
                                    ...(isMobile ? { position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, height: '100%', borderRight: `1px solid ${t.border}` } : {})
                                }}
                            >
                                <Sidebar activePage={activePage} className={isMobile ? 'mobile-drawer-mode' : ''} />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content Area - Slick Page Transitions */}
                <div className="dashboard-body" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activePage}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
