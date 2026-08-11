import { useEffect, useState } from 'react'

/** True when the app runs from the home screen rather than a Safari tab. */
export function isStandalone(): boolean {
  // iOS uses the non-standard navigator.standalone; everyone else the media query.
  const legacy = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return legacy || window.matchMedia('(display-mode: standalone)').matches
}

export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * Online state for the header indicator (concept 8.3). `navigator.onLine` only
 * reports whether the device has a connection, not whether Firestore can reach
 * anything — good enough for a hint, and honest about what it claims.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
