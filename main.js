import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBUkLeLsQtfEcCGqWxeG1y7e4TVcq9olSc";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function generateResponse(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return await response.text();
    } catch (error) {
        console.error("Erreur lors de la génération :", error);
        return "Désolé, une erreur s'est produite. Veuillez réessayer.";
    }
}

function addMessageToChat(content, className, isBot = false) {
    const chatBox = document.getElementById("chat-box");
    const message = document.createElement("div");
    message.classList.add(className);

    if (isBot) {
        message.innerHTML = `
            <div class="message-container">
                ${content}
            </div>
        `;
    } else {
        message.innerHTML = `<div class="message-container">${content}</div>`;
    }

    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.forEach(msg => {
        addMessageToChat(msg.content, msg.className, msg.isBot);
    });
}

function saveMessageToChatHistory(content, className, isBot = false) {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push({ content, className, isBot });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

async function handleUserInput() {
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-btn");
    const prompt = userInput.value.trim();

    if (!prompt) {
        alert("Veuillez saisir une question.");
        return;
    }

    addMessageToChat(prompt, "user-message");
    saveMessageToChatHistory(prompt, "user-message");

    sendButton.disabled = true;
    userInput.value = "";

    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("bot-message");
    typingIndicator.innerHTML = `<div class="message-container">...</div>`;
    document.getElementById("chat-box").appendChild(typingIndicator);

    const responseText = await generateResponse(prompt);

    document.getElementById("chat-box").removeChild(typingIndicator);

    addMessageToChat(marked.parse(responseText), "bot-message", true);
    saveMessageToChatHistory(responseText, "bot-message", true);

    sendButton.disabled = false;
}

document.getElementById("send-btn").addEventListener("click", handleUserInput);

document.getElementById("user-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        handleUserInput();
    }
});

// Charger l'historique du chat lorsque la page est chargée
loadChatHistory();