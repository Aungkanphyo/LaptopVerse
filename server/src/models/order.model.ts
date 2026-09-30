import mongoose, { Document, Model, Schema } from "mongoose";

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
    shippingInfo: IShippingInfo;
    orderItems: IOrderItem[];

    user: TUser; // Default: ObjectId | Populated: IOrderUser

    paymentInfo: {
        id: string; // Payment gateway transaction ID
        status: string; // e.g., 'succeeded', 'pending'
        slipUrl?: string;     // Cloudinary Image URL
        slipPublicId?: string; // Cloudinary Public ID
    };

    paidAt: Date; // Date when payment was successful

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

const orderSchema: Schema<IOrder> = new Schema({
    shippingInfo: { type: shippingInfoSchema, required: true },
    orderItems: [orderItemSchema], // Array of Order Items

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    paymentInfo: {
        id: { type: String }, // Payment gateway transaction ID
        status: { type: String, default: 'pending' }, // e.g., 'succeeded', 'pending'
        slipUrl: { type: String },
        slipPublicId: { type: String },
    },

    paidAt: { type: Date },

    itemsPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

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

// For filtering by status and sorting by date
orderSchema.index({ orderStatus: 1, createdAt: -1 });
// To sort and extract orders by date
orderSchema.index({ createdAt: -1 });
// Quickly find order by tracking number
orderSchema.index({ "trackingInfo.trackingNumber": 1 });
// Quickly pull up the relevant user's order history
orderSchema.index({ user: 1 });

export const Order: Model<IOrder> = mongoose.model('Order', orderSchema);

export default Order;