import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGuideDocument extends Document {
    title: string;
    slug: string;
    summary: string;
    content: string;
    category: string;
    readTime: string;
    image?: {
        public_id: string; // Cloudinary ID
        url: string; // Image URL
    };
    isPublished: boolean;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const createUnicodeSlug = (text: string): string => {
    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const guideSchema = new Schema<IGuideDocument>(
    {
        title: {
            type: String,
            required: [true, "Please enter guide title"],
            trim: true,
            unique: true,
            maxLength: [150, "Title cannot exceed 150 characters"],
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        summary: {
            type: String,
            required: [true, "Please enter short summary"],
            maxLength: [300, "Summary cannot exceed 300 characters"],
        },
        content: {
            type: String,
            required: [true, "Please enter guide content"],
        },
        category: {
            type: String,
            required: [true, "Please select category"],
            default: "Buying Guide",
        },
        readTime: {
            type: String,
            default: "5 min read",
        },
        image: {
            public_id: { type: String },
            url: { type: String },
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

guideSchema.index({ isPublished: 1, createdAt: -1 });

guideSchema.pre<IGuideDocument>("save", async function () {
    if (this.isModified("title")) {
        let baseSlug = createUnicodeSlug(this.title);

        if (!baseSlug) {
            baseSlug = `guide-${Date.now()}`;
        }

        const GuideModel = this.constructor as Model<IGuideDocument>;

        const slugRegex = new RegExp(`^${baseSlug}(-[0-9]+)?$`, "i");
        const existingGuides = await GuideModel.find({
            slug: slugRegex,
            _id: { $ne: this._id },
        })
            .select("slug")
            .lean();

        if (existingGuides.length > 0) {
            const existingSlugs = new Set(existingGuides.map((g) => g.slug));

            if (existingSlugs.has(baseSlug)) {
                let count = 1;
                while (existingSlugs.has(`${baseSlug}-${count}`)) {
                    count++;
                }
                this.slug = `${baseSlug}-${count}`;
            } else {
                this.slug = baseSlug;
            }
        } else {
            this.slug = baseSlug;
        }
    }
});

const Guide: Model<IGuideDocument> = mongoose.model("Guide", guideSchema);
export default Guide;