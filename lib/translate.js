// lib/translate.js
export async function translate(text, target = "ar") {
  if (!text || typeof text !== "string" || text.length > 5000) {
    console.warn("Invalid input for translation:", text);
    return text || "";
  }

  const url = "https://translate.fedilab.app/translate"; // Reliable free endpoint

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: target,
        format: "text",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Translation error: HTTP ${res.status} - ${errorText}`);
      return text; // Fallback to original text
    }

    const data = await res.json();
    console.log(`Translation success: "${text}" -> "${data.translatedText}"`);
    return data.translatedText || text;
  } catch (err) {
    console.error(`Translation failed for "${text}":`, err.message);
    return text; // Fallback to original text
  }
}
