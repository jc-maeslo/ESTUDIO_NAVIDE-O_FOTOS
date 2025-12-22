
import React, { useState } from 'react';
import { ImageData, GenerationStatus } from './types';
import { generateChristmasPhoto } from './services/geminiService';
import ImageUploader from './components/ImageUploader';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [status, setStatus] = useState<GenerationStatus>({
    loading: false,
    error: null,
    resultUrl: null,
  });

  const handleGenerate = async () => {
    if (images.length === 0) {
      setStatus(prev => ({ ...prev, error: "Por favor, sube al menos una foto de referencia." }));
      return;
    }

    setStatus({ loading: true, error: null, resultUrl: null });

    try {
      const result = await generateChristmasPhoto(images);
      setStatus({ loading: false, error: null, resultUrl: result });
    } catch (err: any) {
      setStatus({ 
        loading: false, 
        error: err.message || "Ocurrió un error inesperado.", 
        resultUrl: null 
      });
    }
  };

  const handleDownload = () => {
    if (!status.resultUrl) return;
    const link = document.createElement('a');
    link.href = status.resultUrl;
    link.download = 'navidad_magica_ia.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
              <i className="fa-solid fa-wand-magic-sparkles text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Studio Navideño IA</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Edición Profesional</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <i className="fa-solid fa-shield-halved text-green-500"></i>
              Privacidad Garantizada
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Controls */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <ImageUploader images={images} setImages={setImages} />
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800">Instrucciones de Mejora</h3>
            <ul className="text-sm text-slate-600 space-y-3">
              <li className="flex gap-2">
                <i className="fa-solid fa-check text-red-500 mt-1"></i>
                <span>Mantener rostros originales (Identidad)</span>
              </li>
              <li className="flex gap-2">
                <i className="fa-solid fa-check text-red-500 mt-1"></i>
                <span>Mirada a cámara y sonrisas naturales</span>
              </li>
              <li className="flex gap-2">
                <i className="fa-solid fa-check text-red-500 mt-1"></i>
                <span>Enderezar orejas de reno</span>
              </li>
              <li className="flex gap-2">
                <i className="fa-solid fa-check text-red-500 mt-1"></i>
                <span>Eliminar perro, añadir árbol blanco y tren</span>
              </li>
              <li className="flex gap-2">
                <i className="fa-solid fa-check text-red-500 mt-1"></i>
                <span>Paisaje nevado desde la ventana</span>
              </li>
            </ul>
          </section>

          <button
            onClick={handleGenerate}
            disabled={status.loading || images.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
              status.loading || images.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-red-100'
            }`}
          >
            {status.loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Procesando Arte...
              </>
            ) : (
              <>
                <i className="fa-solid fa-magic"></i>
                Generar Fotografía
              </>
            )}
          </button>
        </div>

        {/* Preview / Result Area */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-[4/3] relative flex items-center justify-center shadow-2xl border-4 border-white">
            {!status.resultUrl && !status.loading && !status.error && (
              <div className="text-center p-12 space-y-4">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                  <i className="fa-solid fa-image text-slate-600 text-4xl"></i>
                </div>
                <div className="max-w-sm">
                  <h2 className="text-white text-xl font-serif mb-2 italic">Esperando tu magia</h2>
                  <p className="text-slate-400 text-sm">Sube las fotos y pulsa "Generar" para ver la transformación profesional con HDR y correcciones artísticas.</p>
                </div>
              </div>
            )}

            {status.loading && (
              <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-6">
                  <div className="w-24 h-24 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                  <i className="fa-solid fa-snowflake text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse"></i>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Creando la escena perfecta</h3>
                <p className="text-slate-400 max-w-xs">Ajustando exposición, mejorando el contraste HDR y colocando el tren de juguete bajo el árbol...</p>
              </div>
            )}

            {status.error && (
              <div className="bg-red-50 p-8 rounded-2xl max-w-md border border-red-200 text-center">
                <i className="fa-solid fa-triangle-exclamation text-red-600 text-4xl mb-4"></i>
                <h3 className="text-red-900 font-bold mb-2">¡Ups! Algo falló</h3>
                <p className="text-red-700 text-sm mb-4">{status.error}</p>
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            )}

            {status.resultUrl && (
              <div className="w-full h-full relative group">
                <img 
                  src={status.resultUrl} 
                  alt="Resultado Generado" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={handleDownload}
                    className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    <i className="fa-solid fa-download"></i>
                    Descargar JPG
                  </button>
                </div>
                {/* Overlay Badge */}
                <div className="absolute top-6 left-6 glass px-4 py-2 rounded-full text-xs font-bold text-red-700 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                  MEJORADO CON IA
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200">
                <i className="fa-solid fa-sun text-yellow-500"></i>
                HDR Optimizado
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200">
                <i className="fa-solid fa-microchip text-blue-500"></i>
                Gemini 2.5 Flash
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200">
                <i className="fa-solid fa-camera text-indigo-500"></i>
                Identidad Preservada
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm gap-4">
        <p>© 2024 AI Photo Studio Profesional. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-red-600 transition-colors">Términos</a>
          <a href="#" className="hover:text-red-600 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-red-600 transition-colors">Contacto</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
