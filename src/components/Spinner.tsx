import { useEffect, useState } from 'react';
import { initLoading } from '../utils/loadingControls';
import { COLORS, STYLE } from '../constants/styling.constant';

export const Spinner = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        initLoading({
            show: () => setIsLoading(true),
            hide: () => setIsLoading(false)
        });
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <div className={`${STYLE.panel} ${STYLE.flex.center} p-2 relative`}>
                <div className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${COLORS.accent.primary}`} />
                
                {/* Optional: Small triangle indicator */}
                <div className={`
                    absolute -bottom-1.5 left-3 w-3 h-3 
                    ${COLORS.background.card}
                    border-b border-l ${COLORS.border.panel}
                    transform rotate-45
                `} />
            </div>
        </div>
    );
};