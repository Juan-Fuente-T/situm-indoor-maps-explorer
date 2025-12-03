import { useMemo } from 'react';
import { useUIStore } from '../stores/uiStore';

export const useFilteredPois = () => {
    const currentFloor = useUIStore(state => state.currentFloor);
    const pois = useUIStore(state => state.pois);
    const selectedPoi = useUIStore(state => state.selectedPoi);

    const filteredPois = useMemo(() => {
        if (!pois || !currentFloor) return [];

        return pois
            .filter((poi) => poi.floorId === currentFloor.id)
            .sort((a, b) => {
                // PRIORIDAD: El POI seleccionado va AL FINAL (para que se pinte encima en el mapa)
                if (a.id === selectedPoi?.id) return 1;  // 'a' es el elegido -> échalo al fondo
                if (b.id === selectedPoi?.id) return -1; // 'b' es el elegido -> 'a' pasa delante

                // SECUNDARIO: Si ninguno es el seleccionado, ordena alfabéticamente (A-Z)
                return a.name.trim().localeCompare(b.name.trim());
            });
    }, [pois, currentFloor, selectedPoi]);
    return filteredPois;
}