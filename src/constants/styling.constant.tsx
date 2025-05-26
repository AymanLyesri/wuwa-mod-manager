export const COLORS = {
  background: {
    panel:
      "bg-gradient-to-br from-white via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 backdrop-blur-xl",
    input:
      "bg-white/80 hover:bg-white focus:bg-white dark:bg-neutral-800/50 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
    button: {
      primary:
        "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-500 dark:hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 dark:shadow-indigo-900/40",
      secondary:
        "bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white shadow-lg shadow-neutral-200/50 dark:shadow-black/20",
      toggle: {
        enabled:
          "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 dark:shadow-emerald-900/40",
        disabled:
          "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700/50 dark:hover:bg-neutral-600/50 text-neutral-600 dark:text-neutral-400",
      },
    },
    card: "bg-white/80 dark:bg-neutral-800/50 backdrop-blur-xl",
    overlay: "bg-black/60 backdrop-blur-sm dark:bg-black/80",
  },
  text: {
    primary: "text-neutral-900 dark:text-white",
    secondary: "text-neutral-600 dark:text-neutral-300",
    label: "text-neutral-500 dark:text-neutral-400 font-medium",
    disabled: "text-neutral-400 dark:text-neutral-600",
    gradient:
      "bg-gradient-to-r from-violet-500 to-indigo-500 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent",
  },
  border: {
    panel: "border border-white/20 dark:border-neutral-700/50",
    input:
      "border-neutral-200 hover:border-violet-300 focus:border-violet-400 dark:border-neutral-700 dark:hover:border-violet-500 dark:focus:border-violet-400",
    card: "border border-white/20 dark:border-neutral-800/50 hover:border-violet-300/50 dark:hover:border-violet-500/50",
  },
  shadow: {
    panel: "shadow-xl shadow-neutral-200/20 dark:shadow-black/20",
    button:
      "hover:shadow-lg hover:shadow-violet-500/25 dark:hover:shadow-violet-900/40",
    card: "shadow-lg hover:shadow-xl shadow-neutral-200/20 dark:shadow-black/20 hover:shadow-violet-500/10 dark:hover:shadow-violet-900/20",
    none: "shadow-none",
  },
  accent: {
    primary: "text-violet-600 dark:text-violet-400",
    success: "text-emerald-600 dark:text-emerald-400",
    danger: "text-rose-600 dark:text-rose-400",
    warning: "text-amber-600 dark:text-amber-400",
  },
  status: {
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-400/20",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-400/20",
    error:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-400/20",
    disabled:
      "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700",
  },
  glow: {
    primary:
      "after:absolute after:inset-0 after:rounded-lg after:bg-violet-500/20 after:blur-xl after:transition-opacity hover:after:opacity-100 after:opacity-0 after:-z-10",
    success:
      "after:absolute after:inset-0 after:rounded-lg after:bg-emerald-500/20 after:blur-xl after:transition-opacity hover:after:opacity-100 after:opacity-0 after:-z-10",
    danger:
      "after:absolute after:inset-0 after:rounded-lg after:bg-rose-500/20 after:blur-xl after:transition-opacity hover:after:opacity-100 after:opacity-0 after:-z-10",
  },
};

export const TRANSITIONS = {
  base: "transition-all duration-300 ease-out",
  interactive: "transition-all duration-200 ease-in-out",
  transform:
    "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
  opacity: "transition-opacity duration-200 ease-in-out",
  scale: "transition-transform duration-200 hover:scale-[1.02]",
  glow: "relative transition-all duration-300 ease-out hover:shadow-lg",
};

export const LAYOUT = {
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-start justify-start",
    column: "flex flex-col",
  },
  grid: {
    responsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    fixed: "grid grid-cols-3 gap-6",
  },
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
};

export const STYLE = {
  // Base Components
  panel: `relative rounded-xl ${COLORS.border.panel} ${COLORS.background.panel} ${COLORS.shadow.panel} p-4 overflow-hidden`,

  input: `relative w-full rounded-lg px-4 py-2.5 border ${COLORS.border.input} ${COLORS.background.input} 
    ${COLORS.text.primary} ${TRANSITIONS.interactive} outline-none 
    focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/50
    placeholder:${COLORS.text.label}`,

  select: `relative w-full rounded-lg px-4 py-2.5 border ${COLORS.border.input} 
    ${COLORS.background.input} ${COLORS.text.primary} ${TRANSITIONS.interactive} 
    cursor-pointer outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/50`,

  button: {
    primary: `relative px-5 py-2.5 rounded-lg font-semibold ${LAYOUT.flex.center}
      ${COLORS.background.button.primary} ${TRANSITIONS.interactive} ${COLORS.shadow.button} ${COLORS.glow.primary}
      hover:-translate-y-0.5 active:translate-y-0`,

    secondary: `relative px-3 py-2 rounded-lg font-medium ${LAYOUT.flex.center}
      ${COLORS.background.button.secondary} ${COLORS.text.primary} ${TRANSITIONS.interactive}
      hover:-translate-y-0.5 active:translate-y-0`,

    icon: `relative p-2 rounded-lg ${TRANSITIONS.interactive} ${LAYOUT.flex.center}
      hover:bg-neutral-100 dark:hover:bg-neutral-700
      hover:-translate-y-0.5 active:translate-y-0`,

    link: `${COLORS.accent.primary} ${TRANSITIONS.interactive} 
      hover:underline flex items-center gap-1
      hover:-translate-y-0.5 active:translate-y-0`,
  },

  card: `group relative rounded-xl ${COLORS.background.card} ${COLORS.border.card} 
    ${COLORS.shadow.card} ${TRANSITIONS.base} p-6 space-y-4 overflow-hidden`,

  // Typography
  text: {
    heading: `font-bold text-2xl ${COLORS.text.gradient}`,
    subheading: `font-semibold text-lg ${COLORS.text.primary}`,
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
    container: "relative w-full overflow-hidden rounded-xl",
    responsive: "w-full h-full object-cover",
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
    hover: "hover:bg-neutral-100 dark:hover:bg-neutral-700/50",
    active: "active:bg-neutral-200 dark:active:bg-neutral-600/50",
    focus: "focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/50",
  },
};
