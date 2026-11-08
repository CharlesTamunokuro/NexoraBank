import { useEffect, useState } from 'react'

export function navigateTo(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new Event('app:navigate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}

export function useCurrentPath() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname)
    window.addEventListener('popstate', updatePath)
    window.addEventListener('app:navigate', updatePath)
    return () => {
      window.removeEventListener('popstate', updatePath)
      window.removeEventListener('app:navigate', updatePath)
    }
  }, [])

  return path
}
