'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, Home, Video, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación no coincidente
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  if (!mounted) {
    // Renderizar un header básico durante el SSR
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">DeLu Atelier</span>
            </div>
            <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Navegación Principal */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-[#9810FA]" />
              <span className="text-xl font-bold text-gray-900">DeLu Atelier</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link
                href="/courses"
               className={`flex items-center space-x-1 ${
  isActive('/courses') 
    ? 'text-[#9810FA] font-medium' 
    : 'text-gray-600 hover:text-gray-900'
}`}
              >
                <Home className="h-4 w-4" />
                <span>Cursos</span>
              </Link>

              {session?.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                className={`flex items-center space-x-1 ${
  isActive('/admin') 
    ? 'text-[#9810FA] font-medium' 
    : 'text-gray-600 hover:text-gray-900'
}`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Administración</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Información de Usuario */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="flex items-center space-x-3">
                <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
                <div className="hidden sm:block">
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded mb-1"></div>
                  <div className="animate-pulse bg-gray-200 h-3 w-16 rounded"></div>
                </div>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="hidden sm:block text-sm">
                    <p className="font-medium text-gray-900">{session.user.name || session.user.email}</p>
                    <p className="text-gray-500 capitalize">{session.user.role.toLowerCase()}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-[#9810FA] text-white px-4 py-2 rounded-md hover:bg-[#7e0ccf] font-medium"

                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}