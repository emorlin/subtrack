import { useEffect } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
}

export function useFocusTrap(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = ref.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isVisible)

    const focusable = getFocusable()
    if (focusable.length) {
      focusable[0].focus()
    } else {
      container.focus()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const els = getFocusable()
      if (!els.length) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
