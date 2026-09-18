const messageHistory = document.querySelector(".msg-container");
const conversationHistoryList = document.getElementById("conversation-history-list");
let lastUserMessage = "";
let lastAishMessageEl = null;

function addUserMsg(content) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "user-message";
    msgDiv.innerHTML = `
        <div class="content">${escapeHTML(content)}</div>
    `;
    messageHistory.appendChild(msgDiv);
    lastUserMessage = content;

    messageHistory.scrollTop = messageHistory.scrollHeight;
}

function addAishMsg(content = "", finish = false) {
    const messageEl = document.createElement("div");
    messageEl.className = "aish-message";
    messageEl.innerHTML = `
        <div class="content">${marked.parse(escapeHTML(content))}</div>
        <div class="unformatted-content">${escapeHTML(content)}</div>
        <div class="options" style="display: none;">
            <button title="Copy answer" class="copy-answer-button"><img src="https://easy.maltion.com/icons/Copy-Black.png"></button>
            <button title="Retry answering" class="retry-answering-button"><img src="https://easy.maltion.com/icons/Reload-Black.png"></button>
        </div>
    `;

    const msgOptions = messageEl.querySelector(".options");
    msgOptions.querySelector(".copy-answer-button").addEventListener("click", () => {
        navigator.clipboard.writeText(messageEl.textContent.trim());
        alert("Copied!");
    });

    msgOptions.querySelector(".retry-answering-button").addEventListener("click", () => {
        retryAnswer();
    });

    if (finish) {
        messageEl.style.setProperty("--bg-img", 'url("../res/aish.svg")');
        messageEl.querySelector(".options").style.display = "flex";
    }

    messageHistory.appendChild(messageEl);
    lastAishMessageEl = messageEl;

    messageHistory.scrollTop = messageHistory.scrollHeight;

    return messageEl;
}

function appendToAishMessage(element, content, finish = false) {
    const unformattedEl = element.querySelector(".unformatted-content");
    const newContent = `${unformattedEl.innerHTML}${escapeHTML(content)}`;
    unformattedEl.innerHTML = newContent;
    element.querySelector(".content").innerHTML = marked.parse(escapeHTML(newContent));
    if (finish) {
        element.style.setProperty("--bg-img", 'url("../res/aish.svg")');
        element.querySelector(".options").style.display = "flex";
    }
}

function appendToConversationList(cName, id) {
    const conversationEl = document.createElement("li");
    if (id == currentConversationId) conversationEl.classList.add("open");
    conversationEl.innerHTML = `
        <a href="https://aish.maltion.com/app?cid=${id}" title="${escapeHTML(cName)}">${escapeHTML(cName)}</a>
        <button onclick="showContextMenu(event, document.getElementById('conversation-options-cmenu'), ${id})">
        <img src="res/options.png"></button>
    `;
    conversationHistoryList.appendChild(conversationEl);
}