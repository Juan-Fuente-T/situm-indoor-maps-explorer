// import { describe, it, expect, vi, beforeEach } from 'vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PoiDetailComponent } from '../PoiDetailComponent'; // Ajusta la ruta si es necesario
import { useUIStore } from '../../stores/uiStore';
import { createMockPoi } from '../../test/mocks';
import type { Poi } from '@situm/sdk-js';

describe('PoiDetail Component', () => {
    beforeEach(() => {
        // Reseteamos store
        useUIStore.setState({ selectedPoi: null });
    });

    it('no debería renderizar nada si no hay POI seleccionado', () => {
        useUIStore.setState({ selectedPoi: null, isPopupOpen: false });
        const { container } = render(<PoiDetailComponent />);
        expect(container).toBeEmptyDOMElement();
    });

    it('NO debería renderizarse si hay POI pero isPopupOpen es false (Caso clic en lista)', () => {
    const mockPoi = createMockPoi({ name: 'Test' });
    useUIStore.setState({ selectedPoi: mockPoi as Poi, isPopupOpen: false });

    const { container } = render(<PoiDetailComponent />);
    expect(container).toBeEmptyDOMElement();
});

    it('debería renderizar si hay POI y isPopupOpen es true (Caso clic en mapa)', () => {
        const mockPoi = createMockPoi({
            name: 'Sala de Juntas',
            info: 'Reuniones ejecutivas',
            categoryName: 'Salas'
        });

        useUIStore.setState({ selectedPoi: mockPoi as Poi, isPopupOpen: true });

        render(<PoiDetailComponent />);

        expect(screen.getByText('Sala de Juntas')).toBeInTheDocument();
        expect(screen.getByText('Reuniones ejecutivas')).toBeInTheDocument();
        expect(screen.getByText('Salas')).toBeInTheDocument();
    });

    it('debería cerrar el popup (limpiar selectedPoi) al hacer clic en cerrar', () => {
        const mockPoi = createMockPoi({ name: 'Test POI' });
        useUIStore.setState({ selectedPoi: mockPoi as Poi });

        render(<PoiDetailComponent />);

        // Buscamos el botón por su aria-label (buena práctica de accesibilidad)
        const closeBtn = screen.getByLabelText('Cerrar');
        fireEvent.click(closeBtn);

        // Verificamos que el store se ha limpiado
        expect(useUIStore.getState().selectedPoi).toBeNull();
        expect(useUIStore.getState().isPopupOpen).toBe(false);
    });
});