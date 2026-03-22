import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
    light: {
        name: 'light',
        bg: '#f4f6f8',
        bgCard: '#ffffff',
        bgInput: '#f9fafb',
        bgSidebar: '#ffffff',
        bgTopbar: '#ffffff',
        bgHover: '#f8fafc',
        border: '#e5e7eb',
        borderLight: '#f1f5f9',
        text: '#0f172a',
        textSecondary: '#334155',
        textMuted: '#64748b',
        textFaint: '#94a3b8',
        accent: '#2a9d8f',
        accentHover: '#238b7e',
        accentBg: '#e6f7f5',
        accentBgSoft: '#eff6ff',
        danger: '#e63946',
        dangerBg: '#fef2f2',
        warning: '#f4a261',
        warningBg: '#fff3e0',
        info: '#3b82f6',
        infoBg: '#e8f4fd',
        success: '#22c55e',
        barFill: '#0258d4',
        barFillLight: 'rgba(2,88,212,0.33)',
        shadow: '0 1px 3px rgba(0,0,0,0.08)',
        shadowLg: '0 8px 30px rgba(0,0,0,0.06)',
        statusBg: '#1a1a2e',
        statusText: '#94a3b8',
    },
    dark: {
        name: 'dark',
        bg: '#0a0e1a',
        bgCard: '#111827',
        bgInput: '#0f172a',
        bgSidebar: '#0f1520',
        bgTopbar: 'rgba(10,14,26,0.85)',
        bgHover: '#1e293b',
        border: 'rgba(255,255,255,0.08)',
        borderLight: 'rgba(255,255,255,0.04)',
        text: '#e2e8f0',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        textFaint: '#475569',
        accent: '#2a9d8f',
        accentHover: '#34d399',
        accentBg: 'rgba(42,157,143,0.12)',
        accentBgSoft: 'rgba(2,88,212,0.1)',
        danger: '#f87171',
        dangerBg: 'rgba(248,113,113,0.1)',
        warning: '#fbbf24',
        warningBg: 'rgba(251,191,36,0.1)',
        info: '#60a5fa',
        infoBg: 'rgba(96,165,250,0.1)',
        success: '#34d399',
        barFill: '#60a5fa',
        barFillLight: 'rgba(96,165,250,0.3)',
        shadow: '0 1px 3px rgba(0,0,0,0.3)',
        shadowLg: '0 8px 30px rgba(0,0,0,0.4)',
        statusBg: '#060810',
        statusText: '#475569',
    }
};

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        try { return localStorage.getItem('sii-theme') === 'dark'; } catch { return false; }
    });

    useEffect(() => {
        try { localStorage.setItem('sii-theme', isDark ? 'dark' : 'light'); } catch { }
        document.body.style.background = isDark ? themes.dark.bg : themes.light.bg;
        if (isDark) {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    }, [isDark]);

    const theme = isDark ? themes.dark : themes.light;
    const toggleTheme = () => setIsDark(p => !p);

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) return { theme: themes.light, isDark: false, toggleTheme: () => { } };
    return ctx;
}
