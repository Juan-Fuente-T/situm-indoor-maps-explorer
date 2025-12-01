import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../uiStore';
import type { Building, Floor, Poi } from '@situm/sdk-js';
import { createMockFloor, createMockBuilding, createMockPoi } from '../../test/mocks';

describe('UI Store (Zustand)', () => {
  // Reiniciamos el estado antes de cada test para empezar limpios
  beforeEach(() => {
    useUIStore.setState({
      building: null,
      pois: [],
      currentFloor: null,
      selectedPoi: null
    });
  });

  it('debería inicializarse vacío', () => {
    const state = useUIStore.getState();
    expect(state.building).toBeNull();
    expect(state.pois).toEqual([]);
  });

  it('debería actualizar el edificio (setBuilding)', () => {
    const mockBuilding = createMockBuilding({ name: 'Edificio Real' });

    useUIStore.getState().setBuilding(mockBuilding as Building);

    const state = useUIStore.getState();
    expect(state.building).toEqual(mockBuilding);
  });

  it('debería guardar la lista de POIs (setPois)', () => {
    const mockPois = [
      createMockPoi({ id: 1, name: 'Baño' }),
      createMockPoi({ id: 2, name: 'Entrada' })
    ];

    useUIStore.getState().setPois(mockPois as Poi[]);

    const state = useUIStore.getState();
    expect(state.pois).toHaveLength(2);
    expect(state.pois[0].name).toBe('Baño');
    expect(state.pois[1].name).toBe('Entrada');
  });

  it('debería seleccionar un POI específico (setSelectedPoi)', () => {
    const poi = createMockPoi({ id: 99, name: 'Cafetería' });

    useUIStore.getState().setSelectedPoi(poi as Poi);

    const state = useUIStore.getState();
    expect(state.selectedPoi).toEqual(poi);
    expect(state.selectedPoi?.id).toBe(99);
  });

  it('debería seleccionar una planta (setSelectedFloor)', () => {
    const mockFloor = createMockFloor({ id: 101, level: 0 });
    const prevPoi = createMockPoi({ id: 50, floorId: 101 });

    useUIStore.setState({
      selectedPoi: prevPoi as Poi,
      isPopupOpen: false
    });

    useUIStore.getState().setCurrentFloor(mockFloor as Floor);

    const state = useUIStore.getState();
    expect(state.currentFloor).toEqual(mockFloor);
    expect(state.currentFloor?.id).toEqual(101)
    // Asegura que al cambiar de planta se limpie el POI seleccionado
    expect(state.selectedPoi).toBeNull();
  });

    it('debería controlar la visibilidad del popup (setIsPopupOpen)', () => {
    const poi = createMockPoi({ id: 99, name: 'Cafetería' });

      // Abre
    useUIStore.getState().setIsPopupOpen(true);
    useUIStore.getState().setSelectedPoi(poi);
    expect(useUIStore.getState().isPopupOpen).toBe(true);
    expect(useUIStore.getState().selectedPoi).toBe(poi);
    
    // Cierra
    useUIStore.getState().setIsPopupOpen(false);
    useUIStore.getState().setSelectedPoi(null);
    expect(useUIStore.getState().isPopupOpen).toBe(false);
    expect(useUIStore.getState().selectedPoi).toBeNull();
  });
});