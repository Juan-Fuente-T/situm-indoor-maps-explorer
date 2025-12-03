import MapComponent from './components/MapComponent';
import SidebarComponent from './components/SidebarComponent';
import { ErrorBoundary, FallbackComponent } from './components/ErrorBoundary';
import { useUIStore } from './stores/uiStore';
import { useGetBuildingById } from './hooks/useGetBuildingById';
import { useGetPois } from './hooks/useGetPois';
import PoiDetailComponent from './components/PoiDetailComponent.tsx';

const TARGET_ID = import.meta.env.VITE_APP_SITUM_BUILDING_ID;

/**
 * Componente principal de la aplicación.
 * Se encarga de renderizar el mapa y la barra lateral y manejar los errores
 */
function App() {
  const { isLoading: loadingBuilding, error: errorBuilding } = useGetBuildingById(TARGET_ID);
  const { isLoading: loadingPois, error: errorPois } = useGetPois();

  const building = useUIStore(s => s.building);
  const pois = useUIStore(s => s.pois);

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
    <div className="bg-gray-100 flex flex-col items-center justify-center p-2 md:p-6 text-[#283380]">
    {/*Título*/}
      <div className="mb-6 text-center">
        <h1 className="text-lg md:text-2xl font-bold md:mb-8">Prueba Técnica Situm (Juan Fuente)</h1>
      </div>
      <div className="w-full max-w-[1600px] px-2 md:px-6 lg:py-6 lg:border lg:border-[#283380] rounded-lg">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
          </div>
        )}

        {!building && !error && <p>Cargando datos de la API...</p>}

        {building && (
          <div className="flex flex-col-reverse lg:flex-row gap-1 lg:gap-6 w-full md:max-w-[1600px] h-[93vh] lg:h-auto overflow-hidden  border border-gray-800 bg-gray-200 p-2 rounded">
            {/* COLUMNA IZQUIERDA: Selector de plantas y Lista Filtrada */}
            <div className="flex-1 lg:flex-none min-h-0 w-full lg:w-60 xl:w-80 flex-shrink-0 lg:h-[840px] overflow-hidden">
              <SidebarComponent />
            </div>

            {/* COLUMNA DERECHA: Mapa */}
            {/* <div className="h-[40%] lg:h-[840px] w-full flex-none lg:flex-1 border border-gray-800 rounded shadow-lg overflow-hidden bg-gray-200 relative"> */}
            <div className="h-[30vh] sm:h-[45vh] min-h-[300px] lg:h-[840px] w-full flex-none lg:flex-1 border border-gray-800 rounded shadow-lg overflow-hidden bg-gray-200 relative">
              <MapComponent />
              <PoiDetailComponent />
            </div>
          </div>
        )}
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