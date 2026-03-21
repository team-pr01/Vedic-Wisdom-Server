"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BooksSchema = new mongoose_1.Schema({
    imageUrl: { type: String, default: "" },
    name: { type: String, required: [true, "Book name is required"], trim: true },
    type: {
        type: String,
        enum: ["veda", "purana", "upanishad"],
        required: [true, "Book type is required"],
    },
    structure: {
        type: String,
        enum: ["Chapter-Verse", "Mandala-Sukta-Rik", "Kanda-Sarga-Shloka", "Custom"],
        required: [true, "Structure is required"],
    },
    levels: [
        {
            name: { type: String, required: true },
        },
    ],
}, { timestamps: true });
/* TEXT SEARCH INDEX */
BooksSchema.index({
    name: "text",
});
const Books = (0, mongoose_1.model)("Books", BooksSchema);
exports.default = Books;
