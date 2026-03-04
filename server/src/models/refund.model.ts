import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRefund extends Document {
    order: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: {
        product: mongoose.Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    totalRefundAmount: number;
    reason: string;
    status: 'requested' | 'processing' | 'completed' | 'rejected';
    adminNote?: string;
    processedBy?: mongoose.Types.ObjectId;
}

const RefundSchema = new Schema<IRefund>({
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalRefundAmount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['requested', 'processing', 'completed', 'rejected'], default: 'requested' },
    adminNote: { type: String },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Refund: Model<IRefund> = mongoose.model('Refund', RefundSchema);

export default Refund;