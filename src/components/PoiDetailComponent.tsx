import { Cross2Icon, LayersIcon } from '@radix-ui/react-icons'; // Iconos de librería (Cumple requisito)
import { useUIStore } from '../stores/uiStore';
import { ErrorBoundary, FallbackComponent } from '../components/ErrorBoundary';

export const PoiDetailComponent = () => {
    const selectedPoi = useUIStore((state) => state.selectedPoi);
    const isPopupOpen = useUIStore((state) => state.isPopupOpen);
    const setSelectedPoi = useUIStore((state) => state.setSelectedPoi);
    const setIsPopupOpen = useUIStore((state) => state.setIsPopupOpen);
    const currentFloor = useUIStore((state) => state.currentFloor);

    if (!isPopupOpen) return null;

    return (
        // COMPONENTE FLOTANTE PURO (Sin líos sobre el mapa de Radix)
        // Se coloca centrado, no demasiado abajo, a causa de ciertos popover demasiado pequeños
        // <div className="absolute top-32 right-6 left-auto  md:w-96 z-[50] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 md:w-96 z-[50] animate-in fade-in slide-in-from-bottom-4 duration-300">

            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col">

                {/* Cabecera Azul Corporativa */}
                <div className="bg-[#283380] p-4 flex justify-between items-start relative">
                    <div className="pr-8">
                        <h3 className="text-lg font-bold text-white leading-tight">
                            {selectedPoi?.name}
                        </h3>
                        {selectedPoi?.categoryName && (
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded font-semibold">
                                {selectedPoi?.categoryName}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => { setIsPopupOpen(false); setSelectedPoi(null) }}
                        className="absolute top-3 right-3 text-[#283380] hover:text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                        aria-label="Cerrar"
                    >
                        <Cross2Icon className="w-5 h-5" />
                    </button>
                </div>

                {/* Cuerpo de Información */}
                <div className="p-4 text-sm text-gray-600">

                    {/* Metadatos (Planta) */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                        {/* Icono de planta/piso */}
                        <LayersIcon className="w-4 h-4 text-[#283380]" />
                        <span>Planta: <strong className="text-gray-700">{currentFloor?.name || `Nivel ${selectedPoi?.floorId}`}</strong></span>
                    </div>

                    {/* Descripción (HTML Renderizado) */}
                    {selectedPoi?.info ? (
                        <div
                            className="prose prose-sm max-w-none text-gray-600 leading-relaxed overflow-y-auto  pr-1 custom-scrollbar"
                            // Renderiza la información adicional usando el dangerouslySetInnerHTML que evita la inyección de HTML
                            dangerouslySetInnerHTML={{ __html: selectedPoi.info }}
                        />
                    ) : (
                        <p className="italic text-gray-400">Sin información adicional.</p>
                    )}

                </div>
            </div>
        </div>
    );
};


const PoiDetailComponentWrapper = () => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <PoiDetailComponent />
        </ErrorBoundary>
    );
};

export default PoiDetailComponentWrapper;