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
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-40"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                Previous
            </Button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) => (
                    <React.Fragment key={idx}>
                        {typeof pageNum === 'number' ? (
                            <button
                                onClick={() => onPageChange(pageNum)}
                                className={`h-8 w-8 text-sm font-medium rounded-md transition-colors ${
                                    currentPage === pageNum
                                        ? 'border border-gray-300 bg-white text-gray-900 shadow-xs'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {pageNum}
                            </button>
                        ) : (
                            <span className="px-1 text-xs text-gray-400">...</span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-40"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                Next
            </Button>
        </div>
    );
};

export default Pagination;