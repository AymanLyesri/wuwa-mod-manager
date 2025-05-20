import { useEffect, useState } from 'react';
import { initLoading } from '../utils/loadingControls';

export const Spinner = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        initLoading({
            show: () => setIsLoading(true),
            hide: () => setIsLoading(false)
        });
    }, []);

    return isLoading ? (
        <div className="fixed bottom-4 left-4 z-50">
            <div className="relative p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
                {/* <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">{alert}</span> */}

                {/* Optional: Small triangle indicator */}
                <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-white dark:bg-neutral-800 
                               border-b border-l border-neutral-200 dark:border-neutral-700 
                               transform rotate-45" />
            </div>
        </div>
    ) : null;
};