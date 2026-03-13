import Order from "../models/order.model";
import { Transform } from "stream";

export const getOrderExportStream = (startDate?: string, endDate?: string) => {
    const query: any = { orderStatus: { $ne: 'Cancelled' } };

    if (startDate && endDate) {
        query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const mongooseCursor = Order.find(query)
        .populate('user', 'fullName email') // Populate user details
        .sort({ createdAt: -1 }) // Sort by creation date (newest first)
        .cursor({ batchSize: 1000 }); // Set batch size for efficient streaming

    const transformer = new Transform({
        objectMode: true,
        transform(order, encoding, callback) {
            callback(null, {
                'Order ID': order._id.toString(),
                'Customer Name': order.user?.fullName || 'N/A',
                'Customer Email': order.user?.email || 'N/A',
                'Total Price': order.totalPrice,
                'Status': order.orderStatus,
                'Address': order.shippingInfo?.address || 'N/A',
                'City': order.shippingInfo?.city || 'N/A',
                'Phone': order.shippingInfo?.phoneNo,
                'Date': order.createdAt.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            })
        }
    });

    return { mongooseCursor, transformer };
};