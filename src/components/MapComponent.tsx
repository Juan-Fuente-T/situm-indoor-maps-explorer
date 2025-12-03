import { useState, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ErrorBoundary, FallbackComponent } from './ErrorBoundary';
import { useUIStore } from '../stores/uiStore';
import { useGetFloorImage } from '../hooks/useGetFloorImage';
import { useFilteredPois } from '../hooks/useFilteredPois';
import { useMapConfig } from '../hooks/useMapConfig';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

function MapComponent() {
    const currentFloor = useUIStore(state => state.currentFloor);
    const selectedPoi = useUIStore(state => state.selectedPoi);
    const building = useUIStore(state => state.building);
    const setSelectedPoi = useUIStore(state => state.setSelectedPoi);
    const setIsPopUpOpen = useUIStore(state => state.setIsPopupOpen);
    // Estado para controlar que poi está siendo hovered y resaltarlo
    const [hoveredPoiId, setHoveredPoiId] = useState<number | null>(null);
    // Referencia para visualizar el mapa
    const mapRef = useRef<MapRef>(null);

    // FILTRADO: Solo pasa al mapa los POIs de la planta actual
    const filteredPois = useFilteredPois();

    // Descarga la imagen al recibir mapUrl
    // const {blobUrl, isLoading, error} = useGetFloorImage();
    const { blobUrl } = useGetFloorImage();

    // Obtiene las coordenadas de la imagen del edificio
    const { initialViewState, imageCoordinates } = useMapConfig();

    // Guarda si la planta del edicio es "fuera" (está trayendo una imagen totalmente blanca)
    const isOutdoor = currentFloor?.name?.toLowerCase().includes('out');

    if (!building) {
        return <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center">Cargando mapa...</div>;
    }

    return (
        <div className="w-full h-full absolute inset-0">
            <Map
                ref={mapRef} //Vincula el mapa a esta referencia
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
                scrollZoom={false}
                onClick={(e) => {
                    e.preventDefault();
                    setSelectedPoi(null); // Al hacer click en el mapa, elimina el Poi seleccionado
                    setIsPopUpOpen(false); // Al hacer click en el mapa, cierra el popup
                }}
            >
                <NavigationControl position="top-right" />
                {/* --- CAPA DEL PLANO (RASTER) --- */}
                {imageCoordinates && blobUrl && !isOutdoor && (
                    <Source
                        key={blobUrl}
                        id="floorplan-source"
                        type="image"
                        url={blobUrl}
                        coordinates={imageCoordinates}
                    >
                        <Layer
                            id="floorplan-layer"
                            type="raster"
                            paint={{
                                'raster-opacity': 1,
                                'raster-fade-duration': 0
                            }}
                        // beforeId="waterway-name" // Intenta ponerlo debajo de las etiquetas si se puede
                        />
                    </Source>
                )}
                {/* --- DEBUG CORNERS: Para ver si la imagen cuadra con las esquinas teóricas --- */}
                {/* {building?.corners.map((corner, index) => (
                    <Marker
                        key={`corner-${index}`}
                        longitude={corner.lng}
                        latitude={corner.lat}
                        anchor="center"
                    >
                        <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-black z-50">
                            {index}
                        </div>
                    </Marker>
                ))} */}
                {/* Renderizado de POIs */}
                {filteredPois && filteredPois.map((poi) => {
                    // Busca coordenadas, por seguridad, y normaliza a lat/lng
                    const loc = poi.location;
                    if (!loc) return null;

                    const lat = loc.lat ?? loc.lat;
                    const lng = loc.lng ?? loc.lng;
                    if (isNaN(lat) || isNaN(lng)) return null;

                    // const situmColor = '#283380'
                    const isSelected = selectedPoi?.id === poi.id;
                    const isHovered = hoveredPoiId === poi.id; //Detecta si un Poi es el hovered
                    const iconColor = isSelected ? '#dc2626' : '#283380'; // Rojo si seleccionado, azul Situm normal
                    // --- Z-INDEX DINÁMICO ---
                    // Si un Poi es seleccionado o hovered, le da un zIndex mas alto (50) para hacerlo visible.
                    const markerZIndex = isSelected ? 50 : (isHovered ? 40 : 1);

                    //Crea los marcadores para cada POI
                    return (
                        <Marker
                            key={poi.id}
                            longitude={lng}
                            latitude={lat}
                            anchor="bottom"
                            style={{ zIndex: markerZIndex }}
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setIsPopUpOpen(true);
                                setSelectedPoi(poi)
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
                                className={`relative flex flex-col items-center cursor-pointer hover:scale-110 transition-transform group
                                ${isSelected ? 'scale-150 z-50' : 'hover:scale-110 z-10'}`}
                                title={poi.name}
                                onMouseEnter={() => setHoveredPoiId(poi.id)}
                                onMouseLeave={() => setHoveredPoiId(null)}
                            >
                                {/* TEXTO FLOTANTE:
                                - 'absolute': No empuja al icono.
                                - '-top-8': Se sube encima del icono.
                                - 'whitespace-nowrap': Evita que el texto se rompa en dos líneas.
                                */}
                                <span className={`absolute -top-7 bg-white px-1 lg:px-2 lg:py-1 rounded text-[9px] lg:text-xs font-bold shadow opacity-85 whitespace-nowrap pointer-events-none text-gray-800
                                ${isSelected ? 'block z-50' : 'hidden lg:block'}`}
                                >
                                    {poi.name}
                                </span>
                                {/* ✨ ICONO SVG PROFESIONAL:
                                    - Punta definida para precisión.
                                    - Sombra para contraste.
                                    - No depende de emojis del sistema operativo.
                                */}
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 md:h-6 md:w-6 xl:h-8 xl:w-8 transition-all duration-300"
                                    style={{
                                        fill: iconColor,
                                        stroke: 'white',
                                        strokeWidth: '2px',
                                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
                                        display: 'block' // Asegura que no tenga márgenes extraños
                                    }}
                                >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                    <circle cx="12" cy="9" r="2.5" fill="white" />
                                </svg>
                            </div>
                        </Marker>
                    );
                })}
            </Map>
        </div>
    );
}
// El Wrapper recibe los datos y se los pasa al MapComponent, protegiéndolo con el ErrorBoundary
const ComponentMapWrapper = () => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <MapComponent />
        </ErrorBoundary>
    );
};

export default ComponentMapWrapper;