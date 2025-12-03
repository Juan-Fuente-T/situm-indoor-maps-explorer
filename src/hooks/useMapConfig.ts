import { useMemo } from 'react';
import { useUIStore } from '../stores/uiStore';

export const useMapConfig = () => {
    const building = useUIStore(state => state.building);
    const buildingLat = building?.location?.lat;
    const buildingLng = building?.location?.lng;
    const buildingRotation = building?.rotation;

    const initialViewState = useMemo(() => {
        const rotationDegrees = buildingRotation ? (buildingRotation * 180) / Math.PI : 0;

        // --- LÓGICA DE ZOOM RESPONSIVE ---
        let responsiveZoom = 18; // Default (Pantallas grandes)
        const width = window.innerWidth;

       // LÓGICA DE ESCALONES (BREAKPOINTS)
        if (width < 500) {
            // Móvil pequeño (iPhone SE, Androids viejos)
            responsiveZoom = 16.2;
        } else if (width < 768) {
            // Móvil grande / Horizontal (El escalón que pedías)
            responsiveZoom = 16.8;
        } else if (width < 1280) {
            // Tablet y Portátiles pequeños (MacBook Air 13", iPad)
            // Aquí el Sidebar quita espacio, así que 17.4 es perfecto
            responsiveZoom = 17.4;
        }
        // Más de 1280px se queda en 18

        // Usa las coordenadas del edificio para centrar el mapa
        if (buildingLat && buildingLng) {
            return {
                longitude: buildingLng, // -8.42497...
                latitude: buildingLat,  // 43.35213...
                zoom:  responsiveZoom, // Zoom alto para ver el edificio
                bearing: rotationDegrees, // Rota el mapa para que se vea recto
                pitch: 0
            };
        }

        // Fallback solo si los datos vienen corruptos
        // return { longitude: -3.7037, latitude: 40.4167, zoom: 15 };
        return { longitude: -8.426001, latitude: 43.352942, zoom: 15 };
    }, [buildingLat, buildingLng, buildingRotation]);

    const imageCoordinates = useMemo(() => {
        if (!building?.corners || building.corners.length < 4) return null;

        const c = building.corners;

        // MapLibre ImageSource espera: [TopLeft, TopRight, BottomRight, BottomLeft]
        // Y SIEMPRE en formato [Longitud, Latitud]

        return [
            [c[0].lng, c[0].lat], // NW (Arriba Izquierda)
            [c[1].lng, c[1].lat], // NE (Arriba Derecha)
            [c[2].lng, c[2].lat], // SE (Abajo Derecha)
            [c[3].lng, c[3].lat]  // SW (Abajo Izquierda)
        ] as [[number, number], [number, number], [number, number], [number, number]];

    }, [building]);

    return { initialViewState, imageCoordinates };
}