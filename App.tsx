
import React, { useState, useEffect } from 'react';
import { ImageData, GenerationStatus, DynamicVariable } from './types';
import { analyzeScene, generateRefinedPhoto } from './services/geminiService';
import ImageUploader from './components/ImageUploader';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [variables, setVariables] = useState<DynamicVariable[]>([]);
  const [customVar, setCustomVar] = useState('');
  const [status, setStatus] = useState<GenerationStatus>({
    loading: false,
    analyzing: false,
    error: null,
    resultUrl: null,
  });

  // Automatically analyze when images are uploaded or changed
  useEffect(() => {
    if (images.length > 0 && variables.length === 0) {
      triggerAnalysis();
    } else if (images.length === 0) {
      setVariables([]);
    }
  }, [images.length]);

  const triggerAnalysis = async () => {
    setStatus(prev => ({ ...prev, analyzing: true, error: null }));
    try {
      const suggestions = await analyzeScene(images);
      setVariables(suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setStatus(prev => ({ ...prev, analyzing: false }));
    }
  };

  const toggleVariable = (id: string) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v));
  };

  const addCustomVariable = () => {
    if (!customVar.trim()) return;
    const newVar: DynamicVariable = {
      id: Math.random().toString(36).substr(2, 9),
      label: "Custom Adjustment",
      description: customVar,
      isActive: true,
      isAiGenerated: false
    };
    setVariables(prev => [newVar, ...prev]);
    setCustomVar('');
  };

  const handleGenerate = async () => {
    if (images.length === 0) return;
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await generateRefinedPhoto(images, variables);
      setStatus(prev => ({ ...prev, loading: false, resultUrl: result }));
    } catch (err: any) {
      setStatus(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const handleDownload = () => {
    if (!status.resultUrl) return;
    const link = document.createElement('a');
    link.href = status.resultUrl;
    link.download = 'ai_photo_pro.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200">
      {/* Dynamic Header */}
      <header className="border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <i className="fa-solid fa-bolt text-white text-sm"></i>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">DynamicStudio <span className="text-red-500">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
             {status.analyzing && (
               <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase animate-pulse">
                 <i className="fa-solid fa-brain"></i> Analizando escena...
               </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1a1d23] rounded-2xl border border-white/5 p-5">
            <ImageUploader images={images} setImages={setImages} />
          </div>

          <div className="bg-[#1a1d23] rounded-2xl border border-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Variables de Edición</h3>
              <button onClick={triggerAnalysis} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase transition-colors">
                Regenerar sugerencias
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {variables.length === 0 && !status.analyzing && (
                <p className="text-[11px] text-slate-500 italic py-4 text-center">Sube fotos para analizar variables profesionales.</p>
              )}

              {variables.map(v => (
                <div 
                  key={v.id} 
                  onClick={() => toggleVariable(v.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    v.isActive ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold ${v.isActive ? 'text-red-400' : 'text-slate-400'}`}>
                      {v.isAiGenerated && <i className="fa-solid fa-sparkles mr-2 text-[8px]"></i>}
                      {v.label}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${v.isActive ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-700'}`}></div>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight">{v.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customVar}
                  onChange={(e) => setCustomVar(e.target.value)}
                  placeholder="Añadir variable personalizada..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-red-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomVariable()}
                />
                <button 
                  onClick={addCustomVariable}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={status.loading || images.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 ${
              status.loading || images.length === 0
                ? 'bg-slate-800 text-slate-600'
                : 'bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-900/20'
            }`}
          >
            {status.loading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Procesando Fotografía</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles"></i> Generar Arte</>
            )}
          </button>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#1a1d23] rounded-[2rem] border border-white/10 aspect-[4/3] relative overflow-hidden group">
            {!status.resultUrl && !status.loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-image text-slate-600 text-2xl"></i>
                </div>
                <h2 className="text-xl font-medium text-white mb-2">Editor Fotográfico IA</h2>
                <p className="text-slate-500 text-xs max-w-xs">Análisis de escena en tiempo real para retoques de precisión profesional.</p>
              </div>
            )}

            {status.loading && (
              <div className="absolute inset-0 z-10 bg-[#0f1115]/80 backdrop-blur-xl flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-24 h-24 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                  <i className="fa-solid fa-microchip text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl animate-pulse"></i>
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Sincronizando fisionomía...</p>
              </div>
            )}

            {status.resultUrl && (
              <>
                <img src={status.resultUrl} className="w-full h-full object-cover" alt="Resultado" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={handleDownload} className="bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                    <i className="fa-solid fa-download mr-2"></i> Descargar Exportación
                  </button>
                </div>
              </>
            )}

            {status.error && (
               <div className="absolute inset-0 flex items-center justify-center p-12 bg-red-950/20">
                  <div className="text-center">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl mb-4"></i>
                    <p className="text-red-400 text-xs font-bold">{status.error}</p>
                  </div>
               </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="fa-fingerprint" label="Identidad" value="Protegida" />
            <StatCard icon="fa-expand" label="Escalado" value="8K AI" />
            <StatCard icon="fa-droplet" label="Color" value="HDR Studio" />
            <StatCard icon="fa-shield" label="Datos" value="Encriptado" />
          </div>
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-[#1a1d23] border border-white/5 p-4 rounded-2xl text-center">
    <i className={`fa-solid ${icon} text-slate-600 text-sm mb-2`}></i>
    <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-white text-[10px] font-bold">{value}</span>
  </div>
);

export default App;
