// Language mapping: UI language name to Bhashini standard ISO-639-1 language code
const languageMap = {
  "english": "en",
  "hindi": "hi",
  "tamil": "ta",
  "telugu": "te",
  "kannada": "kn",
  "bengali": "bn",
  "marathi": "mr",
  "gujarati": "gu"
};

const getLanguageCode = (langName) => {
  if (!langName) return "en";
  const normalized = langName.trim().toLowerCase();
  return languageMap[normalized] || "en";
};

const translateText = async (text, sourceLangName, targetLangName) => {
  const userId = process.env.BHASHINI_USER_ID;
  const apiKey = process.env.BHASHINI_API_KEY;
  const pipelineId = process.env.BHASHINI_PIPELINE_ID || "64392f96daac500b55c543cd";

  const sourceLang = getLanguageCode(sourceLangName);
  const targetLang = getLanguageCode(targetLangName);

  // If source and target are the same language, no translation is needed
  if (sourceLang === targetLang) return text;
  if (!text || !text.trim()) return "";

  // Check if credentials are set/valid placeholders
  const hasCredentials = userId && 
                         !userId.startsWith("your_") && 
                         apiKey && 
                         !apiKey.startsWith("your_");

  if (!hasCredentials) {
    console.log(`[Bhashini Simulated Fallback] Translating "${text.substring(0, 40)}..." from ${sourceLang} to ${targetLang}`);
    return await simulateTranslation(text, sourceLangName, targetLangName);
  }

  try {
    // Step 1: Call ULCA getModelsPipeline to fetch inference key and service configuration
    const pipelineUrl = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";
    const pipelinePayload = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: sourceLang,
              targetLanguage: targetLang
            }
          }
        }
      ],
      pipelineRequestConfig: {
        pipelineId: pipelineId
      }
    };

    console.log(`[Bhashini Service] Fetching pipeline config for ${sourceLang} -> ${targetLang}...`);
    const configRes = await fetch(pipelineUrl, {
      method: "POST",
      headers: {
        "userID": userId,
        "ulcaApiKey": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pipelinePayload)
    });

    if (!configRes.ok) {
      throw new Error(`Pipeline config request failed with status: ${configRes.status}`);
    }

    const configData = await configRes.json();
    
    // Extract inference key, header name, and callback URL from pipelineInferenceAPIEndPoint (handling all possible casings)
    const inferenceEndPoint = configData.pipelineInferenceAPIEndPoint || 
                             configData.pipelineInferenceAPIEndpoint || 
                             configData.pipelineInferenceApiEndPoint || 
                             configData.pipelineInferenceApiEndpoint;
                             
    const inferenceApiKeyName = inferenceEndPoint?.inferenceApiKey?.name || "Authorization";
    const inferenceApiKeyValue = inferenceEndPoint?.inferenceApiKey?.value;
    const computeUrl = inferenceEndPoint?.callbackUrl || "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";
    
    // Extract serviceId from pipelineResponseConfig array (handling multiple possible structures)
    const responseConfig = configData.pipelineResponseConfig || 
                           configData.pipelineResponseRequestConfig?.pipelineTasks;
                           
    const taskObj = responseConfig?.find(
      t => t.taskType === "translation"
    );
    
    const taskConfig = Array.isArray(taskObj?.config) ? taskObj?.config[0] : taskObj?.config;
    const serviceId = taskConfig?.serviceId;

    if (!inferenceApiKeyValue || !serviceId) {
      throw new Error("Failed to retrieve Bhashini Inference Key or Service ID for translation");
    }

    // Step 2: Request translation compute using the serviceId and inferenceApiKey
    const computePayload = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: sourceLang,
              targetLanguage: targetLang
            },
            serviceId: serviceId
          }
        }
      ],
      inputData: {
        input: [
          {
            source: text
          }
        ]
      }
    };

    console.log(`[Bhashini Service] Sending inference compute translation request to ${computeUrl}...`);
    
    const headers = {
      "Content-Type": "application/json"
    };
    headers[inferenceApiKeyName] = inferenceApiKeyValue;

    const translationRes = await fetch(computeUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(computePayload)
    });

    if (!translationRes.ok) {
      throw new Error(`Inference request failed with status: ${translationRes.status}`);
    }

    const translationData = await translationRes.json();
    const translatedText = translationData?.pipelineResponse?.[0]?.output?.[0]?.target;
    if (translatedText) {
      console.log(`[Bhashini Service] Translate Success: ${sourceLang} -> ${targetLang}`);
      return translatedText;
    } else {
      throw new Error("Empty output target in Bhashini response payload");
    }
  } catch (err) {
    console.error("[Bhashini Service Error] Translation API call failed:", err.message);
    console.log("[Bhashini Service Fallback] Defaulting to translation simulator...");
    return await simulateTranslation(text, sourceLangName, targetLangName);
  }
};

// Simulated translation using Gemini
const simulateTranslation = async (text, sourceLangName, targetLangName) => {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    if (!process.env.GEMINI_API_KEY) {
      console.warn("[Bhashini Simulator] GEMINI_API_KEY missing. Returning raw source text.");
      return text;
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-1.5-flash as the fallback translation agent
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are the Bhashini Translation service simulator. 
Translate the following text accurately from ${sourceLangName} to ${targetLangName}. 
Do NOT include any introduction, explanations, notes, or conversational text. 
Output ONLY the final translated text.

Text to translate:
${text}`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    return responseText || text;
  } catch (error) {
    console.error("[Bhashini Simulator Error] Gemini translation failed:", error.message);
    return text;
  }
};

module.exports = {
  translateText,
  getLanguageCode
};
