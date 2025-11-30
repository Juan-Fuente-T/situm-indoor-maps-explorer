import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetBuildingById } from '../useGetBuildingById';
import { createMockBuilding} from '../../test/mocks';


// --- SOLUCIÓN 'HOISTED' (El Joystick) ---
// Usamos vi.hoisted para crear la función espía ANTES que nada.
// Esto evita el error "Cannot access before initialization".
const { mockGetBuildingById } = vi.hoisted(() => {
  return { mockGetBuildingById: vi.fn() };
});

// Mockeamos el SDK usando la variable que acabamos de elevar (hoist)
vi.mock('@situm/sdk-js', () => {
  return {
    default: class MockSitumSDK {
      cartography = {
        getBuildingById: mockGetBuildingById
      };
      // Constructor vacío para que 'new SitumSDK()' funcione en tu código real
      constructor() {}
    }
  };
});

// Wrapper para que React Query funcione en los tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Sin reintentos para fallar rápido si hay error
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGetBuildingById Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería obtener y devolver el edificio correctamente', async () => {
    // Datos simulados)
    const mockBuilding = createMockBuilding({id: 7033, name: 'Edificio de Prueba'});

    // Configuramos qué debe responder el mock
    mockGetBuildingById.mockResolvedValue(mockBuilding);

    // Ejecuta el hook
    const { result } = renderHook(() => useGetBuildingById(7033), {
      wrapper: createWrapper()
    });

    // Empieza cargando
    expect(result.current.isLoading).toBe(true);

    // Espera a que termine
    // await waitFor(() => expect(result.current.error).toBe(false));//no funciona, si no hay error es null
    await waitFor(() => expect(result.current.isLoading).toBe(false));

      // FIX: El error es null cuando todo va bien, no false
    expect(result.current.error).toBeNull();

    // Verifica que los datos del hook coinciden con el mock
    expect(result.current.building).toEqual(expect.objectContaining({
      id: 7033,
      name: 'Edificio de Prueba'
    }));

    // Verifica que se llamó a la función con el ID 7033
    expect(mockGetBuildingById).toHaveBeenCalledWith(7033);
  });
});