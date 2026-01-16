import { useEffect, useState } from "react"
import { useCashes } from "./hooks/useClosingSales"

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
    const [selectedChannels, setSelectedChannels] = useState(['Pos', 'Web', 'Ventas'])
    const [selectedCashes, setSelectedCashes] = useState([])
    const [closingData, setClosingData] = useState(false)
    const [cashDropdownOpen, setCashDropdownOpen] = useState(false)

    // TanStack Query Hook: Fetch cashes whenever 'entity' changes
    const { cashes, isLoading: loadingCashes } = useCashes(entity)

    // Sync selectedCashes ONLY when new cash data is loaded from the query
    useEffect(() => {
        if (cashes && cashes.length > 0) {
            const cashesNames = cashes.map(c => c.caja);
            // Only update if the selection is different from the total available
            // to avoid loop if this effect triggers unnecessarily
            setSelectedCashes(cashesNames);
        } else {
            setSelectedCashes([]);
        }
    }, [cashes])

    const selectAllCashes = () => setSelectedCashes(cashes.map(c => c.caja))
    const deselectAllCashes = () => setSelectedCashes([])

    const fetchClosingData = () => {
        setLoading(true)
        setError(null)

    }

    const toggleChannel = (channel) => {
        setSelectedChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        )
    }

    const toggleCash = (cash) => {
        setSelectedCashes(prev =>
            prev.includes(cash) ? prev.filter(c => c !== cash) : [...prev, cash]
        )
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value || 0)
    }

    // Calculate totals
    const totalBruto = closingData?.totales?.reduce((sum, item) => sum + (item.monto_bruto || 0), 0) || 0
    const totalTransactions = closingData?.totales?.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0) || 0
    const totalDTE = closingData?.detalleDTE?.reduce((sum, item) => sum + (item.bruto || 0), 0) || 0
    const totalDocumentos = closingData?.detalleDTE?.length || 0
    const hasDifference = Math.abs(totalBruto - totalDTE) > 0.01

    // Group DTE by payment method for comparison (we'll need to match with totales)
    const getDTEByMetodo = () => {
        const grouped = {}
        closingData?.detalleMP?.forEach(item => {
            const metodo = item.metodo_pago || 'Sin método'
            if (!grouped[metodo]) grouped[metodo] = { monto: 0, cantidad: 0 }
            grouped[metodo].monto += item.bruto || 0
            grouped[metodo].cantidad += 1
        })
        return grouped
    }

    const exportToPDF = () => { }

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
                                {loadingCashes ? (
                                    <div className="px-2 py-1 rounded text-xs font-medium bg-slate-700/50 text-slate-400 animate-pulse">
                                        Cargando cajas...
                                    </div>
                                ) : cashes.length > 0 ? (
                                    cashes.map(c => (
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
                                    ))
                                ) : (
                                    <div className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                        Sin cajas disponibles
                                    </div>
                                )}
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

            {/* Report Content */}
            {closingData && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className={`grid grid-cols-1 ${hasDifference ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
                        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl border border-blue-500/30 p-4">
                            <div className="text-xs font-medium text-blue-300 mb-1">Total</div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(totalBruto)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-xl border border-emerald-500/30 p-4">
                            <div className="text-xs font-medium text-emerald-300 mb-1">Transacciones MP</div>
                            <div className="text-2xl font-bold text-white">{totalTransactions}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl border border-purple-500/30 p-4">
                            <div className="text-xs font-medium text-purple-300 mb-1">Documentos DTE</div>
                            <div className="text-2xl font-bold text-white">{totalDocumentos}</div>
                        </div>
                        {hasDifference && (
                            <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl border border-red-500/30 p-4">
                                <div className="text-xs font-medium text-red-300 mb-1">⚠️ Diferencia</div>
                                <div className="text-2xl font-bold text-red-400">{formatCurrency(totalBruto - totalDTE)}</div>
                            </div>
                        )}
                    </div>

                    {/* 1. RESUMEN COMPARATIVO - Tipo documento | Monto Pedido | Monto DTE | Cantidad */}
                    {closingData.totales && closingData.totales.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Tipo de documento</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Monto Pedido $</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Monto DTE $</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Cantidad documentos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const dteByMetodo = getDTEByMetodo()
                                            return closingData.totales.map((item, idx) => {
                                                const dteData = dteByMetodo[item.metodo_pago] || { monto: 0, cantidad: 0 }
                                                return (
                                                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                        <td className="py-2 px-3 text-white">{item.metodo_pago?.toUpperCase()}</td>
                                                        <td className="py-2 px-3 text-right text-emerald-400 font-medium">{formatCurrency(item.monto_bruto)}</td>
                                                        <td className="py-2 px-3 text-right text-blue-400 font-medium">{formatCurrency(dteData.monto)}</td>
                                                        <td className="py-2 px-3 text-right text-slate-300">{dteData.cantidad || item.cantidad}</td>
                                                    </tr>
                                                )
                                            })
                                        })()}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-800/50 font-bold">
                                            <td className="py-2 px-3 text-white">TOTAL</td>
                                            <td className="py-2 px-3 text-right text-emerald-400">{formatCurrency(totalBruto)}</td>
                                            <td className="py-2 px-3 text-right text-blue-400">{formatCurrency(totalDTE)}</td>
                                            <td className="py-2 px-3 text-right text-slate-300">{totalDocumentos}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 2. DETALLE MP */}
                    {closingData.detalleMP && closingData.detalleMP.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-white">Detalle por Método de Pago</h3>
                                <span className="text-xs text-slate-400">{closingData.detalleMP.length} registros</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Método</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Cajero</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Monto</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Cliente</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Canal</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Caja</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginateData(closingData.detalleMP, mpPage).map((item, idx) => (
                                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                <td className="py-2 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.metodo_pago === 'Efectivo' ? 'bg-green-500/20 text-green-300' :
                                                        item.metodo_pago === 'Transbank' ? 'bg-blue-500/20 text-blue-300' :
                                                            item.metodo_pago === 'Anticipo' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                'bg-slate-500/20 text-slate-300'
                                                        }`}>
                                                        {item.metodo_pago}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-slate-300">{item.cajero || '-'}</td>
                                                <td className="py-2 px-3 text-right text-emerald-400 font-medium">{formatCurrency(item.bruto)}</td>
                                                <td className="py-2 px-3 text-slate-300 max-w-[150px] truncate">{item.cliente || '-'}</td>
                                                <td className="py-2 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs ${item.canal === 'Pos' ? 'bg-blue-500/20 text-blue-300' :
                                                        item.canal === 'Web' ? 'bg-purple-500/20 text-purple-300' :
                                                            'bg-slate-500/20 text-slate-300'
                                                        }`}>{item.canal}</span>
                                                </td>
                                                <td className="py-2 px-3 text-slate-300">{item.caja}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={mpPage}
                                totalPages={getTotalPages(closingData.detalleMP)}
                                onPageChange={setMpPage}
                            />
                        </div>
                    )}

                    {/* 3. DETALLE DTE */}
                    {closingData.detalleDTE && closingData.detalleDTE.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-white">Detalle de Documentos (DTE)</h3>
                                <span className="text-xs text-slate-400">{closingData.detalleDTE.length} registros</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Documento</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Folio</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Cajero</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Monto</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Cliente</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Canal</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Caja</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginateData(closingData.detalleDTE, dtePage).map((item, idx) => (
                                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                <td className="py-2 px-3 text-white font-mono text-xs">{item.t_doc}</td>
                                                <td className="py-2 px-3 text-slate-300">{item.folio}</td>
                                                <td className="py-2 px-3 text-slate-300">{item.cajero || '-'}</td>
                                                <td className="py-2 px-3 text-right text-emerald-400 font-medium">{formatCurrency(item.bruto)}</td>
                                                <td className="py-2 px-3 text-slate-300 max-w-[150px] truncate">{item.cliente || '-'}</td>
                                                <td className="py-2 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs ${item.canal === 'Pos' ? 'bg-blue-500/20 text-blue-300' :
                                                        item.canal === 'Web' ? 'bg-purple-500/20 text-purple-300' :
                                                            'bg-slate-500/20 text-slate-300'
                                                        }`}>{item.canal}</span>
                                                </td>
                                                <td className="py-2 px-3 text-slate-300">{item.caja}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={dtePage}
                                totalPages={getTotalPages(closingData.detalleDTE)}
                                onPageChange={setDtePage}
                            />
                        </div>
                    )}

                    {/* No Data Message */}
                    {(!closingData.totales || closingData.totales.length === 0) &&
                        (!closingData.detalleMP || closingData.detalleMP.length === 0) &&
                        (!closingData.detalleDTE || closingData.detalleDTE.length === 0) && (
                            <div className="py-12 text-center text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                                No se encontraron datos para los filtros seleccionados.
                            </div>
                        )}
                </div>
            )}




        </div>

    )
}