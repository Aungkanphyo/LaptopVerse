import mongoose, { Document, Model } from "mongoose";
import slugify from "slugify";

export interface IBrandDocument extends Document {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string; // For brand logo (Optional)
    isActive: boolean;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

const brandSchema = new mongoose.Schema<IBrandDocument>({
    name: {
        type: String,
        required: [true, 'Please enter brand name'],
        trim: true,
        unique: true,
        maxLength: [50, 'Brand name cannot exceed 50 characters'],
    },
    slug: {
        type: String,
        unique: true,
        index: true,
    },
    description: {
        type: String,
        maxLength: [200, 'Brand description cannot exceed 200 characters'],
    },
    logoUrl: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

brandSchema.pre<IBrandDocument>('save', async function(t) {
    if(this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

const Brand: Model<IBrandDocument> = mongoose.model('Brand', brandSchema);
export default Brand;