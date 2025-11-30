import { ErrorBoundary, FallbackComponent } from '../components/ErrorBoundary';
import FloorSelectorComponent from './FloorSelectorComponent';
import PoisListComponent from './PoisListComponent';

const SidebarComponent = () => {
    return (
        // <div className="bg-white border border-gray-800 rounded flex flex-col shadow-xl z-10 relative">
        <div className="h-full w-full bg-white border border-gray-800 rounded flex flex-col shadow-xl z-10 overflow-hidden relative">
            {/* 1. Cabecera fija con el selector de plantas */}
            <FloorSelectorComponent />

            {/* 2. Cuerpo flexible con la lista */}
            <PoisListComponent />
        </div>
    )
}

const SidebarComponentWrapper = () => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <SidebarComponent />
        </ErrorBoundary>
    );
};

export default SidebarComponentWrapper;