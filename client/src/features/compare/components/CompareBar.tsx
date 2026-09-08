import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { removeFromCompare, clearCompare } from '../compareSlice';
import { Button } from '@/components/ui/button';
import { X, GitCompare, Cpu, MemoryStick, HardDrive, Monitor, Star } from 'lucide-react';
import { formatPrice } from '@/utils/formatCurrency';

const CompareBar = () => {
    const dispatch = useAppDispatch();
    const { compareItems } = useAppSelector((state) => state.compare);
    const [isOpenModal, setIsOpenModal] = useState(false);

    if (compareItems.length === 0) return null;

    return (
        <>
            {/* 1. Floating Bottom Bar */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-5 duration-300">
                <div className="flex items-center gap-3">
                    {compareItems.map((item) => (
                        <div key={item._id} className="relative flex items-center gap-2 bg-gray-50 pr-3 rounded-lg border border-gray-100">
                            <img
                                src={item.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                alt={item.name}
                                className="size-10 object-cover rounded-md"
                            />
                            <span className="text-xs font-semibold max-w-25 truncate">{item.name}</span>
                            <button
                                onClick={() => dispatch(removeFromCompare(item._id))}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                    ))}

                    {compareItems.length === 1 && (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg size-10 flex items-center justify-center text-xs text-gray-400">
                            +1 Laptop
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200" />

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:text-white text-xs px-4 rounded-xl"
                        disabled={compareItems.length < 2}
                        onClick={() => setIsOpenModal(true)}
                    >
                        <GitCompare className="size-3.5 mr-1" />
                        {compareItems.length < 2 ? 'Select 1 More' : 'Compare Now'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-500 hover:text-red-600"
                        onClick={() => dispatch(clearCompare())}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* 2. Side-by-Side Comparison Modal */}
            {isOpenModal && compareItems.length === 2 && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                                <GitCompare className="size-5 text-blue-600" /> Laptop Comparison
                            </h2>
                            <button
                                onClick={() => setIsOpenModal(false)}
                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X className="size-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Specs Table */}
                        <div className="p-6 overflow-y-auto grow">
                            <div className="grid grid-cols-3 gap-4 border-b pb-4 text-center items-center">
                                <div className="text-left font-bold text-gray-500 text-sm">Specs</div>
                                {compareItems.map((item) => (
                                    <div key={item._id} className="flex flex-col items-center">
                                        <img
                                            src={item.images?.[0]?.url || 'https://via.placeholder.com/150'}
                                            alt={item.name}
                                            className="h-28 object-contain mb-2 rounded-lg"
                                        />
                                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                                        <p className="text-blue-600 font-extrabold text-base mt-1">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Specs Rows */}
                            <div className="divide-y divide-gray-100">
                                <div className="grid grid-cols-3 gap-4 py-3 items-center">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Cpu className="size-4 text-blue-500" /> Processor
                                    </span>
                                    <span className="text-center text-sm font-semibold">{compareItems[0].processor}</span>
                                    <span className="text-center text-sm font-semibold">{compareItems[1].processor}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 py-3 items-center">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <MemoryStick className="size-4 text-blue-500" /> RAM
                                    </span>
                                    <span className="text-center text-sm font-semibold">{compareItems[0].ram}</span>
                                    <span className="text-center text-sm font-semibold">{compareItems[1].ram}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 py-3 items-center">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <HardDrive className="size-4 text-blue-500" /> Storage
                                    </span>
                                    <span className="text-center text-sm font-semibold">{compareItems[0].storage}</span>
                                    <span className="text-center text-sm font-semibold">{compareItems[1].storage}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 py-3 items-center">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Monitor className="size-4 text-blue-500" /> Screen Size
                                    </span>
                                    <span className="text-center text-sm font-semibold">{compareItems[0].screenSize}"</span>
                                    <span className="text-center text-sm font-semibold">{compareItems[1].screenSize}"</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 py-3 items-center">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Star className="size-4 text-amber-500" /> Rating
                                    </span>
                                    <span className="text-center text-sm font-semibold">
                                        {compareItems[0].ratings ? compareItems[0].ratings.toFixed(1) : '0.0'} / 5.0
                                    </span>
                                    <span className="text-center text-sm font-semibold">
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