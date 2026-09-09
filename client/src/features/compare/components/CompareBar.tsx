import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { removeFromCompare, clearCompare } from '../compareSlice';
import { Button } from '@/components/ui/button';
import { X, GitCompare, Cpu, MemoryStick, HardDrive, Monitor, Star } from 'lucide-react';
import { formatPrice } from '@/utils/formatCurrency';

const CompareBar = () => {
    const dispatch = useAppDispatch();
    const { compareItems } = useAppSelector((state) => state.compare);
    const [isOpenModal, setIsOpenModal] = useState(false);
    // background scroll lock when appearing comparison modal
    useEffect(() => {
        if (isOpenModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // work scroll normal when unmount modal
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpenModal]);

    if (compareItems.length === 0) return null;

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0e1322]/90 backdrop-blur-xl border border-slate-800/90 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-5 duration-300">
                <div className="flex items-center gap-3">
                    {compareItems.map((item) => (
                        <div 
                            key={item._id} 
                            className="relative flex items-center gap-2.5 bg-[#070913] pr-3 p-1.5 rounded-xl border border-slate-800 text-slate-200"
                        >
                            <img
                                src={item.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                alt={item.name}
                                className="size-9 object-cover rounded-lg bg-slate-900"
                            />
                            <span className="text-xs font-semibold max-w-25 truncate text-slate-200">
                                {item.name}
                            </span>
                            <button
                                onClick={() => dispatch(removeFromCompare(item._id))}
                                className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-slate-800/50"
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                    ))}

                    {compareItems.length === 1 && (
                        <div className="border-2 border-dashed border-slate-800 bg-[#070913]/50 rounded-xl px-4 py-2 flex items-center justify-center text-xs font-medium text-slate-500">
                            +1 Laptop
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-800" />

                <div className="flex items-center gap-2">
                    {/* Glow Effect Blue Compare Button */}
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 h-9 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={compareItems.length < 2}
                        onClick={() => setIsOpenModal(true)}
                    >
                        <GitCompare className="size-3.5 mr-1.5" />
                        {compareItems.length < 2 ? 'Select 1 More' : 'Compare Now'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 h-9 rounded-xl transition-colors"
                        onClick={() => dispatch(clearCompare())}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* Side-by-Side Comparison Modal */}
            {isOpenModal && compareItems.length === 2 && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0e1322] border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-800/80 flex justify-between items-center bg-[#070913]/80">
                            <h2 className="text-base font-bold flex items-center gap-2.5 text-white">
                                <GitCompare className="size-5 text-blue-500" /> Laptop Comparison
                            </h2>
                            <button
                                onClick={() => setIsOpenModal(false)}
                                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Specs Table Body */}
                        <div className="p-6 overflow-y-auto grow">
                            {/* Product Header Row */}
                            <div className="grid grid-cols-3 gap-4 border-b border-slate-800/80 pb-6 text-center items-center">
                                <div className="text-left font-bold text-slate-400 text-xs uppercase tracking-wider">
                                    Features / Specs
                                </div>
                                {compareItems.map((item) => (
                                    <div key={item._id} className="flex flex-col items-center">
                                        <div className="p-2 bg-[#070913] rounded-2xl border border-slate-800 mb-3">
                                            <img
                                                src={item.images?.[0]?.url || 'https://via.placeholder.com/150'}
                                                alt={item.name}
                                                className="h-24 sm:h-28 object-contain rounded-lg"
                                            />
                                        </div>
                                        <h3 className="font-bold text-sm text-white line-clamp-1 max-w-50">
                                            {item.name}
                                        </h3>
                                        <p className="text-indigo-400 font-black text-base mt-1">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Specs Comparison Rows */}
                            <div className="divide-y divide-slate-800/60">
                                {/* Processor */}
                                <div className="grid grid-cols-3 gap-4 py-4 items-center hover:bg-[#070913]/30 transition-colors px-2 rounded-xl">
                                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <Cpu className="size-4 text-indigo-400 shrink-0" /> Processor
                                    </span>
                                    <span className="text-center text-sm font-semibold text-white">{compareItems[0].processor || 'N/A'}</span>
                                    <span className="text-center text-sm font-semibold text-white">{compareItems[1].processor || 'N/A'}</span>
                                </div>

                                {/* RAM */}
                                <div className="grid grid-cols-3 gap-4 py-4 items-center hover:bg-[#070913]/30 transition-colors px-2 rounded-xl">
                                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <MemoryStick className="size-4 text-indigo-400 shrink-0" /> RAM
                                    </span>
                                    <span className="text-center text-sm font-semibold text-white">{compareItems[0].ram || 'N/A'}</span>
                                    <span className="text-center text-sm font-semibold text-white">{compareItems[1].ram || 'N/A'}</span>
                                </div>

                                {/* Storage */}
                                <div className="grid grid-cols-3 gap-4 py-4 items-center hover:bg-[#070913]/30 transition-colors px-2 rounded-xl">
                                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <HardDrive className="size-4 text-indigo-400 shrink-0" /> Storage
                                    </span>
                                    <span className="text-center text-sm font-semibold text-white">{compareItems[0].storage || 'N/A'}</span>
                                    <span className="text-center text-sm font-semibold text-white">{compareItems[1].storage || 'N/A'}</span>
                                </div>

                                {/* Screen Size */}
                                <div className="grid grid-cols-3 gap-4 py-4 items-center hover:bg-[#070913]/30 transition-colors px-2 rounded-xl">
                                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <Monitor className="size-4 text-indigo-400 shrink-0" /> Display
                                    </span>
                                    <span className="text-center text-sm font-semibold text-white">
                                        {compareItems[0].screenSize ? `${compareItems[0].screenSize}"` : 'N/A'}
                                    </span>
                                    <span className="text-center text-sm font-semibold text-white">
                                        {compareItems[1].screenSize ? `${compareItems[1].screenSize}"` : 'N/A'}
                                    </span>
                                </div>

                                {/* Rating */}
                                <div className="grid grid-cols-3 gap-4 py-4 items-center hover:bg-[#070913]/30 transition-colors px-2 rounded-xl">
                                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <Star className="size-4 text-amber-400 shrink-0 fill-amber-400" /> Rating
                                    </span>
                                    <span className="text-center text-sm font-semibold text-amber-400">
                                        {compareItems[0].ratings ? compareItems[0].ratings.toFixed(1) : '0.0'} / 5.0
                                    </span>
                                    <span className="text-center text-sm font-semibold text-amber-400">
                                        {compareItems[1].ratings ? compareItems[1].ratings.toFixed(1) : '0.0'} / 5.0
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CompareBar;