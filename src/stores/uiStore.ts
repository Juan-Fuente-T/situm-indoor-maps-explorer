import { create } from 'zustand';
import type { Poi, Floor, Building } from '../types/situmTypes';

// Define la interfaz del estado GLOBAL
interface UIState {
    // --- DATOS PRINCIPALES del edificio ---
    building: Building | null;
    pois: Poi[]; // Lista completa de POIs

    // --- ESTADO DE UI - Lo que el usuario está mirando ---
    currentFloor: Floor | null;
    selectedPoi: Poi | null;
    isPopupOpen: boolean;

    // --- ACCIONES ---
    setBuilding: (building: Building | null) => void;
    setPois: (pois: Poi[]) => void;
    setCurrentFloor: (floor: Floor | null) => void;
    setSelectedPoi: (poi: Poi | null) => void;
    setIsPopupOpen:(isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Valores iniciales
    building: null,
    pois: [],
    currentFloor: null,
    selectedPoi: null,
    isPopupOpen: false,

    // Setters de Datos
    setBuilding: (building) => set({ building }),
    setPois: (pois) => set({ pois }),

    // Setters de Selección
    // Al cambiar de planta, limpia el POI seleccionado para evitar incoherencias visuales
    setCurrentFloor: (floor) => set({ currentFloor: floor, selectedPoi: null }),

    setSelectedPoi: (poi) => set({ selectedPoi: poi }),
    setIsPopupOpen: (isOpen) => set({ isPopupOpen: isOpen }),
}));