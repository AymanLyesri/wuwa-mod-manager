export const COLORS = {
  background: {
    panel: "bg-white/95 dark:bg-neutral-800/95",
    input:
      "bg-white/90 hover:bg-white focus:bg-white dark:bg-neutral-800/70 dark:hover:bg-neutral-800/80 dark:focus:bg-neutral-800",
    button: {
      primary:
        "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-500 dark:hover:to-indigo-500 text-white shadow-md shadow-indigo-500/15",
      secondary:
        "bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-700/95 text-neutral-900 dark:text-white shadow-sm",
      toggle: {
        enabled:
          "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/15",
        disabled:
          "bg-neutral-200/80 hover:bg-neutral-300/80 dark:bg-neutral-700/70 dark:hover:bg-neutral-600/80 text-neutral-600 dark:text-neutral-400",
      },
    },
    card: "bg-white/95 dark:bg-neutral-800/95",
    overlay: "bg-black/70 dark:bg-black/85",
    popover: "bg-white/95 dark:bg-neutral-800/95",
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
    panel: "shadow-md shadow-neutral-200/10 dark:shadow-black/10",
    button: "shadow-sm",
    card: "shadow-sm",
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
    primary: "hover:border-violet-400/50 dark:hover:border-violet-500/50",
    success: "hover:border-emerald-400/50 dark:hover:border-emerald-500/50",
    danger: "hover:border-rose-400/50 dark:hover:border-rose-500/50",
  },
};

export const TRANSITIONS = {
  base: "transition-colors duration-200 ease-out",
  interactive: "transition-colors duration-150 ease-in-out",
  transform: "transition-transform duration-200 ease-out",
  opacity: "transition-opacity duration-150 ease-in-out",
  scale: "transition-transform duration-200 hover:scale-[1.01]",
  glow: "relative transition-colors duration-200 ease-out",
};

export const LAYOUT = {
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-start justify-start",
    column: "flex flex-col",
  },
  grid: {
    responsive: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6",
    fixed: "grid grid-cols-3 gap-6",
  },
  container: "max-w-10xl mx-auto px-4 sm:px-6 lg:px-8",
};

export const STYLE = {
  // Base Components
  panel: `rounded-xl ${COLORS.border.panel} ${COLORS.background.panel} ${COLORS.shadow.panel} p-4`,

  input: `relative w-full rounded-lg px-4 py-2.5 border ${COLORS.border.input} ${COLORS.background.input} 
    ${COLORS.text.primary} ${TRANSITIONS.interactive} outline-none 
    focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/50
    placeholder:${COLORS.text.label}`,

  select: `relative w-full rounded-lg px-4 py-2.5 border ${COLORS.border.input} 
    ${COLORS.background.input} ${COLORS.text.primary} ${TRANSITIONS.interactive} 
    cursor-pointer outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/50
    appearance-none bg-[position:right_0.75rem_center] bg-no-repeat pr-10`,

  button: {
    primary: `relative px-5 py-2.5 rounded-lg font-semibold ${LAYOUT.flex.center}
      ${COLORS.background.button.primary} ${TRANSITIONS.interactive} ${COLORS.shadow.button}
      active:scale-95`,

    secondary: `relative px-3 py-2 rounded-lg font-medium ${LAYOUT.flex.center}
      ${COLORS.background.button.secondary} ${COLORS.text.primary} ${TRANSITIONS.interactive}
      active:scale-95`,

    icon: `relative p-2 rounded-lg ${TRANSITIONS.interactive} ${LAYOUT.flex.center}
      hover:bg-neutral-100 dark:hover:bg-neutral-700
      active:scale-95`,

    link: `${COLORS.accent.primary} ${TRANSITIONS.interactive} 
      hover:underline flex items-center gap-1
      active:scale-95`,
  },

  card: `group relative rounded-xl ${COLORS.background.card} ${COLORS.border.card} 
    ${COLORS.shadow.card} ${TRANSITIONS.base} p-6 space-y-4 overflow-hidden contain-content`,
  // Apple-inspired card: larger radius, subtle glass, edge-to-edge image
  cardApple: `group relative rounded-3xl ${COLORS.background.card} ${COLORS.border.card} 
    ${COLORS.shadow.card} ${TRANSITIONS.base} overflow-hidden contain-content`,

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
    overlay: `fixed inset-0 ${COLORS.background.overlay} ${LAYOUT.flex.center} z-50 contain-layout`,
    content: `${COLORS.background.panel} rounded-xl ${COLORS.shadow.panel} 
      max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto contain-content`,
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
