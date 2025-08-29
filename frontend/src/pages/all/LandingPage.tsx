import { useRef } from "react";
import Login from "@/features/auth/components/Login";
import OrbitingParticles from "@/components/others/OrbitingParticles";

export default function LandingPage() {
  const cardRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="min-h-screen bg-cover bg-fixed font-serif p-4 flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: "url('/Scroll.png')",
        backgroundColor: '#f5e7d0',
      }}
    >
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      {/* Partículas globales orbitando */}
      <OrbitingParticles targetRef={cardRef} />

      <div className="relative z-10 w-full max-w-md">
        <h1 className="text-6xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-800 to-amber-600">
          RolUp
        </h1>


        <div ref={cardRef} className="relative bg-white/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border w-full hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-amber-900">Iniciar Sesión</h2>
          </div>

          <Login />
        </div>
      </div>
      <div
        className="fixed bottom-2 right-2 text-gray-500 text-xs italic z-20"
      >
        Versión 1.0.0
      </div>
    </div>
  );
}
