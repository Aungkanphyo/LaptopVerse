import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
};

const Pagination = ({ totalItems, itemsPerPage }: PaginationProps) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentPage = Number(searchParams.get('page')) || 1;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;


    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        navigate(`?${newParams.toString()}`);
    }
    return (
        <div className="flex items-center justify-center gap-2 mt-12 mb-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="size-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </Button>
            ))}

            <Button
                variant={"outline"}
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="size-4" />
            </Button>
        </div>
    )
}

export default Pagination
