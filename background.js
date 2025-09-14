const API_KEY = API_KEY1;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generateContent") {
        handleGenerationRequest(request.prompt)
            .then(sendResponse)
            .catch(error => {
                console.error("Gemini API Error:", error);
                sendResponse({ error: "Failed to get response from Gemini API. " + error.message });
            });
        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});

/**
 * Makes a request to the Gemini API.
 * @param {string} prompt The complete prompt to send to the model.
 * @returns {Promise<object>} The response from the API.
 */
async function handleGenerationRequest(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        return { text };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error; 
    }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true });
});
