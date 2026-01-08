import { SideBar } from "../../shared/components"

const userPermissions = {
    can_view_reports: true,
    can_view_user_management: true,
    can_view_closing_sales: true,
    can_view_commission: true
}

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white flex">
            
            <SideBar userPermissions={userPermissions} />

            <main className="flex-1 overflow-y-auto p-2">
                Main Content
            </main>
            
        </div>
    )
}