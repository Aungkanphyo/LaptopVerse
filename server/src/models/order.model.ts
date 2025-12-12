import mongoose, { Document, Model, Schema } from "mongoose";

interface IOrderItem {
    name: string;
    quantity: number;
    price: number;
    image: string; // URL of the product image
    product: mongoose.Types.ObjectId; // Reference to the actual Product
}

interface IShippingInfo {
    address: string;
    city: string;
    phoneNo: string;
    postalCode: string;
    country: string;
}

export interface IOrderDocument extends Document {
    shippingInfo: IShippingInfo;
    orderItems: IOrderItem[];

    user: mongoose.Types.ObjectId; // User who placed the order

    paymentInfo: {
        id: string; // Stripe Payment ID, etc.
        status: string; // e.g., 'succeeded', 'pending'
    };

    paidAt: Date; // Date when payment was successful

    itemsPrice: number; // Sum of all orderItems prices
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number; // Grand total (itemsPrice + tax + shipping)

    orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    deliveredAt: Date; // Date when the order was delivered

    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema: Schema<IOrderItem> = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product', // Reference to the Product Model
    },
});

const shippingInfoSchema: Schema<IShippingInfo> = new Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    phoneNo: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
});

const orderSchema: Schema<IOrderDocument> = new Schema({
    shippingInfo: { type: shippingInfoSchema, required: true },
    orderItems: [orderItemSchema], // Array of Order Items

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    paymentInfo: {
        id: { type: String }, // Stripe or other payment gateway ID
        status: { type: String, default: 'pending' }, // e.g., 'succeeded', 'pending'
    },

    paidAt: { type: Date },

    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    orderStatus: {
        type: String,
        required: true,
        default: 'Processing',
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    deliveredAt: { type: Date },
}, {
    timestamps: true,
});

const Order: Model<IOrderDocument> = mongoose.model('Order', orderSchema);

export default Order;