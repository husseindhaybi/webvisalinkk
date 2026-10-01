// Shared easing curves (cubic-bezier control points), mirrored as CSS custom properties in tokens.css.
export const EASE_OUT = [0.23, 1, 0.32, 1]
export const EASE_IN_OUT = [0.77, 0, 0.175, 1]
export const EXPO_OUT = [0.16, 1, 0.3, 1]
export const DRAWER = [0.32, 0.72, 0, 1]

// Where scroll-triggered reveals fire: a little before the element is fully on screen.
export const IN_VIEW = { once: true, margin: '0px 0px -12% 0px' }
