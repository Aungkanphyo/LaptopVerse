import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const safeTotalPages = Math.max(1, totalPages);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (safeTotalPages <= maxVisiblePages) {
            for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', safeTotalPages);
            } else if (currentPage >= safeTotalPages - 2) {
                pages.push(1, '...', safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
            } else {
                pages.push(1, '...', currentPage, '...', safeTotalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 py-4">
            <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all cursor-pointer"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                Previous
            </Button>

            <div className="flex items-center gap-1.5">
                {getPageNumbers().map((pageNum, idx) => (
                    <React.Fragment key={idx}>
                        {typeof pageNum === 'number' ? (
                            <button
                                onClick={() => onPageChange(pageNum)}
                                className={`h-10 w-10 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                                    currentPage === pageNum
                                        ? 'bg-white text-slate-950 shadow-lg scale-105'
                                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                }`}
                            >
                                {pageNum}
                            </button>
                        ) : (
                            <span className="px-1 text-sm font-medium text-slate-500">...</span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all cursor-pointer"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= safeTotalPages}
            >
                Next
            </Button>
        </div>
    );
};

export default Pagination;