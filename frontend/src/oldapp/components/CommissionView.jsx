import { useState, useEffect } from 'react'
import { supabase } from '../oldapp/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function CommissionView({ session }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [dateIni, setDateIni] = useState(() => {
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        return firstDay.toISOString().split('T')[0]
    })
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0])
    const [vendors, setVendors] = useState([])
    const [selectedVendors, setSelectedVendors] = useState([])
    const [commissionData, setCommissionData] = useState(null)
    const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false)

    // Pagination
    const [detailPage, setDetailPage] = useState(1)
    const itemsPerPage = 20

    // Base API URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    // Fetch vendors on mount
    useEffect(() => {
        fetchVendors()
    }, [])

    const fetchVendors = async () => {
        try {
            const response = await fetch(`${API_URL}/api/commissions/vendors/`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setVendors(data.vendors || [])
            }
        } catch (err) {
            console.error('Error fetching vendors:', err)
        }
    }

    const fetchCommissions = async () => {
        setLoading(true)
        setError(null)

        try {
            const vendorParam = selectedVendors.length > 0 ? `&vendors=${selectedVendors.join(',')}` : ''
            const response = await fetch(
                `${API_URL}/api/commissions/?date_ini=${dateIni}&date_end=${dateEnd}${vendorParam}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Error al cargar datos')
            }

            const data = await response.json()
            setCommissionData(data)
            setDetailPage(1)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value || 0)
    }

    const toggleVendor = (vendorId) => {
        setSelectedVendors(prev =>
            prev.includes(vendorId)
                ? prev.filter(v => v !== vendorId)
                : [...prev, vendorId]
        )
    }

    const selectAllVendors = () => setSelectedVendors(vendors.map(v => v.id))
    const deselectAllVendors = () => setSelectedVendors([])

    // Pagination helpers
    const paginateData = (data, page) => {
        const start = (page - 1) * itemsPerPage
        return data?.slice(start, start + itemsPerPage) || []
    }

    const getTotalPages = (data) => Math.ceil((data?.length || 0) / itemsPerPage)

    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        if (totalPages <= 1) return null
        return (
            <div className="flex items-center justify-center gap-2 mt-4">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-slate-700 text-white text-sm disabled:opacity-50"
                >
                    ←
                </button>
                <span className="text-sm text-slate-400">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-slate-700 text-white text-sm disabled:opacity-50"
                >
                    →
                </button>
            </div>
        )
    }

    // Export to PDF
    const exportToPDF = () => {
        if (!commissionData) return

        const doc = new jsPDF('landscape', 'mm', 'a4')

        // Title
        doc.setFontSize(18)
        doc.setTextColor(40, 40, 40)
        doc.text(`Reporte de Comisiones - ${commissionData.company}`, 14, 20)

        doc.setFontSize(11)
        doc.setTextColor(100, 100, 100)
        doc.text(`Período: ${dateIni} al ${dateEnd}`, 14, 28)
        doc.text(`Total Venta Neta: ${formatCurrency(commissionData.totals?.vnet)} | Total Comisión: ${formatCurrency(commissionData.totals?.comision)} | Vendedores: ${commissionData.totals?.vendedores}`, 14, 35)

        let yPos = 45

        // Summary table
        if (commissionData.summary?.length > 0) {
            doc.setFontSize(14)
            doc.setTextColor(40, 40, 40)
            doc.text('Resumen por Vendedor', 14, yPos)
            yPos += 6

            const summaryData = commissionData.summary.map(s => [
                s.vendedor || '-',
                s.rut || '-',
                formatCurrency(s.vnet),
                formatCurrency(s.comision)
            ])
            summaryData.push(['TOTAL', '', formatCurrency(commissionData.totals?.vnet), formatCurrency(commissionData.totals?.comision)])

            autoTable(doc, {
                startY: yPos,
                head: [['Vendedor', 'RUT', 'Venta Neta', 'Comisión']],
                body: summaryData,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 9, cellPadding: 3 },
                didParseCell: (data) => {
                    if (data.column.index >= 2) {
                        data.cell.styles.halign = 'right'
                    }
                }
            })

            yPos = doc.lastAutoTable.finalY + 10
        }

        // Detail table (first page only)
        if (commissionData.detail?.length > 0) {
            if (yPos > 150) {
                doc.addPage()
                yPos = 20
            }

            doc.setFontSize(14)
            doc.setTextColor(40, 40, 40)
            doc.text('Detalle de Transacciones', 14, yPos)
            yPos += 6

            const detailData = commissionData.detail.slice(0, 50).map(d => [
                d.vendedor || '-',
                d.sku || '-',
                (d.descripcion || '-').substring(0, 40),
                d.cantidad?.toString() || '0',
                formatCurrency(d.vnet),
                d.canal || '-',
                d.fecha || '-'
            ])

            autoTable(doc, {
                startY: yPos,
                head: [['Vendedor', 'SKU', 'Descripción', 'Cant.', 'Venta Neta', 'Canal', 'Fecha']],
                body: detailData,
                theme: 'striped',
                headStyles: { fillColor: [46, 204, 113], textColor: 255 },
                styles: { fontSize: 8, cellPadding: 2 },
                didParseCell: (data) => {
                    if (data.column.index === 3 || data.column.index === 4) {
                        data.cell.styles.halign = 'right'
                    }
                }
            })
        }

        doc.save(`Comisiones_${commissionData.company}_${dateIni}_${dateEnd}.pdf`)
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                    Reporte de Comisiones
                </h2>
                <p className="text-slate-400 mt-2">
                    Consulta las comisiones de vendedores por período
                </p>
            </div>

            {/* Filters */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 mb-6">
                <div className="flex items-end justify-between gap-4">
                    <div className="flex items-end gap-3">
                        {/* Date Start */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Desde</label>
                            <input
                                type="date"
                                value={dateIni}
                                onChange={(e) => setDateIni(e.target.value)}
                                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Date End */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Hasta</label>
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Vendors Dropdown */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Vendedores</label>
                            <button
                                onClick={() => setVendorDropdownOpen(!vendorDropdownOpen)}
                                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                            >
                                <span>
                                    {selectedVendors.length === 0
                                        ? 'Todos'
                                        : selectedVendors.length === vendors.length
                                            ? 'Todos'
                                            : `${selectedVendors.length} seleccionado${selectedVendors.length > 1 ? 's' : ''}`}
                                </span>
                                <svg className={`w-4 h-4 transition-transform ${vendorDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {vendorDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-2 flex gap-2">
                                        <button
                                            onClick={selectAllVendors}
                                            className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Todos
                                        </button>
                                        <button
                                            onClick={deselectAllVendors}
                                            className="flex-1 px-2 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-500"
                                        >
                                            Ninguno
                                        </button>
                                    </div>
                                    {vendors.map(v => (
                                        <label
                                            key={v.id}
                                            className="flex items-center px-3 py-2 hover:bg-slate-700/50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedVendors.includes(v.id)}
                                                onChange={() => toggleVendor(v.id)}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="ml-2 text-sm text-white">{v.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={fetchCommissions}
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

                        {commissionData && (
                            <button
                                onClick={exportToPDF}
                                className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 flex items-center gap-2"
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

            {/* Error */}
            {error && (
                <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* Content */}
            {commissionData && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl border border-blue-500/30 p-4">
                            <div className="text-xs font-medium text-blue-300 mb-1">Venta Neta Total</div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(commissionData.totals?.vnet)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-xl border border-emerald-500/30 p-4">
                            <div className="text-xs font-medium text-emerald-300 mb-1">Comisión Total</div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(commissionData.totals?.comision)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl border border-purple-500/30 p-4">
                            <div className="text-xs font-medium text-purple-300 mb-1">Vendedores</div>
                            <div className="text-2xl font-bold text-white">{commissionData.totals?.vendedores}</div>
                        </div>
                    </div>

                    {/* Summary Table */}
                    {commissionData.summary?.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Resumen por Vendedor</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Vendedor</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">RUT</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Venta Neta</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Comisión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissionData.summary.map((item, idx) => (
                                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                <td className="py-2 px-3 text-white">{item.vendedor}</td>
                                                <td className="py-2 px-3 text-slate-300">{item.rut || '-'}</td>
                                                <td className="py-2 px-3 text-right text-blue-400 font-medium">{formatCurrency(item.vnet)}</td>
                                                <td className="py-2 px-3 text-right text-emerald-400 font-medium">{formatCurrency(item.comision)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-800/50 font-bold">
                                            <td className="py-2 px-3 text-white" colSpan={2}>TOTAL</td>
                                            <td className="py-2 px-3 text-right text-blue-400">{formatCurrency(commissionData.totals?.vnet)}</td>
                                            <td className="py-2 px-3 text-right text-emerald-400">{formatCurrency(commissionData.totals?.comision)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Detail Table */}
                    {commissionData.detail?.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-white">Detalle de Transacciones</h3>
                                <span className="text-xs text-slate-400">{commissionData.detail.length} registros</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Vendedor</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">SKU</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Descripción</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Cant.</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">Venta Neta</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Canal</th>
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginateData(commissionData.detail, detailPage).map((item, idx) => (
                                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                <td className="py-2 px-3 text-white">{item.vendedor}</td>
                                                <td className="py-2 px-3 text-slate-300">{item.sku}</td>
                                                <td className="py-2 px-3 text-slate-300 max-w-xs truncate">{item.descripcion}</td>
                                                <td className="py-2 px-3 text-right text-slate-300">{item.cantidad}</td>
                                                <td className="py-2 px-3 text-right text-blue-400 font-medium">{formatCurrency(item.vnet)}</td>
                                                <td className="py-2 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs ${item.canal === 'Web' ? 'bg-purple-500/20 text-purple-300' :
                                                        item.canal === 'Pos' ? 'bg-blue-500/20 text-blue-300' :
                                                            'bg-slate-500/20 text-slate-300'
                                                        }`}>
                                                        {item.canal}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-slate-400 text-xs">{item.fecha}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={detailPage}
                                totalPages={getTotalPages(commissionData.detail)}
                                onPageChange={setDetailPage}
                            />
                        </div>
                    )}

                    {/* No Data */}
                    {(!commissionData.summary || commissionData.summary.length === 0) && (
                        <div className="py-12 text-center text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                            No se encontraron comisiones para el período seleccionado.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
