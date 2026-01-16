import { useUserManagement } from "../hook/useUserManagement";

export const ModalDeleteUser = ({ isOpen, onClose, userToDelete }) => {
    const { deleteUser, isDeleting } = useUserManagement();

    if (!isOpen) return null;

    const handleDelete = async () => {
        try {
            await deleteUser(userToDelete.id);
            onClose();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-sm w-full p-6">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">¿Eliminar usuario?</h3>
                    <p className="text-slate-400">
                        ¿Estás seguro que deseas eliminar a <span className="text-slate-200 font-medium">{userToDelete?.email}</span>? Esta acción no se puede deshacer.
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
