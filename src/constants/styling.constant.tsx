export const COLORS = {
    background: {
        panel: 'bg-gradient-to-b from-neutral-300 to-neutral-200 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 bg-gradient-to-b from-neutral-100 to-neutral-200',
        input: 'bg-neutral-400 hover:bg-neutral-500 focus:bg-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600 bg-neutral-200 hover:bg-neutral-300 focus:bg-neutral-300',
        button: {
            primary: 'text-white bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 bg-blue-500 hover:bg-blue-400',
            secondary: 'bg-neutral-700 hover:bg-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600 bg-neutral-300 hover:bg-neutral-400',
            toggle: {
                enabled: 'bg-green-500 text-white hover:bg-green-600 dark:text-neutral-900 dark:hover:bg-green-500',
                disabled: 'bg-neutral-300 text-neutral-700 hover:bg-neutral-400 dark:bg-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-500',
            },
        },
    },
    text: {
        primary: 'text-white dark:text-white text-neutral-900',
        secondary: 'text-neutral-300 dark:text-neutral-300 text-neutral-700',
        label: 'text-neutral-400 dark:text-neutral-400 text-neutral-600',
    },
    border: {
        panel: 'border-l border-white dark:border-neutral-700 border-neutral-300',
        image: 'border-1 border-white hover:border-blue-500 dark:border-neutral-700 dark:hover:border-blue-500 border-neutral-300 hover:border-blue-400',
    },
    shadow: {
        panel: 'shadow-xl',
        button: 'hover:shadow-[0_0_10px_-3px_rgba(96,165,250,0.5)]',
        image: 'hover:shadow-[0_0_20px_-5px_rgba(96,165,250,0.3)]',
    },
};

export const TRANSITIONS = {
    base: 'transition-all duration-300 ease-out',
    button: 'transition-colors duration-200 ease-in-out',
    image: 'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
};

export const STYLE = {
    panel: `
        rounded-2xl
        border
        ${COLORS.border.panel}
        ${COLORS.background.panel}
        ${COLORS.shadow.panel}
        p-6
    `,
    input: `
        w-full
        rounded-lg
        px-4
        py-3
        outline-none
        ${COLORS.background.input}
        ${COLORS.text.primary}
        ${TRANSITIONS.base}
        border
        border-transparent
        focus:border-blue-400
        placeholder:text-neutral-400
        dark:placeholder:text-neutral-500
    `,
    select: `
        w-full
        rounded-lg
        px-4
        py-3
        outline-none
        ${COLORS.background.input}
        ${COLORS.text.primary}
        ${TRANSITIONS.base}
        border
        border-transparent
        focus:border-blue-400
        cursor-pointer
    `,
    button: `
        px-4
        py-2
        rounded-lg
        font-semibold
        ${COLORS.background.button.primary}
        ${TRANSITIONS.button}
        ${COLORS.shadow.button}
        focus:outline-none
        focus:ring-2
        focus:ring-blue-400
        disabled:opacity-60
        disabled:cursor-not-allowed
    `,
    image: `
        rounded-xl
        object-cover
        w-full
        h-full
        ${COLORS.border.image}
        ${COLORS.shadow.image}
        ${TRANSITIONS.image}
    `,
    text: {
        primary: `${COLORS.text.primary}`,
        secondary: `${COLORS.text.secondary}`,
        label: `font-medium ${COLORS.text.label}`,
        heading: `font-bold text-xl ${COLORS.text.primary}`,
        small: `text-xs ${COLORS.text.secondary}`,
    },
    card: `
        rounded-xl
        bg-white
        dark:bg-neutral-800
        shadow-md
        p-4
        ${COLORS.border.panel}
    `,
};