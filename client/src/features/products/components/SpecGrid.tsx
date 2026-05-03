import type { IProduct } from '@/types/product.types'
import { Cpu, HardDrive, MemoryStick, Monitor } from 'lucide-react';

const SpecGrid = ({ product }: { product: IProduct }) => {
    const spec = [
        { icon: Cpu, Label: "Processor", value: product.processor },
        { icon: MemoryStick, label: "Memory", value: product.ram },
        { icon: HardDrive, label: "Storage", value: product.storage },
        { icon: Monitor, label: "Display", value: "15.6\" 4K OLED" }, // Example hardcoded or from API
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            {spec.map((spec, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <spec.icon className="size-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">{spec.label}</p>
                        <p className="text-sm font-semibold text-gray-900">{spec.value}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SpecGrid
