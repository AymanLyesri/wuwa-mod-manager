import { COLORS, STYLE, TRANSITIONS } from "../constants/styling.constant";
import { Mod } from "../interfaces/Mod.interface";

interface StatusButtonProps {
    mod: Mod;
    onClick: (event: React.MouseEvent) => void;
}

export default function StatusButton({ mod, onClick }: StatusButtonProps) {
    const buttonStyle = `
        ${STYLE.button.secondary}
        rounded-full text-sm font-semibold
        ${mod.enabled ? COLORS.background.button.toggle.enabled : COLORS.background.button.toggle.disabled}
        ${TRANSITIONS.interactive}
    `;

    return (
        <button onClick={onClick} className={buttonStyle}>
            {mod.enabled ? (
                <div className={STYLE.flex.center + ' gap-2'}>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-700 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Enabled
                </div>
            ) : (
                'Disabled'
            )}
        </button>
    );
}
