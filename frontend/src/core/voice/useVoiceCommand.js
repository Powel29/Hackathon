import { useEffect, useRef } from 'react';
import { useVoiceStore } from '../../store/useVoiceStore';

/**
 * Hook to bind voice intents to local component actions.
 * @param {Record<string, Function>} handlers - Map of intents to callback functions
 */
export function useVoiceCommand(handlers) {
    const { lastCommand, clearCommand } = useVoiceStore();
    const abortRef = useRef(new AbortController());

    useEffect(() => {
        if (!lastCommand) return;

        // Check if handler exists and hasn't been consumed
        const handler = handlers[lastCommand.intent];
        if (handler && !abortRef.current.signal.aborted) {
            try {
                handler(lastCommand);
            } catch (error) {
                console.error('[Voice] Handler error:', error);
            } finally {
                // Clear the command after acting on it, preventing action replay
                clearCommand();
            }
        }
    }, [lastCommand, handlers, clearCommand]);

    // Cleanup: abort any pending operations on unmount
    useEffect(() => {
        return () => {
            abortRef.current.abort();
        };
    }, []);
}
