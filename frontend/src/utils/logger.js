/**
 * Logger utility - logs only in development
 * All console calls stripped from production build
 * via terser drop_console configuration
 */

const isDev = import.meta.env.DEV

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args)
  },
  error: (...args) => {
    if (isDev) console.error(...args)
  },
  warn: (...args) => {
    if (isDev) console.warn(...args)
  },
  debug: (...args) => {
    if (isDev) console.debug(...args)
  },
  info: (...args) => {
    if (isDev) console.info(...args)
  },
  trace: (...args) => {
    if (isDev) console.trace(...args)
  },
  time: (label) => {
    if (isDev) console.time(label)
  },
  timeEnd: (label) => {
    if (isDev) console.timeEnd(label)
  },
  group: (...args) => {
    if (isDev) console.group(...args)
  },
  groupEnd: () => {
    if (isDev) console.groupEnd()
  }
}

export default logger
