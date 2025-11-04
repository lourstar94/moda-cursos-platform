// components/client/PurchaseModal.tsx
'use client'

import { useState } from 'react'

interface PurchaseModalProps {
  course: {
    id: string
    title: string
    price: number
  }
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

export default function PurchaseModal({ course, user }: PurchaseModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Datos de contacto de la diseñadora (pueden venir de variables de entorno)
  const designerWhatsApp = '+595975941524' // Reemplazar con número real
  const designerName = 'Diseñadora Principal'

  // Mensaje predefinido para WhatsApp
  const whatsappMessage = `Hola ${designerName}! Estoy interesado/a en el curso "${course.title}" ($${course.price}). Mi nombre es ${user.name} (${user.email}). ¿Podrías darme más información sobre el proceso de pago?`

  const encodedMessage = encodeURIComponent(whatsappMessage)
  const whatsappUrl = `https://wa.me/${designerWhatsApp}?text=${encodedMessage}`

  return (
    <>
    <button
  onClick={() => setIsOpen(true)}
  className="inline-block bg-[#9810FA] hover:bg-[#7e0ccf] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
>
  Comprar Curso
</button>


      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Comprar {course.title}
            </h3>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Para completar tu compra, contacta a la diseñadora directamente por WhatsApp:
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{designerName}</p>
                <p className="text-gray-600">WhatsApp: {designerWhatsApp}</p>
              </div>

              <p className="text-sm text-gray-500">
                Una vez que coordines el pago, la diseñadora te habilitará el acceso al curso manualmente.
              </p>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                >
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}