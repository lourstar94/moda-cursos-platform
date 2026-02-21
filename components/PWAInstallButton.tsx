// components/PWAInstallButton.tsx
'use client'

import { useState } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { Download, Smartphone, Check } from 'lucide-react'

interface PWAInstallButtonProps {
  className?: string
  children?: React.ReactNode
  variant?: 'primary' | 'outline'
}

export default function PWAInstallButton({ 
  className = '',
  children,
  variant = 'outline'
}: PWAInstallButtonProps) {
  const { 
    canInstall, 
    isInstalled, 
    isIOS, 
    installPWA, 
    showIOSInstallInstructions 
  } = usePWA()
  
  const [isInstalling, setIsInstalling] = useState(false)

  // No mostrar nada si ya está instalado o en modo standalone
  if (isInstalled) {
    return null
  }

  // Determinar estilos basados en el variant
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantStyles = {
    primary: "bg-[#9810FA] hover:bg-[#7e0ccf] text-white focus:ring-[#9810FA]",
    outline: "bg-white border border-[#9810FA] text-[#9810FA] hover:bg-[#faf5ff] focus:ring-[#9810FA]"
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      showIOSInstallInstructions()
      return
    }

    if (canInstall) {
      setIsInstalling(true)
      try {
        await installPWA()
      } catch (error) {
        console.error('Error durante la instalación:', error)
      } finally {
        setIsInstalling(false)
      }
    }
  }

  // Si no puede instalar y no es iOS, no mostrar el botón
  if (!canInstall && !isIOS) {
    return null
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${
        isInstalling ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label="Instalar aplicación móvil"
    >
      {isInstalling ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
          Instalando...
        </>
      ) : (
        <>
          {isIOS ? (
            <Smartphone className="mr-2 h-5 w-5" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          {children || 'Instalar App'}
        </>
      )}
    </button>
  )
}