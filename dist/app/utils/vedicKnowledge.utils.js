"use strict";
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDuplicateContent = exports.cleanTextForEmbedding = exports.extractTextFromFile = exports.generateContentHash = exports.chunkText = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mammoth_1 = __importDefault(require("mammoth"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
/**
 * Splits a large text into meaningful chunks
 * Keeps paragraphs together and respects sentence boundaries
 */
const chunkText = (text, documentId, title, category, maxChunkSize = 1000, overlap = 200) => {
    // Remove extra whitespace and normalize
    const cleanedText = text.replace(/\s+/g, " ").trim();
    // Split by paragraphs first
    const paragraphs = cleanedText.split(/\n\s*\n/);
    const chunks = [];
    let currentChunk = "";
    let chunkIndex = 0;
    for (const paragraph of paragraphs) {
        const trimmedParagraph = paragraph.trim();
        if (!trimmedParagraph)
            continue;
        // If adding this paragraph exceeds max size, save current chunk and start new
        if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk.length > 0) {
            // Save current chunk
            chunks.push({
                content: currentChunk.trim(),
                metadata: {
                    documentId,
                    title,
                    category,
                    chunkIndex,
                    totalChunks: 0, // Will update later
                },
            });
            chunkIndex++;
            // Start new chunk with overlap
            const overlapText = currentChunk.slice(-overlap);
            currentChunk = overlapText + " " + trimmedParagraph;
        }
        else {
            currentChunk += (currentChunk ? " " : "") + trimmedParagraph;
        }
    }
    // Don't forget the last chunk
    if (currentChunk.trim()) {
        chunks.push({
            content: currentChunk.trim(),
            metadata: {
                documentId,
                title,
                category,
                chunkIndex,
                totalChunks: 0,
            },
        });
    }
    // Update totalChunks for all chunks
    const totalChunks = chunks.length;
    chunks.forEach((chunk, index) => {
        chunk.metadata.totalChunks = totalChunks;
        chunk.metadata.chunkIndex = index;
    });
    return chunks;
};
exports.chunkText = chunkText;
/**
 * Generates content hash for duplicate detection
 */
const generateContentHash = (content) => {
    return crypto_1.default
        .createHash("sha256")
        .update(content)
        .digest("hex");
};
exports.generateContentHash = generateContentHash;
/**
 * Extracts text from various file types
 */
const extractTextFromFile = (fileBuffer, mimeType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (mimeType) {
            case "application/pdf": {
                console.log('📖 Extracting text from PDF...');
                // ✅ Use pdfParse directly (not .default)
                const pdfData = yield (0, pdf_parse_1.default)(fileBuffer);
                console.log(`✅ Extracted ${pdfData.text.length} characters from PDF`);
                return pdfData.text;
            }
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
                console.log('📖 Extracting text from DOCX...');
                const docxResult = yield mammoth_1.default.extractRawText({ buffer: fileBuffer });
                console.log(`✅ Extracted ${docxResult.value.length} characters from DOCX`);
                return docxResult.value;
            }
            case "text/plain": {
                console.log('📖 Extracting text from TXT file...');
                const text = fileBuffer.toString("utf-8");
                console.log(`✅ Extracted ${text.length} characters from TXT`);
                return text;
            }
            default:
                throw new Error(`Unsupported file type: ${mimeType}`);
        }
    }
    catch (error) {
        console.error('❌ Error extracting text from file:', error);
        throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});
exports.extractTextFromFile = extractTextFromFile;
/**
 * Clean text for better embeddings
 */
const cleanTextForEmbedding = (text) => {
    return text
        .replace(/[^\w\s.,!?-]/g, " ") // Remove special characters
        .replace(/\s+/g, " ") // Multiple spaces to single
        .trim()
        .slice(0, 8000); // OpenAI limit
};
exports.cleanTextForEmbedding = cleanTextForEmbedding;
/**
 * Check if content is duplicate
 */
const isDuplicateContent = (contentHash, model) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield model.findOne({ contentHash });
    return !!existing;
});
exports.isDuplicateContent = isDuplicateContent;
