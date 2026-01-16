import { useState } from "react"

const COMPANIES = [
    { id: '1', name: 'DKO' },
    { id: '2', name: 'MV' },
    { id: '3', name: 'BazarED' },
    { id: '4', name: 'Peña' },
    { id: '5', name: 'Maipu' },
    { id: '13', name: 'PlzVesp' }
]

export const ClosingSalesPage = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [entity, setEntity] = useState('1')
    const [cashes, setCashes] = useState([])
    const [selectedChannels, setSelectedChannels] = useState(['Pos', 'Web', 'Ventas'])
    const [selectedCashes, setSelectedCashes] = useState([])
    const [closingData, setClosingData] = useState(null)
    const [cashDropdownOpen, setCashDropdownOpen] = useState(false)

    const selectAllCashes = () => setSelectedCashes(cashes.map(c => c.caja))
    const deselectAllCashes = () => setSelectedCashes([])

    const fetchClosingData = () => {
        setLoading(true)
        setError(null)

    }


    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header titulo y subtitulo */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                    Cierre de Ventas
                </h2>
                <p className="text-slate-400 mt-2">Consulta el cierre diario de cajas y ventas</p>
            </div>

            {/* Filtros */}

            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 mb-6">
                <div className="flex items-end justify-between gap-4">
                    {/* Left side - Filters */}
                    <div className="flex items-end gap-3">
                        {/* Date */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Company/Entity */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Sucursal</label>
                            <select
                                value={entity}
                                onChange={(e) => setEntity(e.target.value)}
                                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {COMPANIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Channels */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Canales</label>
                            <div className="flex gap-1">
                                {['Pos', 'Web', 'Ventas'].map(ch => (
                                    <button
                                        key={ch}
                                        onClick={() => toggleChannel(ch)}
                                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${selectedChannels.includes(ch)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                            }`}
                                    >
                                        {ch}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cashes - Inline chips */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="text-xs font-medium text-slate-400">Cajas</label>
                                <button onClick={selectAllCashes} className="text-xs text-blue-400 hover:underline">Todas</button>
                                <button onClick={deselectAllCashes} className="text-xs text-slate-500 hover:underline">Ninguna</button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {cashes.map(c => (
                                    <button
                                        key={c.caja}
                                        onClick={() => toggleCash(c.caja)}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedCashes.includes(c.caja)
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                            }`}
                                    >
                                        {c.caja}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right side - Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={fetchClosingData}
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            Buscar
                        </button>

                        {closingData && (
                            <button
                                onClick={exportToPDF}
                                className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                PDF
                            </button>
                        )}
                    </div>
                </div>
            </div>


        </div>

    )
}