import mongoose, { Document, Model, Schema } from "mongoose";
import slugify from "slugify";

export interface ICategoryDocument extends Document {
    name: string;
    slug: string; // eg, "gaming-laptops" (for SEO)
    description?: string;
    isActive: boolean; // To temporarily hide a category, use
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategoryDocument>({
    name: {
        type: String,
        required: [true, 'Please enter category name'],
        trim: true,
        unique: true,
        maxLength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        index: true // Indexing to speed up searching
    },
    description: {
        type: String,
        maxLength: [200, 'Description cannot exceed 200 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Pre-save hook: Automatically convert name to URL-friendly slug
categorySchema.pre<ICategoryDocument>('save', async function() {
    if(this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

const Category: Model<ICategoryDocument> = mongoose.model('Category', categorySchema);
export default Category;