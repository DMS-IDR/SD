export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white flex">
            
            <div className="p-2">Sidebar</div>

            <main className="flex-1 overflow-y-auto p-2">
                Main Content
            </main>
            
        </div>
    )
}