import mongoose, { Document, Model, Schema } from "mongoose";

interface IReview {
    user: mongoose.Schema.Types.ObjectId; // Review ပေးတဲ့ User ID
    name: string;
    rating: number; // 1 to 5
    comment: string;
}

interface IImage {
    public_id: string; // Cloudinary ID
    url: string; // Image url
}

// Main Product Document Interface
export interface IProductDocument extends Document {
    name: string;
    description: string;
    price: number;
    images: IImage[];
    category: string;
    brand: string;
    stock: number;
    processor: string; // e.g., Intel Core i7, AMD Ryzen 7
    ram: string;       // e.g., 16GB DDR4
    storage: string;   // e.g., 512GB SSD
    screenSize: number; // e.g., 15.6 (inches)

    // User reviews
    reviews: IReview[];
    ratings: number; // Overall calculated rating (4.5, 5, etc.)
    numOfReviews: number; // Total number of reviews

    // Admin/Creator Info
    user: mongoose.Schema.Types.ObjectId; // Product ကို ဖန်တီးခဲ့သော Admin/User ID

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema: Schema<IReview> = new Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    }, {
        timestamps: true,
    });

const productSchema: Schema<IProductDocument> = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [8, 'Product price cannot exceed 8 digits'],
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: ['Gaming', 'Business', 'Creator', 'Basic'],
            message: 'Please select correct category for product',
        },
    },
    brand: {
        type: String,
        required: [true, 'Please enter product brand'],
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock quantity'],
        maxLength: [5, 'Stock cannot exceed 5 digits'],
        default: 0,
    },
    // Specs
    processor: { type: String, required: true },
    ram: { type: String, required: true },
    storage: { type: String, required: true },
    screenSize: { type: Number, required: true },

    // Review
    reviews: [reviewSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },

    // Creator(Admin)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const Produt: Model<IProductDocument> = mongoose.model('Product', productSchema);

export default Produt;