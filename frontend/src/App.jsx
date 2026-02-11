import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useEffect } from 'react';
import { useKioskStore } from './store/useKioskStore';
import { SessionWarning } from './components/kiosk/SessionWarning';
import { useTranslation } from 'react-i18next';
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

            // Show warning at 15 minutes (900000ms)
            warningTimer = setTimeout(() => {
                setShowSessionWarning(true);
            }, 900000);

            // Auto logout at 16 minutes (960000ms)
            inactivityTimer = setTimeout(() => {
                resetSession();
                window.location.href = '/';
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

    return (
        <>
            <RouterProvider router={router} />
            {showSessionWarning && <SessionWarning />}
        </>
    );
}

export default App;
