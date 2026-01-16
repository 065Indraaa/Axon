import { useEffect, useState } from 'react'

export function useMiniApp() {
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [miniAppContext, setMiniAppContext] = useState<any>(null)

  useEffect(() => {
    // Detect if running in Farcaster Mini App
    const checkMiniApp = () => {
      const isFarcaster = typeof window !== 'undefined' && 
        (window.location !== window.parent.location || 
         window.self !== window.top ||
         document.referrer.includes('warpcast') ||
         navigator.userAgent.includes('Farcaster'))
      
      setIsMiniApp(isFarcaster)
      
      if (isFarcaster) {
        // Initialize Mini App SDK
        try {
          import('@farcaster/miniapp-sdk').then(({ default: FarcasterMiniApp }) => {
            const miniApp = new FarcasterMiniApp()
            setMiniAppContext(miniApp)
          })
        } catch (error) {
          console.log('Mini App SDK not available')
        }
      }
    }

    checkMiniApp()
  }, [])

  return { isMiniApp, miniAppContext }
}
