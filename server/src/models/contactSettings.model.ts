import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContactSettingsDocument extends Document {
  email: string;
  phone: string;
  address: string;
  workingHours?: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const contactSettingsSchema = new Schema<IContactSettingsDocument>(
  {
    email: {
      type: String,
      required: [true, "Please enter contact email"],
      default: "support@laptopverse.tech",
    },
    phone: {
      type: String,
      required: [true, "Please enter contact phone"],
      default: "+95 9 123 456 789",
    },
    address: {
      type: String,
      required: [true, "Please enter store address"],
      default: "100 Tech Plaza, Silicon Hub, Yangon",
    },
    workingHours: {
      type: String,
      default: "Mon - Sat: 9:00 AM - 6:00 PM",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ContactSettings: Model<IContactSettingsDocument> = mongoose.model(
  "ContactSettings",
  contactSettingsSchema
);
export default ContactSettings;