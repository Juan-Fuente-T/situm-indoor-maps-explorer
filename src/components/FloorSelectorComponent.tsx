import { useUIStore } from '../stores/uiStore';
import { ErrorBoundary, FallbackComponent } from '../components/ErrorBoundary';


// --- SUB-COMPONENTE 1 de SidebarComponent: El Selector de Pisos ---
const FloorSelectorComponent = () => {
    const building = useUIStore(s => s.building);
    const currentFloor = useUIStore(s => s.currentFloor);
    const setCurrentFloor = useUIStore(s => s.setCurrentFloor);
    const setIsPopupOpen = useUIStore((state) => state.setIsPopupOpen);

    if (!building) return null;

    return (
        <div className="bg-white shadow p-2 gap-2 flex-none flex flex-col m-1">
            <div className='flex justify-between items-center'>
            <div>
                <h2 className="text-xl font-semibold">{building.name}</h2>
            <p className="text-gray-600">Edificio ID: {building.id}</p>
                </div>
                <img src="/situm-icon.svg" alt="close icon" className="w-10 h-10" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">Plantas</h3>
                <div className="flex flex-wrap gap-2">
                    {building.floors.map(floor => (
                        <button
                            key={floor.id}
                            onClick={() => {setCurrentFloor(floor); setIsPopupOpen(false);}}
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
    );
};


const FloorSelectorComponentWrapper = () => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <FloorSelectorComponent />
        </ErrorBoundary>
    );
};

export default FloorSelectorComponentWrapper;