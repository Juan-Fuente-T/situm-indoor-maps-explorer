// @react-compilation-disable
import { useMemo, useEffect, useState, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ErrorBoundary, FallbackComponent } from './ErrorBoundary';
import PopupComponent from './PopupComponent.tsx';
import checkImage from '../utils/checkImage.ts'
import { useUIStore } from '../stores/uiStore';
import type { Poi } from "../types/situmTypes";

interface MapProps {
    filteredPois: Poi[]
}

// Estilo base
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

function MapComponent({ filteredPois }: MapProps) {
    const { building, currentFloor, selectedPoi, setSelectedPoi } = useUIStore();
    const [, setImageOK] = useState<boolean | null>(null);
    const mapRef = useRef<MapRef>(null);

    //Valida la imagen al recibir mapUrl
    useEffect(() => {
        const url = currentFloor?.maps?.map_url; //Url de la imagen del edificio
        if (!url) {
            console.warn("❌ No existe mapUrl en este floor.");
            return;
        }

        checkImage(url).then((valid) => {
            if (!valid) {
                console.error("❌ La imagen del piso es inválida o está corrupta:", url);
                setImageOK(false);
            }
            else {
                console.log("✅ Imagen válida:", url);
                setImageOK(true);
            }
        });
    }, [currentFloor?.maps?.map_url]);

    // EXTRACCIÓN DE PRIMITIVOS:
    // Extrae los valores necesarios para satisfacer al linter/compilador de React
    // y evitar que se queje de dependencias incorrectas en los useMemo.
    const buildingLat = building?.location?.lat;
    const buildingLng = building?.location?.lng;
    const buildingRotation = building?.rotation;
    const buildingCorners = building?.corners;
    // const buildingId = building?.id;

    const initialViewState = useMemo(() => {
        const rotationDegrees = buildingRotation ? (buildingRotation * 180) / Math.PI : 0;
        console.log("📐 Rotación calculada (Grados):", rotationDegrees);
        // Usa las coordenadas del edificio para centrar el mapa
        if (buildingLat && buildingLng) {
            console.log("Centrando mapa en:", buildingRotation);
            return {
                longitude: buildingLng, // -8.42497...
                latitude: buildingLat,  // 43.35213...
                zoom: 18.25, // Zoom alto para ver el edificio
                bearing: rotationDegrees, // Rota el mapa para que se vea recto
                pitch: 0
            };
        }

        // Fallback solo si los datos vienen corruptos
        // return { longitude: -3.7037, latitude: 40.4167, zoom: 15 };
        return { longitude: -8.426001, latitude: 43.352942, zoom: 15 };
    }, [buildingLat, buildingLng, buildingRotation]);

    // Coordenadas de la imagen (Los 4 puntos para estirar el plano)
    // Desactivado el linter para esta función en la linea 1 el para evitar problemas con el compilador
    const imageCoordinates = useMemo(() => {
        // MapLibre ImageSource espera: [TopLeft, TopRight, BottomRight, BottomLeft]
        // Situm devuelve 'corners'. Asume el orden y mapear lat/lng.
        if (!buildingCorners || buildingCorners.length < 4) return undefined;

        const c = buildingCorners;
        // Mapeo directo: [lng, lat]
        const coordenadas = [
            [c[3].lng, c[3].lat], // NW
            [c[2].lng, c[2].lat], // NE
            [c[1].lng, c[1].lat], // SE
            [c[0].lng, c[0].lat]  // SW
        ];
        // Casting explícito a Tupla de 4 elementos.
        return coordenadas as [[number, number], [number, number], [number, number], [number, number]];
    }, [building?.id]);


    const floorMapUrl = currentFloor?.maps?.map_url; // URL de la imagen del piso actual

    if (!building) {
        return <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center">Cargando mapa...</div>;
    }

    return (
        // Se usan estilos inline para evitar posibles problemas con el renderizado del mapa si React renderiza antes el mapa que los estilos de Tailwind.
        <div style={{ height: '900px', width: '100%', position: 'relative', border: '1px solid #ccc', justifyContent: 'center', margin: 'auto' }}>
            <Map
                ref={mapRef} //Vincula el mapa a esta referencia
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
                scrollZoom={false}
                onClick={(e) => {
                    e.preventDefault();
                    setSelectedPoi(null); // Al hacer click en el mapa, cierra el popup
                }}
            >
                <NavigationControl position="top-right" />
                {/* --- CAPA DEL PLANO (RASTER) --- */}
                {/* IMAGEN DE PLANO NO SE MUESTRA (URL ROTA) */}
                {imageCoordinates && floorMapUrl && (
                    <Source
                        key={floorMapUrl}
                        id="floorplan-source"
                        type="image"
                        url={floorMapUrl}
                        coordinates={imageCoordinates}
                    >
                        <Layer
                            id="floorplan-layer"
                            type="raster"
                            paint={{
                                'raster-opacity': 1,
                                'raster-fade-duration': 0
                            }}
                            beforeId="waterway-name" // Intenta ponerlo debajo de las etiquetas si se puede
                        />
                    </Source>
                )}

                {/* Renderizado de POIs */}
                {filteredPois && filteredPois.map((poi) => {
                    // Busca coordenadas en 'location' o 'position' (por seguridad)
                    // Normaliza a lat/lng o latitude/longitude
                    const loc = poi.location;

                    if (!loc) return null;

                    const lat = loc.lat ?? loc.lat;
                    const lng = loc.lng ?? loc.lng;
                    if (isNaN(lat) || isNaN(lng)) return null;

                    // const situmColor = '#283380'
                    const isSelected = selectedPoi?.id === poi.id;
                    const iconColor = isSelected ? '#dc2626' : '#283380'; // Rojo si seleccionado, azul Situm normal

                    //Crea los marcadores para cada POI
                    return (
                        <Marker
                            key={poi.id}
                            longitude={lng}
                            latitude={lat}
                            anchor="bottom"
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setSelectedPoi(poi);
                                console.log("Click en POI:", poi.name);
                                // Centrado - Al hacer clic, manda al mapa a volar a las coordenadas del POI
                                // Desactivado por conseiderarse poco util al usuario
                                // mapRef.current?.flyTo({
                                //     center: [lng, lat],
                                //     zoom: 19, // Acercamos un poco más para ver detalle
                                //     duration: 1200, // Duración suave (1.2s)
                                //     essential: true
                                //     });
                            }}
                        >
                            <div
                                className={`text-xl cursor-pointer hover:scale-110 transition-transform relative group flex justify-center
                                ${selectedPoi?.id === poi.id ? 'scale-150 z-50' : 'hover:scale-110 z-10'}`}
                                title={poi.name}
                            >
                                {/* ✨ ICONO SVG PROFESIONAL:
                                    - Punta definida para precisión.
                                    - Sombra para contraste.
                                    - No depende de emojis del sistema operativo.
                                */}
                                <svg
                                    height="30"
                                    viewBox="0 0 24 24"
                                    style={{
                                        fill: iconColor,
                                        stroke: 'white',
                                        strokeWidth: '2px',
                                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'
                                    }}
                                >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                    <circle cx="12" cy="9" r="2.5" fill="white" />
                                </svg>

                                {/* Nombre flotante */}<span className="bg-white px-1 rounded text-sm font-bold shadow opacity-75">
                                    {poi.name}
                                </span>
                            </div>
                        </Marker>
                    );
                })}
                {selectedPoi && <PopupComponent />}
            </Map>
        </div>
    );
}
// El Wrapper recibe los datos y se los pasa al MapComponent, protegiéndolo con el ErrorBoundary
const ComponentMapWrapper = ({ filteredPois }: MapProps) => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <MapComponent filteredPois={filteredPois} />
        </ErrorBoundary>
    );
};

export default ComponentMapWrapper;