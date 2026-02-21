import { useEffect, useState, type RefObject } from "react"

export function useInView(
  ref: RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.unobserve(el)
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, options])

  return isInView
}
