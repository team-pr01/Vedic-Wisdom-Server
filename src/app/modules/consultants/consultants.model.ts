import { Schema, model } from "mongoose";
import { TConsultancyService } from "./consultants.interface";

const ConsultancyServiceSchema = new Schema<TConsultancyService>(
  {
    imageUrl: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    specialties: {
      type: [String],
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    fees: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ConsultancyService = model<TConsultancyService>(
  "ConsultancyService",
  ConsultancyServiceSchema
);

/* TEXT SEARCH INDEX */
ConsultancyServiceSchema.index({
  name: "text",
  specialty: "text",
  category: "text",
  email: "text",
  phoneNumber: "text",
});

export default ConsultancyService;
