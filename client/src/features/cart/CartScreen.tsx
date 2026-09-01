import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { Link, useNavigate } from "react-router-dom"
import { addToCart, removeFromCart } from "./cartSlice";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ICartItem } from "@/types/cart.types";

const CartScreen = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { cartItems, itemsPrice, totalPrice, shippingPrice, taxPrice } = useAppSelector((state) => state.cart);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateQtyHandler = (item: any, newQty: number) => {
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
            <div className="container py-20 text-center space-y-4">
                <ShoppingBag className="size-16 mx-auto text-gray-300" />
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <p className="text-gray-500">Looks like you haven't added anything yet.</p>
                <Button asChild>
                    <Link to="/">Go Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-extrabold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Cart itmes list */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <Card key={item._id} className="border-none shadow-sm bg-white overflow-hidden">
                            <CardContent className="p-4 flex items-center gap-4">
                                <img src={item.images?.[0].url} alt={item.name} className="size-24 object-contain bg-gray-50 rounded-lg" />

                                <div className="flex-1 min-w-0">
                                    <Link to={`/products/${item._id}`} className="font-bold text-gray-900 hover:text-blue-600 truncate block">
                                        {item.name}
                                    </Link>
                                    <p className="text-sm text-gray-500">{renderBrandName(item.brand)}</p>
                                    <div className="mt-2 text-lg font-black">${item.price}</div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <div className="flex items-center border rounded-lg bg-gray-50">
                                        <button
                                            className="p-2 hover:text-blue-600 disabled:opacity-30"
                                            onClick={() => updateQtyHandler(item, item.qty - 1)}
                                            disabled={item.qty === 1}
                                        >
                                            <Minus className="size-4" />
                                        </button>
                                        <span className="w-8 text-center font-bold">{item.qty}</span>
                                        <button
                                            className="p-2 hover:text-blue-600 disabled:opacity-30"
                                            onClick={() => updateQtyHandler(item, item.qty + 1)}
                                            disabled={item.qty === item.stock}
                                        >
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCartHandler(item._id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 className="size-5" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-24 border-none shadow-lg bg-gray-900 text-white">
                        <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                        <div className="space-y-4 text-sm text-gray-300">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-white">${itemsPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="text-white">${shippingPrice === 0 ? "Free" : `$${shippingPrice}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (15%)</span>
                                <span className="text-white">${taxPrice}</span>
                            </div>
                            <Separator className="bg-gray-700" />
                            <div className="flex justify-between text-lg font-bold text-white">
                                <span>Total</span>
                                <span>${totalPrice}</span>
                            </div>
                        </div>
                        <Button
                            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold"
                            onClick={() => navigate("/shipping")}
                        >
                            Proceed to Checkout
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CartScreen
