import mongoose, { Document, Model, Schema } from "mongoose";
import slugify from "slugify";

export interface IGuideDocument extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  readTime: string;
  image?: string;
  isPublished: boolean;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
      type: String,
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

guideSchema.pre<IGuideDocument>("save", async function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

const Guide: Model<IGuideDocument> = mongoose.model("Guide", guideSchema);
export default Guide;