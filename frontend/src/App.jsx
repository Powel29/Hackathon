import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useEffect } from 'react';
import { useKioskStore } from './store/useKioskStore';
import { SessionWarning } from './components/nextgen-seva/SessionWarning';
import { kioskService } from './services/api/kiosk.service';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import ChatWidget from './components/nextgen-seva/ChatWidget';
import './i18n';

function App() {
    const { resetSession, showSessionWarning, setShowSessionWarning, language } = useKioskStore();
    const { i18n } = useTranslation();

    // Sync language with i18n on app load and whenever language changes
    useEffect(() => {
        if (language && i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    useEffect(() => {
        let inactivityTimer;
        let warningTimer;

        const resetTimers = () => {
            clearTimeout(inactivityTimer);
            clearTimeout(warningTimer);

            // Hide any existing session warning when timers are reset
            setShowSessionWarning(false);

            // Show warning at 15 minutes (900000ms)
            warningTimer = setTimeout(() => {
                setShowSessionWarning(true);
            }, 900000);

            // Auto logout at 16 minutes (960000ms)
            inactivityTimer = setTimeout(() => {
                resetSession();
                window.location.href = '/nextgen-seva';
            }, 960000);
        };

        // Reset timers on user activity
        const events = ['mousedown', 'touchstart', 'keypress', 'scroll'];
        events.forEach(event => {
            window.addEventListener(event, resetTimers);
        });

        resetTimers();

        return () => {
            clearTimeout(inactivityTimer);
            clearTimeout(warningTimer);
            events.forEach(event => {
                window.removeEventListener(event, resetTimers);
            });
        };
    }, [resetSession, setShowSessionWarning]);

    // Kiosk Background Heartbeat
    useEffect(() => {
        // Initial ping
        kioskService.sendHeartbeat();

        // Every 30 seconds
        const interval = setInterval(() => {
            kioskService.sendHeartbeat();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <RouterProvider router={router} />
            <ChatWidget />
            <Toaster richColors position="top-right" />
            {showSessionWarning && <SessionWarning />}
        </>
    );
}

export default App;
