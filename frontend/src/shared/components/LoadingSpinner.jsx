
/**
 * A premium loading spinner component that uses Tailwind CSS for styling.
 * It features a dual-ring animation with a subtle glow effect.
 */
export const LoadingSpinner = () => {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-md">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>

                {/* Spinner */}
                <div
                    className="relative inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                    >Loading...</span>
                </div>
            </div>
        </div>
    );
}