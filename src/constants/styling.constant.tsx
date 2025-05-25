export const COLORS = {
  background: {
    panel:
      "bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800",
    input:
      "bg-white hover:bg-neutral-50 focus:bg-white dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
    button: {
      primary:
        "bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white",
      secondary:
        "bg-white hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white",
      toggle: {
        enabled:
          "bg-emerald-500 hover:bg-emerald-600 text-white dark:hover:bg-emerald-400",
        disabled:
          "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-neutral-500 dark:text-neutral-300",
      },
    },
    card: "bg-white dark:bg-neutral-800/80 backdrop-blur-sm",
    overlay: "bg-black/50 backdrop-blur-sm",
  },
  text: {
    primary: "text-neutral-900 dark:text-white",
    secondary: "text-neutral-600 dark:text-neutral-300",
    label: "text-neutral-500 dark:text-neutral-400 font-medium",
    disabled: "text-neutral-400 dark:text-neutral-500",
  },
  border: {
    panel: "border border-neutral-200 dark:border-neutral-700",
    input:
      "border-neutral-300 hover:border-indigo-300 focus:border-indigo-400 dark:border-neutral-600 dark:hover:border-indigo-500 dark:focus:border-indigo-400",
    card: "border border-neutral-200/50 dark:border-neutral-700/50 hover:border-indigo-300/50 dark:hover:border-indigo-500/50",
  },
  shadow: {
    panel: "shadow-lg shadow-neutral-200/50 dark:shadow-black/30",
    button: "hover:shadow-[0_4px_12px_-2px_rgba(99,102,241,0.3)]",
    card: "shadow-md hover:shadow-xl shadow-neutral-200/50 dark:shadow-black/30",
    none: "shadow-none",
  },
  accent: {
    primary: "text-indigo-600 dark:text-indigo-400",
    success: "text-emerald-600 dark:text-emerald-400",
    danger: "text-rose-600 dark:text-rose-400",
    warning: "text-amber-600 dark:text-amber-400",
  },
  status: {
    success: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-500 dark:text-amber-400",
    error: "bg-rose-500/10 text-rose-500 dark:text-rose-400",
    disabled:
      "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400",
  },
};

export const TRANSITIONS = {
  base: "transition-all duration-300 ease-out",
  interactive: "transition-colors duration-200 ease-in-out",
  transform:
    "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
  opacity: "transition-opacity duration-200 ease-in-out",
  scale: "transition-transform duration-200 hover:scale-[1.02]",
};

export const LAYOUT = {
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-start justify-start",
    column: "flex flex-col",
  },
  grid: {
    responsive:
      "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6",
    fixed: "columns-3 gap-6 space-y-6",
  },
  container: "max-w-8xl mx-auto px-4 sm:px-6 lg:px-8",
};

export const STYLE = {
  // Base Components
  panel: `rounded-xl ${COLORS.border.panel} ${COLORS.background.panel} ${COLORS.shadow.panel} p-4`,

  input: `w-full rounded-lg px-4 py-2.5 border ${COLORS.border.input} ${COLORS.background.input} 
    ${COLORS.text.primary} ${TRANSITIONS.interactive} outline-none 
    focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 
    placeholder:${COLORS.text.label}`,

  select: `w-full rounded-lg px-4 py-2.5 border ${COLORS.border.input} 
    ${COLORS.background.input} ${COLORS.text.primary} ${TRANSITIONS.interactive} 
    cursor-pointer outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900`,

  button: {
    primary: `px-5 py-2.5 rounded-lg font-semibold ${LAYOUT.flex.center}
      ${COLORS.background.button.primary} ${TRANSITIONS.interactive} ${COLORS.shadow.button}
      hover:-translate-y-0.5 transition-transform duration-200`,

    secondary: `px-3 py-2 rounded-lg font-medium ${LAYOUT.flex.center}
      ${COLORS.background.button.secondary} ${COLORS.text.primary} ${TRANSITIONS.interactive}
      hover:-translate-y-0.5 transition-transform duration-200`,

    icon: `p-2 rounded-lg ${TRANSITIONS.interactive} ${LAYOUT.flex.center}
      hover:bg-neutral-100 dark:hover:bg-neutral-700
      hover:-translate-y-0.5 transition-transform duration-200`,

    link: `${COLORS.accent.primary} ${TRANSITIONS.interactive} 
      hover:underline flex items-center gap-1
      hover:-translate-y-0.5 transition-transform duration-200`,
  },

  card: `group relative break-inside-avoid-column rounded-xl ${COLORS.background.card} ${COLORS.border.card} 
    ${COLORS.shadow.card} ${TRANSITIONS.base} p-6 space-y-4 overflow-hidden`,

  // Typography
  text: {
    heading: `font-bold text-2xl ${COLORS.text.primary}`,
    subheading: "font-semibold text-lg text-neutral-800 dark:text-neutral-100",
    body: `text-base ${COLORS.text.primary}`,
    caption: `text-sm ${COLORS.text.secondary}`,
    label: `${COLORS.text.label} text-sm`,
  },

  // Layout Components
  container: LAYOUT.container,

  grid: {
    ...LAYOUT.grid,
    cards: `${LAYOUT.grid.responsive} p-4`,
  },

  flex: {
    ...LAYOUT.flex,
    wrap: "flex flex-wrap gap-2",
  },

  // Specialized Components
  badge: {
    base: "text-xs font-medium px-2.5 py-1 rounded-full",
    success: `${COLORS.status.success}`,
    warning: `${COLORS.status.warning}`,
    error: `${COLORS.status.error}`,
    disabled: `${COLORS.status.disabled}`,
  },

  infoPanel: `inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 h-full
    flex flex-col overflow-hidden ${COLORS.background.panel} ${COLORS.border.panel} shadow-2xl`,

  modal: {
    overlay: `fixed inset-0 ${COLORS.background.overlay} ${LAYOUT.flex.center} z-50`,
    content: `${COLORS.background.panel} rounded-xl ${COLORS.shadow.panel} 
      max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto`,
  },

  // Image Components
  image: {
    container: "relative w-full pb-[56.25%] overflow-hidden rounded-xl",
    responsive: "absolute inset-0 w-full h-full object-cover",
    placeholder: `absolute inset-0 w-full h-full ${COLORS.background.card} ${LAYOUT.flex.center}`,
  },

  // Form Components
  form: {
    group: "space-y-2 mb-4",
    label: `block ${COLORS.text.label}`,
    error: `text-sm ${COLORS.accent.danger} mt-1`,
    hint: `text-sm ${COLORS.text.secondary} mt-1`,
  },

  // Interactive States
  interactive: {
    hover: "hover:bg-neutral-100 dark:hover:bg-neutral-700",
    active: "active:bg-neutral-200 dark:active:bg-neutral-600",
    focus: "focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900",
  },
};
