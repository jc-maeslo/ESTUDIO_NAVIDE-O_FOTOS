
import React, { useState } from 'react';
import { ImageData, GenerationStatus, RefinementOptions } from './types';
import { generateChristmasPhoto } from './services/geminiService';
import ImageUploader from './components/ImageUploader';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [options, setOptions] = useState<RefinementOptions>({
    hideReindeerEars: true,
    uprightAntlers: true,
    lookAtCamera: true,
    preservePhysiology: true,
    removeDog: true,
    addToyTrain: true,
    snowyWindow: true,
  });

  const [status, setStatus] = useState<GenerationStatus>({
    loading: false,
    error: null,
    resultUrl: null,
  });

  const handleToggle = (key: keyof RefinementOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      setStatus(prev => ({ ...prev, error: "Por favor, sube al menos una foto de referencia." }));
      return;
    }

    setStatus({ loading: true, error: null, resultUrl: null });

    try {
      const result = await generateChristmasPhoto(images, options);
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
    link.download = 'navidad_profesional_ia.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-camera-retro text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">PhotoStudio AI Pro</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Retoque Fotográfico de Alta Gama</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <i className="fa-solid fa-circle-check"></i>
              Módulo de Rostros Activo
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <ImageUploader images={images} setImages={setImages} />
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-red-600"></i>
                Variables de Retoque
              </h3>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500 uppercase">Pro</span>
            </div>

            <div className="space-y-4">
              <ControlToggle 
                label="Ocultar Orejas de Reno" 
                active={options.hideReindeerEars} 
                onClick={() => handleToggle('hideReindeerEars')}
                description="Elimina las orejas caídas del disfraz"
              />
              <ControlToggle 
                label="Cuernos Erguidos" 
                active={options.uprightAntlers} 
                onClick={() => handleToggle('uprightAntlers')}
                description="Mantiene los cuernos firmes y alzados"
              />
              <ControlToggle 
                label="Fijar Mirada a Cámara" 
                active={options.lookAtCamera} 
                onClick={() => handleToggle('lookAtCamera')}
                description="Fuerza contacto visual con el objetivo"
              />
              <ControlToggle 
                label="Integridad Fisionómica" 
                active={options.preservePhysiology} 
                onClick={() => handleToggle('preservePhysiology')}
                description="Prohibe alterar rasgos faciales reales"
              />
              <ControlToggle 
                label="Escena Limpia (Sin Perro)" 
                active={options.removeDog} 
                onClick={() => handleToggle('removeDog')}
                description="Elimina mascotas de la composición"
              />
              <ControlToggle 
                label="Añadir Tren de Juguete" 
                active={options.addToyTrain} 
                onClick={() => handleToggle('addToyTrain')}
                description="Detalle clásico bajo el árbol"
              />
            </div>
          </section>

          <button
            onClick={handleGenerate}
            disabled={status.loading || images.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              status.loading || images.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-red-700 text-white hover:bg-red-800 shadow-lg shadow-red-100 hover:shadow-red-200 active:scale-[0.98]'
            }`}
          >
            {status.loading ? (
              <><i className="fa-solid fa-circle-notch fa-spin"></i> Procesando Variables...</>
            ) : (
              <><i className="fa-solid fa-wand-sparkles"></i> Ejecutar Procesado</>
            )}
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-slate-900 rounded-[2rem] overflow-hidden aspect-[4/3] relative shadow-2xl border-8 border-white group">
            {!status.resultUrl && !status.loading && !status.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-slate-800 to-slate-900">
                <i className="fa-solid fa-images text-slate-700 text-6xl mb-6"></i>
                <h2 className="text-white text-2xl font-serif italic mb-2">Composición lista para procesar</h2>
                <p className="text-slate-400 text-sm max-w-sm">Suba sus fotografías y ajuste las variables técnicas para obtener un resultado profesional.</p>
              </div>
            )}

            {status.loading && (
              <div className="absolute inset-0 z-10 bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="w-32 h-32 border-4 border-red-900 border-t-red-600 rounded-full animate-spin"></div>
                  <i className="fa-solid fa-gear text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse"></i>
                </div>
                <h3 className="text-white text-xl font-bold tracking-tight">Aplicando Retoque Digital</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-slate-400 text-xs uppercase tracking-widest animate-pulse">Rectificando fisionomía...</p>
                  <p className="text-slate-500 text-[10px] italic">Preservando rasgos originales al 100%</p>
                </div>
              </div>
            )}

            {status.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center max-w-sm">
                  <i className="fa-solid fa-circle-exclamation text-red-500 text-4xl mb-4"></i>
                  <h3 className="text-white font-bold mb-2">Error de Procesamiento</h3>
                  <p className="text-slate-400 text-sm mb-6">{status.error}</p>
                  <button onClick={handleGenerate} className="w-full py-2 bg-red-700 text-white rounded-lg font-bold">Reintentar</button>
                </div>
              </div>
            )}

            {status.resultUrl && (
              <>
                <img src={status.resultUrl} className="w-full h-full object-cover" alt="Resultado" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button onClick={handleDownload} className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-110 transition-transform">
                    <i className="fa-solid fa-download"></i> Guardar PNG de Alta Calidad
                  </button>
                </div>
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                   <div className="glass px-4 py-2 rounded-full text-[10px] font-black text-red-800 flex items-center gap-2 uppercase tracking-tighter shadow-xl">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                      Retoque Profesional Finalizado
                   </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Modelo IA</span>
              <span className="text-slate-800 font-bold text-sm">Gemini 2.5 Image</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resolución</span>
              <span className="text-slate-800 font-bold text-sm">8K Nativo</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Licencia</span>
              <span className="text-slate-800 font-bold text-sm">Uso Profesional</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ControlToggle: React.FC<{ label: string; active: boolean; onClick: () => void; description: string }> = ({ label, active, onClick, description }) => (
  <div 
    onClick={onClick}
    className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
      active ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200 opacity-60'
    }`}
  >
    <div className="flex items-center justify-between mb-1">
      <span className={`text-sm font-bold ${active ? 'text-red-900' : 'text-slate-600'}`}>{label}</span>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-red-600' : 'bg-slate-300'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
      </div>
    </div>
    <p className="text-[10px] text-slate-500 leading-tight">{description}</p>
  </div>
);

export default App;
