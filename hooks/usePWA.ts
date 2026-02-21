// hooks/usePWA.ts
'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWAInstallState {
  isInstalled: boolean
  canInstall: boolean
  isIOS: boolean
  isStandalone: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

export function usePWA() {
  const [state, setState] = useState<PWAInstallState>({
    isInstalled: false,
    canInstall: false,
    isIOS: false,
    isStandalone: false,
    installPrompt: null
  })

  useEffect(() => {
    // Detectar si está en iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    
    // Detectar si ya está instalado (modo standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    // Detectar si ya está "instalado" en diferentes navegadores
    const isInstalled = 
      isStandalone || 
      (navigator as any).standalone ||
      document.referrer.includes('android-app://')

    setState(prev => ({
      ...prev,
      isIOS,
      isStandalone,
      isInstalled
    }))

    // Manejar el evento de instalación PWA
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setState(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: e
      }))
    }

    // Manejar cuando la app se instala
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPrompt: null
      }))
    }

    // Agregar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Función para trigger la instalación
  const installPWA = async (): Promise<boolean> => {
    if (!state.installPrompt) {
      return false
    }

    try {
      await state.installPrompt.prompt()
      const choiceResult = await state.installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          canInstall: false,
          installPrompt: null
        }))
        return true
      }
    } catch (error) {
      console.error('Error instalando PWA:', error)
    }
    
    return false
  }

  // Instrucciones para iOS (que no soporta beforeinstallprompt)
  const showIOSInstallInstructions = () => {
    alert('Para instalar la app en iOS:\n1. Toca el botón compartir (📤)\n2. Selecciona "Agregar a pantalla de inicio"\n3. Toca "Agregar"')
  }

  return {
    ...state,
    installPWA,
    showIOSInstallInstructions
  }
}