import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Laptop, Loader2, SearchIcon } from 'lucide-react';
import { useGetProductsQuery } from '@/features/products/productApiSlice';
import { formatPrice } from '@/utils/formatCurrency';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      navigate("/");
    }
  };

  // call live data 
  const { data, isFetching } = useGetProductsQuery(
    { keyword: debouncedTerm, limit: 5 },
    { skip: debouncedTerm.length < 2 }
  );

  // for close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  const handleSelect = (productId: string) => {
    setIsOpen(false);
    setSearchTerm("");
    navigate(`/products/${productId}`);
  };

  return (
    <div className="relative w-full min-w-70 md:min-w-90" ref={searchRef}>
      <div className="relative w-full">
        <Input
          type="text"
          value={searchTerm}
          placeholder="Search for laptops..."
          className="w-full h-12 pl-11 pr-10 text-base rounded-full bg-gray-100 text-slate-900 placeholder:text-slate-400 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4 md:size-4.5 pointer-events-none" />
        {isFetching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500 animate-spin size-4 md:size-4.5" />}
      </div>

      {/* Results Dropdown */}
      {isOpen && debouncedTerm.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {data?.products.length ? (
            <ul className="py-2">
              {data.products.map((product) => (
                <li
                  key={product._id}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
                  onClick={() => handleSelect(product._id)}
                >
                  <div className="size-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {product.images[0] ? (
                      <img src={product.images[0].url} alt="" className="object-cover w-full h-full" />
                    ) : (
                      <Laptop className="size-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-sm text-blue-600 font-bold">{formatPrice(product.price)}</p>
                  </div>
                </li>
              ))}
              <li
                className="px-4 py-2 bg-gray-50 text-center text-xs text-gray-500 hover:text-blue-600 cursor-pointer"
                onClick={() => {
                  navigate(`/?keyword=${debouncedTerm}`);
                  setIsOpen(false);
                }}
              >
                See all results for "{debouncedTerm}"
              </li>
            </ul>
          ) : (
            !isFetching && <div className="p-4 text-center text-sm text-gray-500">No products found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
