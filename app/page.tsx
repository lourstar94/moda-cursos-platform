// app/page.tsx - VERSIÓN ACTUALIZADA
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Video, Scissors, Sparkles, ArrowRight, Download } from 'lucide-react';
import PWAInstallButton from '@/components/PWAInstallButton';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === 'ADMIN') redirect('/admin');
    else redirect('/courses');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#faf5ff] text-gray-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/elegido.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Diseña tu Futuro en{' '}
            <span className="text-[#9810FA] drop-shadow-sm">Moda</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mt-6 text-gray-700">
            La academia online de alta costura que transforma tu pasión en
            habilidad profesional.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/register"
              className="bg-[#9810FA] hover:bg-[#7e0ccf] text-white px-10 py-4 rounded-full text-lg font-semibold shadow-md transition-transform hover:scale-105 flex items-center justify-center"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/courses"
              className="bg-white/80 backdrop-blur border border-gray-200 hover:border-gray-300 px-10 py-4 rounded-full text-lg font-semibold transition-transform hover:scale-105 shadow-sm"
            >
              Ver Cursos
            </Link>
          </div>
        </div>

        {/* Sombra decorativa */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white" />
      </section>

      {/* SECCIÓN DESTACADA */}
      <section className="py-24 bg-[#f9f7ff]">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-14">
            Descubre tu Potencial Creativo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Video className="h-10 w-10 text-[#9810FA]" />,
                title: 'Clases en Video',
                desc: 'Aprende paso a paso con clases claras, dinámicas y de alta calidad.',
              },
              {
                icon: <Scissors className="h-10 w-10 text-[#9810FA]" />,
                title: 'Técnicas Profesionales',
                desc: 'Domina la costura, el patronaje y la confección como en un atelier real.',
              },
              {
                icon: <Sparkles className="h-10 w-10 text-[#9810FA]" />,
                title: 'Estilo que Inspira',
                desc: 'Crea tus propias prendas únicas con identidad y personalidad.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mx-auto w-20 h-20 flex items-center justify-center bg-[#f3e9ff] rounded-full mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN FINAL / LLAMADO */}
      <section className="py-24 bg-white text-center relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Empieza hoy a construir tu marca personal
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Únete a cientos de diseñadores que ya están creando moda con
            propósito y estilo.
          </p>
          
          {/* BOTÓN PRINCIPAL */}
          <Link
            href="/register"
            className="bg-[#9810FA] hover:bg-[#7e0ccf] text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition-transform inline-flex items-center"
          >
            Inscribirme Ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>

          {/* NUEVO BOTÓN PWA */}
          <div className="mt-6">
            <PWAInstallButton 
              variant="outline"
              className="bg-white border border-[#9810FA] text-[#9810FA] hover:bg-[#faf5ff] px-8 py-3 rounded-full font-semibold shadow-md transition-transform hover:scale-105"
            >
              <Download className="mr-2 h-5 w-5" />
              Instalar App
            </PWAInstallButton>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-100">
        © {new Date().getFullYear()} Academia de Moda. Todos los derechos reservados.
      </footer>
    </div>
  );
}
