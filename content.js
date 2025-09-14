let selectedText = '';
let contextText = '';
let firstCompareText = '';
let x = 100;
let y = 100;

let isWaitingForCompare = false;
let isWaitingForContext = false;

// --- UI Element Creation ---

function createMenu() {
    removeExistingUI('menu');
    removeExistingUI('result');

    const menu = document.createElement('div');
    menu.id = 'menu';
    menu.style.cssText = `
        position: absolute !important;
        left: ${x}px !important;
        top: ${y}px !important;
        z-index: 9999 !important;
        background: linear-gradient(to top right,rgb(157, 32, 247),rgb(36, 132, 177)) !important;
        border: 1px solid #ccc !important;
        border-radius: 8px !important;
        padding: 12px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        font-size: 14px !important;
        display: flex !important;
        gap: 6px !important;
    `;

    const options = [
        { text: "Explain", action: "Explain" },
        { text: "Give", action: "Give" },
        { text: "Examples", action: "Examples" },
        { text: "Summarize", action: "Summarize" },
        { text: "Compare", action: "Compare" },
        { text: "Add Context", action: "Context" }
    ];

    options.forEach(opt => {
        const button = document.createElement('button');
        button.textContent = opt.text;
        button.dataset.action = opt.action;
        button.style.cssText = `
            background-color: #31373dff !important;
            border: 1px solid #b3aeaeff !important;
            color: #dad6d6ff !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            text-align: center !important;
        `;

        button.onmouseover = () => button.style.backgroundColor = '#5e6e7eff !important';
        button.onmouseout = () => button.style.backgroundColor = '#31373dff !important';
        menu.appendChild(button);
    });

    document.body.appendChild(menu);
}

function createResultPanel() {
    removeExistingUI('result');
    removeExistingUI('menu');

    const panel = document.createElement('div');
    panel.id = 'result';
    panel.style.cssText = `
        position: absolute !important;
        left: ${x}px !important;
        top: ${y}px !important;
        width: 90% !important;
        max-width: 600px !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        background: linear-gradient(to top right,rgb(157, 32, 247),rgb(36, 132, 177)) !important;
        border: 1px solid #ddd !important;
        border-radius: 12px !important;
        color: white !important;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2) !important;
        z-index: 10000 !important;
        padding: 20px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '✖';
    closeButton.style.cssText = `
        position: absolute !important;
        top: 10px !important;
        right: 10px !important;
        background: none !important;
        border: none !important;
        font-size: 20px !important;
        cursor: pointer !important;
        color: #ded9d9ff !important;
    `;
    closeButton.onclick = () => removeExistingUI('result');
    panel.appendChild(closeButton);

    const contentDiv = document.createElement('div');
    contentDiv.id = 'result-content';
    contentDiv.innerHTML = '<p style="color:white; text-align:center !important;">Generating response...</p>';
    panel.appendChild(contentDiv);
    
    document.body.appendChild(panel);

    return contentDiv;
}


function showStatusMessage(message, duration = 3000) {
    removeExistingUI('study-status');
    const statusDiv = document.createElement('div');
    statusDiv.id = 'study-status';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
        position: absolute !important;
        left: ${x}px !important;
        top: ${y}px !important;
        background: linear-gradient(to top right,rgb(157, 32, 247),rgb(36, 132, 177)) !important;
        color: white !important;
        padding: 20px !important;
        border: 1px solid #ccc !important;
        border-radius: 8px !important;
        z-index: 10001 !important;
        font-size: 14px !important;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important;
        text-align: center !important;
    `;
    document.body.appendChild(statusDiv);
    setTimeout(() => removeExistingUI('study-status'), duration);
}


function removeExistingUI(id) {
    const existing = document.getElementById(id);
    if (existing) {
        existing.remove();
    }
}


// --- Event Handlers ---

document.addEventListener('keyup', async(e) => {
    const { enabled } = await chrome.storage.local.get("enabled");
    if (!enabled) return;

    if (e.key === 'Shift') {
        const currentSelection = window.getSelection();
        const text = currentSelection.toString().trim();

        if (text) {
            selectedText = text;
            const range = currentSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            x = rect.left + window.scrollX + 15;
            y = rect.bottom + window.scrollY + 10;
            createMenu();
            return;
        }

    }
});

document.addEventListener('mousedown', (e) => {
    // Hide UI elements if clicking outside
    const menu = document.getElementById('menu');

    if (menu && !menu.contains(e.target)) {
        removeExistingUI('menu');
    }
});

document.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action) {
        handleMenuClick(action);
        removeExistingUI('menu');
    }
});

document.addEventListener('mouseup', () => {
    if (isWaitingForCompare || isWaitingForContext) {
        const text = window.getSelection().toString().trim();
        if (!text) return;
        
        if (isWaitingForCompare) {
            isWaitingForCompare = false;
            callGeminiAPI('Compare', { text1: firstCompareText, text2: text });
        }
    }
});

// --- Logic ---

function handleMenuClick(action) {
    if (action === 'Context') {
        isWaitingForContext = true;
        isWaitingForCompare = false; 
        contextText = selectedText;
        showStatusMessage('Context saved! Now select the text you want to study.');
        return;
    }
    
    if (action === 'Compare') {
        isWaitingForCompare = true;
        isWaitingForContext = false; 
        firstCompareText = selectedText;
        showStatusMessage('Please select the second piece of text to compare.');
        return;
    }
    
    callGeminiAPI(action, { text: selectedText });
}

function buildPrompt(action, data) {
    let prompt = '';
    if (contextText) {
        prompt += `Here is the context of the following question: "${contextText}"\n\n---\n\n`;
    }
    contextText = "";

    switch (action) {
        case 'Explain':
            prompt += `TASK: Explain the following text in a easy-to-understand way.\n\nTEXT: "${data.text}"`;
            break;
        case 'Examples':
            prompt += `TASK: Provide 2-3 clear and simple examples of the concept in the following text.\n\nTEXT: "${data.text}"`;
            break;
        case 'Summarize':
            prompt += `TASK: Summarize the key points of the following text.\n\nTEXT: "${data.text}"`;
            break;
        case 'Compare':
            prompt += `TASK: Compare and contrast the following two texts. Explain their similarities and differences.\n\nTEXT 1: "${data.text1}"\nTEXT 2: "${data.text2}"`;
            break;
        case "Give":
            prompt += `Task: Give ${data.text}`;
    }
    return prompt;
}

function callGeminiAPI(action, data) {
    const prompt = buildPrompt(action, data);
    const resultContainer = createResultPanel();

    chrome.runtime.sendMessage({ action: 'generateContent', prompt }, (response) => {
        if (response.error) {
            resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${response.error}</p>`;
        } else {
            let html = response.text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Italics
                .replace(/(\r\n|\n|\r)/g, '<br>');      // Newlines
            resultContainer.innerHTML = `
                <div style="margin-top:0 font-size: 24px; font-weight:500;">${action}:</div>
                <hr>
                ${html}
            `;
        }
    });
}
