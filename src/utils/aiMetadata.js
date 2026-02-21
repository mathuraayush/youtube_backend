import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI metadata (title, description, tags) for a video
 * @param {string} userTitle - Original title provided by user
 * @param {string} userDescription - Original description provided by user
 * @param {string} existingTags - Existing tags if any (comma-separated)
 * @returns {Promise<{title: string, description: string, tags: string[]}>}
 */
const generateVideoMetadata = async (userTitle, userDescription, existingTags = "") => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a video metadata specialist. Improve and enhance video metadata.

Given:
- Title: "${userTitle}"
- Description: "${userDescription}"
- Existing Tags: "${existingTags}"

Please provide:
1. An improved, catchy title (max 100 characters, must be engaging)
2. An enhanced description (2-3 sentences, max 300 characters)
3. Exactly 5 relevant tags (most relevant first, no hashtags, comma-separated)

Important: The response must be ONLY valid JSON with no markdown formatting or code blocks.

Format your response as valid JSON:
{
  "title": "improved title here",
  "description": "enhanced description here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let metadata = JSON.parse(text);

    // Validate and sanitize
    if (!metadata.title || typeof metadata.title !== "string") {
      metadata.title = userTitle || "Untitled Video";
    }
    if (!metadata.description || typeof metadata.description !== "string") {
      metadata.description =
        userDescription || "Check out this interesting video!";
    }
    if (!Array.isArray(metadata.tags)) {
      metadata.tags = [];
    }

    // Ensure exactly 5 tags, trim to 30 chars each, remove duplicates
    metadata.tags = [
      ...new Set(
        metadata.tags
          .slice(0, 5)
          .map((tag) => tag.trim().toLowerCase().substring(0, 30))
      ),
    ].slice(0, 5);

    // Pad with generic tags if needed
    const genericTags = ["video", "content", "entertainment", "tutorial", "highlights"];
    while (metadata.tags.length < 5) {
      const randomTag = genericTags[Math.floor(Math.random() * genericTags.length)];
      if (!metadata.tags.includes(randomTag)) {
        metadata.tags.push(randomTag);
      }
    }

    return {
      title: metadata.title.substring(0, 100),
      description: metadata.description.substring(0, 300),
      tags: metadata.tags.slice(0, 5),
    };
  } catch (error) {
    console.error("AI Metadata generation error:", error);
    // Fallback to user-provided data
    return {
      title: userTitle || "Untitled Video",
      description: userDescription || "Interesting video content",
      tags: existingTags
        ? existingTags
            .split(",")
            .map((t) => t.trim())
            .slice(0, 5)
        : ["video", "content", "entertainment", "tutorial", "highlights"],
    };
  }
};

export { generateVideoMetadata };
