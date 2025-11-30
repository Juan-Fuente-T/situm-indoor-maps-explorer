import { useEffect, useRef, useMemo } from 'react';
import { ErrorBoundary, FallbackComponent } from '../components/ErrorBoundary';
import { useUIStore } from '../stores/uiStore';

// --- SUB-COMPONENTE 1 de SidebarComponent: El Selector de Pisos ---
const PoisListComponent = () => {
    const building = useUIStore(s => s.building);
    const pois = useUIStore((state) => state.pois);
    const currentFloor = useUIStore((state) => state.currentFloor);
    const selectedPoi = useUIStore((state) => state.selectedPoi);

    const setSelectedPoi = useUIStore((state) => state.setSelectedPoi);

    // Referencia para el scroll automático
    const itemRefs = useRef<Map<number, HTMLLIElement>>(new Map());

    // FILTRADO: Solo pasa a la lista los POIs de la planta actual
    const filteredPois = useMemo(() => {
        if (!pois || !currentFloor) return [];
        // ORDENACIÓN ALFABÉTICA (A-Z) - Permite al usuario encontrar "Baños" o "Entrada" rápidamente.
        return pois
            .filter((poi) => poi.floorId === currentFloor.id)
            .sort((a, b) => a.name.trim().localeCompare(b.name.trim()));
    }, [pois, currentFloor]);

    // Efecto para el SCROLL AUTO de elementos en la lista lateral al ser seleccionados
    useEffect(() => {
        if (selectedPoi) {
            if (selectedPoi && itemRefs.current.has(selectedPoi.id)) {
                itemRefs.current.get(selectedPoi.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    }, [selectedPoi]);

    if (!currentFloor) {
        return (
            <div className="w-80 h-full bg-white border-r border-gray-200 p-4 flex items-center justify-center text-gray-400">
                <p>Cargando planta...</p>
            </div>
        );
    }

    if (!building) return null;

    return (
        <div className="w-full flex-1 min-h-0 bg-white border-r border-gray-200 rounded flex flex-col shadow-xl z-10 overflow-hidden">
            {/* Cabecera de lista */}
            <div className="flex-none p-4 border-b border-[#283380] bg-gray-50">
                <h2 className="font-bold text-[#283380] text-lg">
                    Planta: <span className="font-medium text-blue-600">Nivel {currentFloor.level}</span>
                </h2>
                <p className="text-xs text--400 mt-1"><strong>{filteredPois.length} Puntos de interés</strong></p>
            </div>

            {/* Lista con Scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <ul className="divide-y divide-gray-100 flex flex-col gap-1 m-1 pb-4">
                    {filteredPois.map((poi) => {
                        const isSelected = selectedPoi?.id === poi.id;

                        return (
                            <li
                                key={poi.id}
                                ref={(el) => {
                                    if (el) itemRefs.current.set(poi.id, el);
                                    else itemRefs.current.delete(poi.id);
                                }}
                                onClick={() => setSelectedPoi(poi)}
                                className={`
                p-3 cursor-pointer rounded-md transition-all duration-200
                ${isSelected ? 'bg-[#283380] border-[#283380] shadow-sm translate-x-1'
                                        : 'bg-[#283380]/10 border-transparent hover:bg-[#283380]/30  hover:border-[#283380]/80'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`gap-3 w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#283380]'}`} />
                                    <div className={`ml-2 font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                        {poi.name}
                                    </div>
                                </div>

                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

const PoisListComponentWrapper = () => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <PoisListComponent />
        </ErrorBoundary>
    );
};

export default PoisListComponentWrapper;