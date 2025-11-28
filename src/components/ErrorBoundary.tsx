import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    }
    // Esta función se llama automáticamente cuando un componente hijo lanza un error
    // y se ejecuta un re-render. El método render llama a la UI del fallback
    static getDerivedStateFromError(error: Error): State {
        console.error('GetDerivedStateFromError caught an error:', error)
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
        // Se puede loggear a un servicio de reporte de errores
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? <h2>Algo ha ido mal.</h2>
        }

        return this.props.children
    }
}

export const FallbackComponent: React.FC<{ message?: string }> = ({ message }) => {
    const handleReloadPage = () => {
        window.location.reload()
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 sm:p-8">
            <div
                className="flex flex-col items-center justify-center gap-5
                rounded-lg p-8 text-[#FBFBFB] text-center
                border-2 border-[#7096FF] shadow-lg
                    max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto my-auto"
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    {message ?? "¡Caramba! Ha ocurrido un error."}
                </h2>
                {/* Solo una pizquita de humor */}
                <h3 className="flex flex-col items-center gap-3">
                    ¿Es el fin del mundo?
                </h3>
                <button
                    onClick={handleReloadPage}
                    className="mt-6 bg-[#7096FF] hover:opacity-80 text-[#111726] font-bold py-2 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Reload window
                </button>
            </div>
        </div>
    )
}