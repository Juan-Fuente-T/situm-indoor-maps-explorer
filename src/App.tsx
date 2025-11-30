import { useEffect, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import { ErrorBoundary, FallbackComponent } from './components/ErrorBoundary';
import { useUIStore } from './stores/uiStore';
import { useGetBuildingById } from './hooks/useGetBuildingById';
import { useGetPois } from './hooks/useGetPois';

const TARGET_ID = import.meta.env.VITE_APP_SITUM_BUILDING_ID;

/**
 * Componente principal de la aplicación.
 * Se encarga de renderizar la lista lateral de POIs y el mapa en la parte derecha.
 * Se utiliza el hook useState para almacenar los datos de la API y el estado de la aplicación.
 * Se utiliza el hook useEffect para inicializar la API y obtener los datos del edificio y los POIs.
 * Se utiliza el hook useMemo para filtrar los POIs por planta y mostrarlos en la lista lateral.
 */
function App() {
  const { isLoading: loadingBuilding, error: errorBuilding } = useGetBuildingById(TARGET_ID);
  const { isLoading: loadingPois, error: errorPois } = useGetPois();

  const building = useUIStore(s => s.building);
  const pois = useUIStore(s => s.pois);
  const currentFloor = useUIStore(state => state.currentFloor);
  const selectedPoi = useUIStore(state => state.selectedPoi);

  const setCurrentFloor = useUIStore(s => s.setCurrentFloor);
  const setSelectedPoi = useUIStore(s => s.setSelectedPoi);

  // Effect para el SCROLL AUTO de elementos en la lista lateral al ser seleccionados
  useEffect(() => {
    if (selectedPoi) {
      // SCROLL AUTOMÁTICO - Busca el elemento en el DOM por su ID y lo centra en la vista
      const element = document.getElementById(`poi-item-${selectedPoi.id}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [selectedPoi]);

  // FILTRADO: Solo pasa al mapa y a la lista los POIs de la planta actual
  const filteredPois = useMemo(() => {
    if (!pois || !currentFloor) return [];
    // ORDENACIÓN ALFABÉTICA (A-Z) - Permite al usuario encontrar "Baños" o "Entrada" rápidamente.
    return pois
      .filter(poi => poi.floorId === currentFloor.id)
      .sort((a, b) => a.name.trim().localeCompare(b.name.trim()));
  }, [pois, currentFloor]);

  // --- RENDER ---
  const isLoading = loadingBuilding || (loadingPois && !pois.length);
  const error = errorBuilding || errorPois;

  if (isLoading && !building)
    return <div className="h-screen flex items-center justify-center animate-pulse text-gray-500">
      Cargando Situm...
    </div>;
  if (error) 
    return <div className="p-10 text-red-600 border border-red-200 bg-red-50 rounded m-10">
      Error: {error instanceof Error ? error.message : "Error desconocido"}
    </div>;
  if (!building) return null;


  // const situmColor = '#283380'
  return (
    <div className="p-10 w-full text-[#283380]">
      <div>
        <h1 className="text-2xl font-bold mb-8">Prueba Técnica Situm (Juan Fuente)</h1>
      </div>
      <div className="flex p-10 font-sans w-full border border-gray-800 rounded-lg gap-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
          </div>
        )}

        {!building && !error && <p>Cargando datos de la API...</p>}

        {building && (
          <div className="border border-gray-800 w-1/3 bg-gray-200 p-6 rounded">
            {/* COLUMNA IZQUIERDA */}
            <div className="bg-white border rounded-lg shadow p-2 gap-2 flex-1 flex flex-col overflow-hidden">
              <h2 className="text-xl font-semibold">{building.name}</h2>
              <p className="text-gray-600">Edificio ID: {building.id}</p>

              {/* Selector de Plantas */}
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">Plantas</h3>
                <div className="flex flex-wrap gap-2">
                  {building.floors.map(floor => (
                    <button
                      key={floor.id}
                      onClick={() => setCurrentFloor(floor)}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${currentFloor?.id === floor.id
                        ? 'bg-[#283380] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {floor.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Lista Filtrada */}
            <div className="bg-white mt-4 border rounded-lg shadow flex-1 flex flex-col  overflow-y-auto max-h-[665px] pr-2">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-bg-[#283380]">Planta {currentFloor?.name}</h2>
                <p className="text-xs text-gray-500">
                  {filteredPois.length} POIs en planta {currentFloor?.name}
                </p>
              </div>

              {/* Contenedor con scroll para evitar listado demasiado largo*/}
              <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                {filteredPois.map(poi => {
                  const isSelected = selectedPoi?.id === poi.id;

                  return (
                    <div
                      // Id para poder centrar el scroll y mostrar el elemento seleccionado de la lista
                      id={`poi-item-${poi.id}`}
                      key={poi.id}
                      onClick={() => setSelectedPoi(poi)}
                      // Si está seleccionado, fondo azul situm y letra blanca
                      className={`p-3 rounded-md cursor-pointer transition-all border ${isSelected
                        ? 'bg-[#283380] border-[#283380] shadow-sm translate-x-1'
                        : 'bg-[#283380]/10 border-transparent hover:bg-[#283380]/30  hover:border-[#283380]/80'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Punto indicador de estado */}
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-300'}`} />
                        <div className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                          {poi.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredPois.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No hay puntos de interés en esta planta.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* COLUMNA DERECHA: Mapa */}
        <div className="w-full border border-gray-800 rounded shadow-lg relative overflow-hidden bg-gray-200">
          {/* <div className="w-full h-fit border border-gray-800 rounded shadow-lg bg-gray-200 relative overflow-hidden p-2"> */}
          <MapComponent filteredPois={filteredPois} />
        </div>
      </div>
    </div>
  );
}

// El Wrapper recibe App protegiéndola con el ErrorBoundary
const AppWrapper = () => {
  return (
    <ErrorBoundary fallback={<FallbackComponent />}>
      <App />
    </ErrorBoundary>
  );
};

export default AppWrapper;