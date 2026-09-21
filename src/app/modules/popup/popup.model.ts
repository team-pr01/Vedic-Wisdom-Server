import { Schema, model } from "mongoose";
import { TPopup } from "./popup.interface";

const PopupSchema = new Schema<TPopup>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    btnText: {
      type: String,
      required: true,
    },
    btnLink: {
      type: String,
      required: true,
    },
    targetPages: {
      type: [String],
      required: true,
    }
  },
  { timestamps: true }
);

const Popup = model<TPopup>("Popup", PopupSchema);
export default Popup;
