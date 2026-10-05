import mongoose, { Model, Schema } from "mongoose";

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface IOrderUser {
    _id?: mongoose.Types.ObjectId;
    fullName: string;
    email: string;
}

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

export interface IOrder<TUser = mongoose.Types.ObjectId> {
    orderCode: string; // User-friendly ID e.g., LV-45342
    shippingInfo: IShippingInfo;
    orderItems: IOrderItem[];

    user?: TUser; // Default: ObjectId | Populated: IOrderUser

    paymentInfo: {
        id?: string; // Payment gateway transaction ID
        status: string; // e.g., 'succeeded', 'pending'
        slipUrl?: string;     // Cloudinary Image URL
        slipPublicId?: string; // Cloudinary Public ID
    };

    paidAt?: Date; // Date when payment was successful

    itemsPrice: number; // Sum of all orderItems prices
    totalPrice: number; // Grand total (itemsPrice + tax + shipping)

    orderStatus: OrderStatus;
    deliveredAt?: Date; // Date when the order was delivered
    trackingInfo?: {
        courierName?: string;
        trackingNumber?: string;
    };
    cancellationReason?: string;

    createdAt: Date;
    updatedAt: Date;
}

// Reusable type for populated order
export type IPopulatedOrder = IOrder<IOrderUser>;

const orderItemSchema: Schema<IOrderItem> = new Schema({
    name: { type: String, required: true },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
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
}, {
    _id: false
}
);

const orderSchema: Schema<IOrder> = new Schema({
    orderCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    shippingInfo: { type: shippingInfoSchema, required: true },
    orderItems: [orderItemSchema], // Array of Order Items

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },

    paymentInfo: {
        id: { type: String }, // Payment gateway transaction ID
        status: { type: String, default: 'pending' }, // e.g., 'succeeded', 'pending'
        slipUrl: { type: String },
        slipPublicId: { type: String },
    },

    paidAt: { type: Date },

    itemsPrice: { 
        type: Number, 
        required: true, 
        default: 0.0,
        min: [0, 'Items price cannot be negative']
    },
    totalPrice: { 
        type: Number, 
        required: true, 
        default: 0.0,
        min: [0, 'Total price cannot be negative']
    },

    orderStatus: {
        type: String,
        required: true,
        default: 'Processing',
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    deliveredAt: { type: Date },
    trackingInfo: {
        courierName: { type: String },
        trackingNumber: { type: String },
    },
    cancellationReason: { type: String },
}, {
    timestamps: true,
});

// To speed up the retrieval and sorting of order history by user using a direct IXSCAN.
orderSchema.index({ user: 1, createdAt: -1 });
// View pagination and sorting by status in the Admin Panel.
orderSchema.index({ orderStatus: 1, createdAt: -1 });
// To view the overall sorting in the Admin Panel without the status column
orderSchema.index({ createdAt: -1 });
// To separate "Manage Orders" and "Transactions" based on payment status
orderSchema.index({ "paymentInfo.status": 1, createdAt: -1 });
// OPTIMIZATION: Sparse Index – Reduces index size by excluding documents that do not yet have a tracking number
orderSchema.index({ "trackingInfo.trackingNumber": 1 }, { sparse: true });
// OPTIMIZATION: To enable Quick Search using the phone number in the Admin Keyword Search.
orderSchema.index({ "shippingInfo.phoneNo": 1 });

export const Order: Model<IOrder> = mongoose.model('Order', orderSchema);

export default Order;