import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { Link, useNavigate } from "react-router-dom"
import { addToCart, removeFromCart } from "./cartSlice";
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ICartItem } from "@/types/cart.types";
import { formatPrice } from "@/utils/formatCurrency";

const CartScreen = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { cartItems, itemsPrice, totalPrice, shippingPrice } = useAppSelector((state) => state.cart);

   const updateQtyHandler = (item: ICartItem, newQty: number) => {
        if (newQty > 0 && newQty <= item.stock) {
            dispatch(addToCart({ ...item, qty: newQty }));
        }
    };

    const removeFromCartHandler = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const renderBrandName = (brand: ICartItem["brand"]) => {
        if (!brand) return null;
        if (typeof brand === "object" && "name" in brand) {
            return brand.name;
        }
        return brand;
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4 py-20 text-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full" />
                    <div className="relative p-6 rounded-3xl bg-[#0e1322] border border-slate-800/80 text-slate-400">
                        <ShoppingBag className="size-16 text-indigo-400" />
                    </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Your Cart is Empty</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-sm">
                    Looks like you haven't added any laptops to your cart yet.
                </p>
                <Button asChild className="mt-8 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] border-none">
                    <Link to="/" className="flex items-center gap-2">
                        <ArrowLeft className="size-4" />
                        <span>Explore Laptops</span>
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-[#070913] min-h-screen text-slate-100 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header & Back Link */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Shopping Cart</h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Review your selected items and proceed to checkout.
                        </p>
                    </div>
                    <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="size-4" />
                        <span>Continue Shopping</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const fallbackImage = 'https://via.placeholder.com/150?text=No+Image';
                            const displayImage = item.images && item.images.length > 0 ? item.images[0].url : fallbackImage;

                            return (
                                <Card key={item._id} className="border border-slate-800/80 bg-[#0e1322] shadow-xl rounded-2xl overflow-hidden transition-all hover:border-slate-700/80">
                                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        
                                        {/* Image Box */}
                                        <div className="size-24 sm:size-28 shrink-0 rounded-xl bg-[#070913] border border-slate-800/80 p-2 flex items-center justify-center overflow-hidden">
                                            <img 
                                                src={displayImage} 
                                                alt={item.name} 
                                                className="w-full h-full object-contain hover:scale-105 transition-transform" 
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                                                {renderBrandName(item.brand) || 'Laptop'}
                                            </p>
                                            <Link to={`/products/${item._id}`} className="font-bold text-base text-white hover:text-blue-400 transition-colors line-clamp-1">
                                                {item.name}
                                            </Link>
                                            <div className="text-lg font-black text-white tracking-tight pt-1">
                                                {formatPrice(item.price)}
                                            </div>
                                        </div>

                                        {/* Controls (Quantity Counter & Delete Button) */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                                            
                                            {/* Quantity Counter */}
                                            <div className="flex items-center border border-slate-800 rounded-xl bg-[#070913] p-1">
                                                <button
                                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                                    onClick={() => updateQtyHandler(item, item.qty - 1)}
                                                    disabled={item.qty === 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="size-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold text-white">{item.qty}</span>
                                                <button
                                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                                    onClick={() => updateQtyHandler(item, item.qty + 1)}
                                                    disabled={item.qty >= item.stock}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="size-3.5" />
                                                </button>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => removeFromCartHandler(item._id)}
                                                className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
                                                title="Remove item"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>

                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-24 border border-slate-800/80 bg-[#0e1322] shadow-2xl rounded-2xl text-slate-200">
                            <h3 className="text-xl font-black text-white tracking-tight mb-6">Order Summary</h3>
                            
                            <div className="space-y-4 text-xs sm:text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-bold">{formatPrice(itemsPrice)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Shipping</span>
                                    <span className="text-emerald-400 font-bold">
                                        {shippingPrice === 0 ? "Free Shipping" : formatPrice(shippingPrice)}
                                    </span>
                                </div>

                                <Separator className="bg-slate-800/80 my-2" />

                                <div className="flex justify-between text-base font-black text-white">
                                    <span>Total Price</span>
                                    <span className="text-lg text-indigo-400">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            {/* Checkout Action Button */}
                            <Button
                                className="w-full mt-8 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 h-12 text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all cursor-pointer border-none"
                                onClick={() => navigate("/shipping")}
                            >
                                Proceed to Checkout
                            </Button>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-slate-800/60 text-[11px] text-slate-400">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="size-4 text-indigo-400 shrink-0" />
                                    <span>Fast Delivery</span>
                                </div>
                            </div>

                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default CartScreen
