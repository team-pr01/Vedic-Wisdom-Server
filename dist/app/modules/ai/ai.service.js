"use strict";
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
exports.AiServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../errors/AppError"));
const openai_1 = require("../../utils/openai");
const bookText_model_1 = __importDefault(require("../book/texts/bookText.model"));
// import BookText from "../book/texts/bookText.model";
const news_model_1 = __importDefault(require("../news/news.model"));
// import Quiz from "../quiz/quiz.model";
const SYSTEM_PROMPT = `
You are "Vedic Wisdom", a knowledgeable assistant representing the Arya Kalyan Foundation.

Your role is to provide accurate and respectful information related ONLY to:

• Vedic scriptures (Vedas, Upanishads, Brahmanas, Aranyakas)
• Hindu philosophy and Vedanta
• Vedic rituals, practices, and traditions
• Hindu culture and dharma
• Sanskrit verses and their meanings
• Ancient Indian spiritual knowledge
• Hindu epics like Ramayana and Mahabharata
• Teachings of Vedic sages and rishis
• Concepts such as karma, dharma, moksha, yajna, yoga, etc.

Important Rules:
1. Only answer questions related to Hindu/Vedic knowledge.
2. If a user asks about unrelated topics (technology, politics, general world knowledge, etc.), politely decline.
3. When declining, guide the user back to Vedic or Hindu knowledge topics.
4. Always maintain a respectful, calm, and spiritual tone.
5. Do not generate harmful, misleading, or non-religious content.
6. If a scripture is referenced, provide authentic context if possible.

If a question is unrelated, respond like this:
"I am a Vedic Wisdom assistant and can only help with topics related to Vedic knowledge, Hindu scriptures, philosophy, and traditions."

Always keep answers clear, concise, and spiritually respectful.
`;
const aiChat = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const completion = yield openai_1.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            {
                role: "user",
                content: message,
            },
        ],
    });
    return ((_a = completion.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || "No response";
});
const translateShloka = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { textId, languageCodes } = payload;
    // Fetch original Sanskrit text
    const bookText = yield bookText_model_1.default.findById(textId);
    if (!bookText)
        throw new AppError_1.default(404, "Book text not found");
    // Use primary translation as source
    const inputText = bookText.primaryTranslation || bookText.originalText;
    // Build GPT system message
    const systemMessage = `
You are a Vedic scholar who translates Sanskrit shlokas.
Translate the following text (already translated from Sanskrit) into exactly ${languageCodes.length} languages listed below.
For each language, provide:
- translation: simple, clear meaning
- sanskritWordBreakdown: an array of objects with sanskritWord, shortMeaning, descriptiveMeaning

Return JSON in the format:
{
${languageCodes
        .map((code) => `  "${code}": { "translation": "...", "sanskritWordBreakdown": [ { "sanskritWord": "...", "shortMeaning": "...", "descriptiveMeaning": "..." } ] }`)
        .join(",\n")}
}
`;
    // GPT request
    const response = yield openai_1.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: inputText },
        ],
        temperature: 0,
        max_tokens: 4000,
    });
    const contentRes = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
    let translations;
    try {
        translations = JSON.parse(contentRes || "{}");
    }
    catch (err) {
        throw new AppError_1.default(500, "Failed to parse GPT response: " + contentRes);
    }
    // Check for missing languages
    const missing = languageCodes.filter((code) => !translations[code]);
    if (missing.length > 0)
        throw new AppError_1.default(500, `GPT did not return translations for: ${missing.join(", ")}`);
    // Merge new translations with existing ones
    const updatedTranslations = [...(bookText.translations || [])];
    for (const code of languageCodes) {
        const idx = updatedTranslations.findIndex((t) => t.langCode === code);
        const newTrans = {
            langCode: code,
            translation: translations[code].translation || "",
            sanskritWordBreakdown: translations[code].sanskritWordBreakdown || [],
        };
        if (idx >= 0) {
            // Replace existing translation
            updatedTranslations[idx] = newTrans;
        }
        else {
            // Add new translation
            updatedTranslations.push(newTrans);
        }
    }
    // Update BookText in DB
    const updatedText = yield bookText_model_1.default.findByIdAndUpdate(textId, { $set: { translations: updatedTranslations } }, { new: true, runValidators: true });
    if (!updatedText)
        throw new AppError_1.default(404, "Book text not found after update");
    return updatedText;
});
const generateRecipe = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const response = yield openai_1.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a professional chef with expertise in global cuisines. 
                 Provide detailed recipes with:
                 - Clear instructions
                 - Preparation time
                 - Cooking time
                 - Serving size
                 - Tips/variations when applicable`,
            },
            {
                role: "user",
                content: query,
            },
        ],
        temperature: 0.7,
        max_tokens: 1000,
    });
    return ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "Could not generate recipe";
});
// const generateQuiz = async (title: string) => {
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content: `You are an expert quiz generator. 
//                   Respond ONLY with valid JSON.
//                   Generate BETWEEN 10 and 15 questions for the given topic.
//                   Format:
//                   [
//                     {
//                       "question": "string",
//                       "options": ["string","string","string","string"],
//                       "correctAnswer": number (1-4)
//                     }
//                   ]`,
//       },
//       { role: "user", content: `Generate a quiz on the topic: ${title}` },
//     ],
//     temperature: 0.7,
//     max_tokens: 1000,
//   });
//   let content = response.choices[0]?.message?.content || "[]";
//   // strip ```json ... ```
//   content = content
//     .replace(/```json/gi, "")
//     .replace(/```/g, "")
//     .trim();
//   let questions: any[] = [];
//   try {
//     questions = JSON.parse(content);
//   } catch (error) {
//     console.error("Failed to parse AI response:", content, error);
//     return null;
//   }
//   if (!questions || questions.length === 0) {
//     return null;
//   }
//   // 🛠 Save to DB inside service
//   const newQuiz = await Quiz.create({ title, questions });
//   return newQuiz;
// };
const translateNews = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { newsId, title, content, tags, category, batchLanguages } = payload;
    // Input text for GPT
    const inputText = `Title: ${title}
Content: ${content}
Tags: ${tags.join(", ")}
Category: ${category}`;
    // GPT prompt
    const systemMessage = `
You are a professional translator.
Translate the following news into exactly ${batchLanguages.length} languages provided.
Output JSON in the following format:

{
${batchLanguages
        .map((lang) => `  "${lang.code}": { "title": "...", "content": "...", "tags": [...], "category": "..." }`)
        .join(",\n")}
}

Only include the languages listed in this fixed list:
${batchLanguages.map((lang) => `${lang.code} (${lang.name})`).join(", ")}
`;
    // Call GPT
    const response = yield openai_1.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: inputText },
        ],
        temperature: 0,
        max_tokens: 4000,
    });
    const contentRes = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
    let translations;
    try {
        translations = JSON.parse(contentRes || "{}");
    }
    catch (err) {
        throw new AppError_1.default(500, "Failed to parse translations. GPT response: " + contentRes);
    }
    const missingLanguages = batchLanguages.filter((lang) => !translations[lang.code]);
    if (missingLanguages.length > 0) {
        throw new AppError_1.default(500, `GPT did not return translations for: ${missingLanguages
            .map((l) => l.name)
            .join(", ")}`);
    }
    const setObj = {};
    for (const [code, value] of Object.entries(translations)) {
        const v = value;
        setObj[`translations.${code}`] = {
            title: v.title || "",
            content: v.content || "",
            tags: v.tags || [],
            category: v.category || category,
        };
    }
    // Update News safely
    const updatedNews = yield news_model_1.default.findByIdAndUpdate(newsId, { $set: setObj }, { new: true, runValidators: true });
    if (!updatedNews)
        throw new AppError_1.default(404, "News not found");
    return updatedNews;
});
const generateKundli = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, birthDate, birthTime, birthPlace, }) {
    var _b, _c;
    const response = yield openai_1.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an expert Vedic astrologer (Hindu Jyotish Acharya).
        You specialize in creating detailed Janam Kundlis (birth charts).
        When asked, generate an authentic Hindu-style Kundli analysis using Vedic astrology principles.
        Include:
        - **Basic Details:** (Name, Date, Time, Place)
        - **Ascendant (Lagna)** and its meaning
        - **Planetary positions (Graha Sthiti)** overview
        - **Zodiac sign (Rashi)** and **Nakshatra**
        - **Dasha / Mahadasha** explanation (general overview)
        - **Personality traits** based on planetary alignment
        - **Career, Health, Marriage, Finance** insights
        - **Remedies and suggestions (Upay)** — like gemstones, mantra, or pooja.
        Keep the explanation structured and easy to read for a general person.`,
            },
            {
                role: "user",
                content: `Generate a Hindu Kundli for:
        Name: ${name}
        Date of Birth: ${birthDate}
        Time of Birth: ${birthTime}
        Place of Birth: ${birthPlace}`,
            },
        ],
        temperature: 0.8,
        max_tokens: 1200,
    });
    return ((_c = (_b = response.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "Could not generate Kundli";
});
const generateMuhurta = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const response = yield openai_1.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a professional Vedic astrologer with deep knowledge of Panchang, Nakshatra, Tithi, Yoga, and Karana.
        Provide accurate Hindu-style Muhurta (auspicious time) for the given event.
        The output should include:
        - Auspicious Date & Time Range (with reason)
        - Tithi, Nakshatra, Yoga, Karana
        - Planetary positions influencing the event
        - Dosha (if any) and remedies
        - General guidance or precautions
        Always explain in a respectful and spiritual tone.`,
            },
            {
                role: "user",
                content: query,
            },
        ],
        temperature: 0.7,
        max_tokens: 1000,
    });
    return ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "Could not generate Muhurta";
});
const generateVastuAnalysis = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const response = yield openai_1.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an expert Vastu Shastra consultant with deep knowledge of:
        - Directions (North, South, East, West, NE, NW, SE, SW)
        - Vastu Purusha Mandala
        - Energy flow (Prana), elemental balance (Earth, Water, Fire, Air, Space)
        - Residential, commercial, and land Vastu
        
        Provide accurate and practical Vastu analysis based on the user's query.
        The response must include:

        1. **Problem Summary** – What Vastu issue the user is facing  
        2. **Directional Analysis** – Impact of directions/elements  
        3. **Vastu Dosha Analysis** – Identify any imbalances  
        4. **Corrections (Remedies)** – Without renovation if possible  
        5. **Energy Flow Explanation**  
        6. **Professional Recommendations**  
        
        Tone: warm, spiritual, and respectful.
        Do not generate fear or negativity. Keep the guidance positive.`,
            },
            {
                role: "user",
                content: query,
            },
        ],
        temperature: 0.6,
        max_tokens: 1200,
    });
    return ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "Could not generate Vastu analysis";
});
exports.AiServices = {
    aiChat,
    translateShloka,
    generateRecipe,
    // generateQuiz,
    translateNews,
    generateKundli,
    generateMuhurta,
    generateVastuAnalysis
};
