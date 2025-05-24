export const COLORS = {
  background: {
    panel: 'bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800',
    input: 'bg-white hover:bg-neutral-50 focus:bg-white dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700',
    button: {
      primary: 'bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white',
      secondary: 'bg-white hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white',
      toggle: {
        enabled: 'bg-emerald-500 hover:bg-emerald-600 text-white dark:hover:bg-emerald-400',
        disabled: 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-neutral-500 dark:text-neutral-300',
      },
    },
  },
  text: {
    primary: 'text-neutral-900 dark:text-white',
    secondary: 'text-neutral-600 dark:text-neutral-300',
    label: 'text-neutral-500 dark:text-neutral-400 font-medium',
  },
  border: {
    panel: 'border border-neutral-200 dark:border-neutral-700 border-t-0',
    input: 'border-neutral-300 hover:border-indigo-300 focus:border-indigo-400 dark:border-neutral-600 dark:hover:border-indigo-500 dark:focus:border-indigo-400',
  },
  shadow: {
    panel: 'shadow-lg',
    button: 'hover:shadow-[0_4px_12px_-2px_rgba(99,102,241,0.3)]',
    card: 'shadow-md hover:shadow-lg',
  },
  accent: {
    primary: 'text-indigo-600 dark:text-indigo-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-rose-600 dark:text-rose-400',
  }
};

export const TRANSITIONS = {
  base: 'transition-all duration-200 ease-out',
  interactive: 'transition-colors duration-150 ease-in-out',
  transform: 'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
};

export const STYLE = {
  panel: `rounded-xl border ${COLORS.border.panel} ${COLORS.background.panel} ${COLORS.shadow.panel} p-4`,
  input: `w-full rounded-lg px-4 py-2.5 border ${COLORS.border.input} ${COLORS.background.input} ${COLORS.text.primary} ${TRANSITIONS.interactive} outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 placeholder:${COLORS.text.label}`,
  select: `w-full rounded-lg px-4 py-2.5 border ${COLORS.border.input} ${COLORS.background.input} ${COLORS.text.primary} ${TRANSITIONS.interactive} cursor-pointer outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900`,
  button: {
    primary: `px-5 py-2.5 rounded-lg font-semibold 
        flex items-center justify-center
    ${COLORS.background.button.primary}
     ${TRANSITIONS.interactive} 
     ${COLORS.shadow.button} 
     `,
    secondary: `
    px-3 py-2 rounded-lg font-medium
    flex items-center justify-center
    ${COLORS.background.button.secondary}
    ${COLORS.text.primary}
    ${TRANSITIONS.interactive}
  `,
  },
  card: `rounded-xl bg-white dark:bg-neutral-800 ${COLORS.border.panel} ${COLORS.shadow.card} ${TRANSITIONS.base} hover:${COLORS.shadow.card} p-5`,
  text: {
    heading: 'font-bold text-2xl text-neutral-900 dark:text-white',
    subheading: 'font-semibold text-lg text-neutral-800 dark:text-neutral-100',
    body: `text-base ${COLORS.text.primary}`,
    caption: `text-sm ${COLORS.text.secondary}`,
    label: `${COLORS.text.label} text-sm`,
  },
  infoPanel: `
    inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 h-full
    flex flex-col overflow-hidden
    ${COLORS.background.panel}
    ${COLORS.border.panel}
    shadow-2xl
  `,
  panelHeader: `
    flex justify-between items-center p-4 border-b
    ${COLORS.border.panel}
    border-none
  `,
  thumbnailContainer: `
    w-full aspect-video rounded-xl overflow-hidden relative
    ${TRANSITIONS.base}
  `,
  thumbnailDropzone: `
    w-full h-full flex items-center justify-center cursor-pointer
    ${COLORS.background.input}
  `,
  formInput: `
    w-full rounded-lg px-4 py-3
    ${COLORS.background.input}
    ${TRANSITIONS.base}
    ${COLORS.text.primary}
    border border-transparent focus:border-indigo-400
  `,
  actionButtons: `
    flex gap-3 pt-6
  `,
};