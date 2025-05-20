import { COLORS, TRANSITIONS } from "../constants/styling.constant";
import { Mod } from "../interfaces/Mod.interface";


export default ({ mod, onClick }: { mod: Mod; onClick: (any: any) => void }) => {
    return <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold ${TRANSITIONS.button} 
                            ${mod.enabled ? COLORS.background.button.toggle.enabled : COLORS.background.button.toggle.disabled}
                            flex items-center gap-2`}
    >
        {mod.enabled ? (
            <>
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-700 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Enabled
            </>
        ) : (
            'Disabled'
        )}
    </button>
}
