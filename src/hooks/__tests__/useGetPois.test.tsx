import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetPois } from '../useGetPois';
import { useUIStore } from '../../stores/uiStore'; // Importamos el store real
import { createMockBuilding, createMockPoi } from '../../test/mocks';
import type { Building } from '@situm/sdk-js';

// --- MOCK DEL SDK (Patrón Hoisted) ---
const { mockGetPois } = vi.hoisted(() => {
    return { mockGetPois: vi.fn() };
});

vi.mock('@situm/sdk-js', () => {
    return {
        default: class MockSitumSDK {
            cartography = {
                getPois: mockGetPois
            };
            constructor() { }
        }
    };
});

// Wrapper de React Query
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useGetPois Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Limpia el Store antes de cada test
        useUIStore.setState({ building: null, pois: [] });
    });

    it('NO debería llamar al SDK si no hay un edificio seleccionado (enabled: false)', () => {
        // Estado inicial: Store vacío (building = null)

        const { result } = renderHook(() => useGetPois(), {
            wrapper: createWrapper()
        });

        // Verifica que NO está cargando (porque está deshabilitado)
        expect(result.current.isLoading).toBe(false);

        // Verifica que NO se ha llamado al SDK
        expect(mockGetPois).not.toHaveBeenCalled();
    });

    it('debería descargar y guardar los POIs cuando hay un edificio (enabled: true)', async () => {
        // PREPARACIÓN: Inyectaun edificio en el Store para "activar" el hook
        const mockBuilding = createMockBuilding({ id: 7033 });
        useUIStore.setState({ building: mockBuilding as Building });

        // Prepara la respuesta falsa del SDK
        const mockPoisData = [
            createMockPoi({ id: 10, name: 'Cafetería' }),
            createMockPoi({ id: 20, name: 'Baños' })
        ];
        mockGetPois.mockResolvedValue(mockPoisData);

        // EJECUCIÓN
        const { result } = renderHook(() => useGetPois(), {
            wrapper: createWrapper()
        });

        // VERIFICACIÓN (Fase de carga)
        // Al principio debería estar cargando porque ya detectó el edificio
        expect(result.current.isLoading).toBe(true);

        // VERIFICACIÓN (Fase de éxito)
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Comprobar que no hubo errores
        expect(result.current.error).toBeNull();

        // Comprobar que se llamó al SDK con el ID del edificio
        expect(mockGetPois).toHaveBeenCalledWith({ buildingId: 7033 });

        // VERIFICACIÓN DE EFECTO COLATERAL (Side Effect)
        // El hook debería haber guardado los POIs en el Store automáticamente
        const storeState = useUIStore.getState();
        expect(storeState.pois).toHaveLength(2);
        expect(storeState.pois[0].name).toBe('Cafetería');
    });
});