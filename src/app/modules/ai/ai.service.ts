/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errors/AppError";
import { openai } from "../../utils/openai";
import BookText from "../book/texts/bookText.model";
import News from "../news/news.model";
import Quiz from "../quiz/quiz.model";

interface TranslatePayload {
  newsId: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  batchLanguages: { code: string; name: string }[];
}

const aiChat = async (message: string) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: message }],
  });

  return completion.choices[0].message?.content || "No response";
};

type TranslateShlokaPayload = {
  textId: string;
  languageCodes: string[];
};

const translateShloka = async (payload: TranslateShlokaPayload) => {
  const { textId, languageCodes } = payload;

  // Fetch original Sanskrit text
  const bookText = await BookText.findById(textId);
  if (!bookText) throw new AppError(404, "Book text not found");

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
  .map(
    (code) =>
      `  "${code}": { "translation": "...", "sanskritWordBreakdown": [ { "sanskritWord": "...", "shortMeaning": "...", "descriptiveMeaning": "..." } ] }`
  )
  .join(",\n")}
}
`;

  // GPT request
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: inputText },
    ],
    temperature: 0,
    max_tokens: 4000,
  });

  const contentRes = response.choices[0]?.message?.content;

  let translations;
  try {
    translations = JSON.parse(contentRes || "{}");
  } catch (err) {
    throw new AppError(500, "Failed to parse GPT response: " + contentRes);
  }

  // Check for missing languages
  const missing = languageCodes.filter((code) => !translations[code]);
  if (missing.length > 0)
    throw new AppError(
      500,
      `GPT did not return translations for: ${missing.join(", ")}`
    );

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
    } else {
      // Add new translation
      updatedTranslations.push(newTrans);
    }
  }

  // Update BookText in DB
  const updatedText = await BookText.findByIdAndUpdate(
    textId,
    { $set: { translations: updatedTranslations } },
    { new: true, runValidators: true }
  );

  if (!updatedText) throw new AppError(404, "Book text not found after update");

  return updatedText;
};

const generateRecipe = async (query: string) => {
  const response = await openai.chat.completions.create({
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

  return response.choices[0]?.message?.content || "Could not generate recipe";
};

const generateQuiz = async (title: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert quiz generator. 
                  Respond ONLY with valid JSON.
                  Generate BETWEEN 10 and 15 questions for the given topic.
                  Format:
                  [
                    {
                      "question": "string",
                      "options": ["string","string","string","string"],
                      "correctAnswer": number (1-4)
                    }
                  ]`,
      },
      { role: "user", content: `Generate a quiz on the topic: ${title}` },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  let content = response.choices[0]?.message?.content || "[]";

  // strip ```json ... ```
  content = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let questions: any[] = [];
  try {
    questions = JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse AI response:", content, error);
    return null;
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  // 🛠 Save to DB inside service
  const newQuiz = await Quiz.create({ title, questions });

  return newQuiz;
};

const translateNews = async (payload: TranslatePayload) => {
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
  .map(
    (lang) =>
      `  "${lang.code}": { "title": "...", "content": "...", "tags": [...], "category": "..." }`
  )
  .join(",\n")}
}

Only include the languages listed in this fixed list:
${batchLanguages.map((lang) => `${lang.code} (${lang.name})`).join(", ")}
`;

  // Call GPT
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: inputText },
    ],
    temperature: 0,
    max_tokens: 4000,
  });

  const contentRes = response.choices[0]?.message?.content;

  let translations;
  try {
    translations = JSON.parse(contentRes || "{}");
  } catch (err) {
    throw new AppError(
      500,
      "Failed to parse translations. GPT response: " + contentRes
    );
  }

  const missingLanguages = batchLanguages.filter(
    (lang) => !translations[lang.code]
  );
  if (missingLanguages.length > 0) {
    throw new AppError(
      500,
      `GPT did not return translations for: ${missingLanguages
        .map((l) => l.name)
        .join(", ")}`
    );
  }
  const setObj: Record<string, any> = {};
  for (const [code, value] of Object.entries(translations)) {
    const v = value as {
      title?: string;
      content?: string;
      tags?: string[];
      category?: string;
    };
    setObj[`translations.${code}`] = {
      title: v.title || "",
      content: v.content || "",
      tags: v.tags || [],
      category: v.category || category,
    };
  }

  // Update News safely
  const updatedNews = await News.findByIdAndUpdate(
    newsId,
    { $set: setObj },
    { new: true, runValidators: true }
  );
  if (!updatedNews) throw new AppError(404, "News not found");

  return updatedNews;
};

const generateKundli = async ({
  name,
  birthDate,
  birthTime,
  birthPlace,
}: {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}) => {
  const response = await openai.chat.completions.create({
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

  return response.choices[0]?.message?.content || "Could not generate Kundli";
};

const generateMuhurta = async (query: string) => {
  const response = await openai.chat.completions.create({
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

  return response.choices[0]?.message?.content || "Could not generate Muhurta";
};

const generateVastuAnalysis = async (query: string) => {
  const response = await openai.chat.completions.create({
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

  return response.choices[0]?.message?.content || "Could not generate Vastu analysis";
};


export const AiServices = {
  aiChat,
  translateShloka,
  generateRecipe,
  generateQuiz,
  translateNews,
  generateKundli,
  generateMuhurta,
  generateVastuAnalysis
};
