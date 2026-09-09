import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveShippingInfo } from './cartSlice';
import CheckoutSteps from '@/components/layout/CheckoutSteps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ShippingScreen = () => {
    const { shippingInfo } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [address, setAddress] = useState(shippingInfo?.address || "");
    const [city, setCity] = useState(shippingInfo?.city || "");
    const [phoneNo, setPhoneNo] = useState(shippingInfo?.phoneNo || "");
    const [zipCode, setZipCode] = useState(shippingInfo?.zipCode || "");
    const [country, setCountry] = useState(shippingInfo?.country || "");

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(saveShippingInfo({ address, city, phoneNo, zipCode, country }));
        navigate("/payment");
    };

    return (
        <div className="min-h-screen bg-[#070913] text-slate-100 py-10">
            <div className="container max-w-2xl mx-auto px-4">
                <CheckoutSteps currentStep={1} className="mb-8" />

                <Card className="rounded-3xl border border-slate-800/80 bg-[#0e1322] shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2.5 text-white">
                            <MapPin className="text-blue-500 size-6" /> Shipping Address
                        </CardTitle>
                        <p className="text-slate-400 text-sm">Please enter your delivery details carefully.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-slate-300 font-medium">Street Address</Label>
                                <Input
                                    id="address"
                                    placeholder="No. 123, Main Street..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="bg-[#070913] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500 h-11 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-slate-300 font-medium">City</Label>
                                    <Input
                                        id="city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="bg-[#070913] border-slate-800 text-slate-100 focus-visible:ring-blue-500 h-11 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-slate-300 font-medium">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phoneNo}
                                        onChange={(e) => setPhoneNo(e.target.value)}
                                        className="bg-[#070913] border-slate-800 text-slate-100 focus-visible:ring-blue-500 h-11 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="zip" className="text-slate-300 font-medium">Zip Code</Label>
                                    <Input
                                        id="zip"
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        className="bg-[#070913] border-slate-800 text-slate-100 focus-visible:ring-blue-500 h-11 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country" className="text-slate-300 font-medium">Country</Label>
                                    <Input
                                        id="country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="bg-[#070913] border-slate-800 text-slate-100 focus-visible:ring-blue-500 h-11 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer mt-2"
                            >
                                Continue to Payment
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ShippingScreen
