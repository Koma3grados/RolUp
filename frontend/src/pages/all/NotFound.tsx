import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }}
            className="min-h-screen ..."
        >
            <div className="min-h-screen bg-fixed bg-cover text-ink font-serif flex flex-col items-center justify-center p-6 relative overflow-hidden"
                style={{
                    backgroundImage: "url('/Scroll.png')",
                    backgroundColor: '#f5e7d0',
                }}
            >

                {/* Overlay entre fondo y contenido */}
                <div className="absolute inset-0 bg-parchment/70 z-0"></div>

                {/* Efecto de quemado en los bordes */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: `radial-gradient(circle, transparent 60%, rgba(0,0,0,0.1) 100%)`,
                    mixBlendMode: 'multiply'
                }}></div>

                <div className="text-center max-w-2xl relative z-10">
                    <div className="mx-auto w-48 h-48 bg-amber-100/50 rounded-full flex items-center justify-center mb-8 border-2 border-amber-800">
                        <span className="text-8xl">🧙‍♂️</span>
                    </div>

                    <h1 className="text-8xl md:text-9xl font-bold text-amber-800 mb-4 font-[fantasy] tracking-wider">
                        404
                    </h1>

                    <h2 className="text-3xl md:text-4xl font-semibold text-amber-900 mb-6">
                        ¡Atrás insensato!
                    </h2>

                    <p className="text-lg text-gray-700 mb-8 px-4 py-3 bg-white/70 rounded-lg border">
                        "El portal que buscas no existe en este plano de realidad.
                        Tal vez el mago que lo creó lo ha desvanecido..."
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="mx-auto flex items-center gap-2 bg-amber-700 text-white px-8 py-4 rounded-lg hover:bg-amber-800 transition-all shadow-lg hover:shadow-xl transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Regresar al Reino Principal
                    </button>
                </div>
            </div>
        </motion.div>
    );
}