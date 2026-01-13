import { Link } from 'react-router-dom';

export const HomeCard = ({ module }) => {
    return (
        <Link
            to={module.path}
            className="group relative bg-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 cursor-pointer overflow-hidden block"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${module.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`} />

            <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    {module.icon}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                    {module.title}
                </h3>

                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                    {module.description}
                </p>
            </div>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4-4m4-4H3" />
                </svg>
            </div>
        </Link>
    );
};