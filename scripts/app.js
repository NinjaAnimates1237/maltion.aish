const userMsgForm = document.getElementById("user-msg-form");
const userMsgTextBox = document.getElementById("user-msg-box");
const userMsgSubmitBtn = document.getElementById("user-msg-submit-btn");
const greetingHeader = document.getElementById("greeting-header");
const conversationHistoryText = document.getElementById("conversation-history-text");
const messagesLeftCounter = document.getElementById("messages-left-counter");
const messagesLeftProgress = document.getElementById("messages-left-progress");
const urlParams = new URLSearchParams(window.location.search);
let currentConversationId = urlParams.get("cid") || null;
let messagesLeft = 0;

async function getConversations() {
    const response = await fetch(`${APIURL}/aish/get-conversations`, { credentials: "include" });
    if (response.ok) {
        const responseData = await response.json();
        if (responseData.conv.length > 0) {
            responseData.conv.forEach(conv => {
                appendToConversationList(conv.name, conv.id);
            });
            conversationHistoryText.style.display = "none";
        } else {
            conversationHistoryText.textContent = "No previous conversations.";
        }
    } else {
        conversationHistoryText.textContent = "An error has occurred. Try refreshing the page."
    }
}

async function loadConversation() {
    const thing = document.querySelector(".msg-box-new-conversation");
    if (thing) thing.classList.remove("msg-box-new-conversation");
    const response = await fetch(`${APIURL}/aish/get-conversation?cid=${currentConversationId}`, { credentials: "include" });
    if (response.ok) {
        const responseData = await response.json();
        responseData.forEach(msg => {
            if (msg.author_id == 0) {
                addAishMsg(msg.content, true);
            } else {
                addUserMsg(msg.content, true);
            }
        });
        conversationHistoryText.style.display = "none";
    } else {
        alert("An error has occurred while loading this conversation. Try refreshing the page.");
    }
}

async function sendMessage(message, AishMsg, cid = null) {
    const response = await fetch(`${APIURL}/aish/generate-message`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: message,
            cid: cid,
        }),
    });

    if (!response.ok) {
        const responseData = await response.json();
        const status = response.status;
        switch (status) {
            case 429:
                {
                    openForm("message-limit-form");
                    break;
                }
            case 403:
                {
                    openForm("banned-form");
                    break;
                }
            default:
                {
                    alert(`Error: ${responseData.detail}`);
                    break;
                }
        }
        return;
    }

    if (!response.body) {
        alert("Unknown error.");
    }

    messagesLeft--;
    messagesLeftCounter.textContent = messagesLeft;
    messagesLeftProgress.value = messagesLeft;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let conversationId = cid;

    while (true) {
        const { value, done } = await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
            if (!event.trim()) {
                continue;
            }

            if (event.startsWith("event: error")) {
                const dataLine = event
                    .split("\n")
                    .find(line => line.startsWith("data: "));

                if (dataLine) {
                    const data = dataLine.slice(6);
                    const parsed = JSON.parse(data);

                    throw new Error(parsed.error || "Streaming error");
                }

                continue;
            }

            if (!event.startsWith("data: ")) {
                continue;
            }

            const data = event.slice(6);

            if (data === "[DONE]") {
                console.log("Finished");
                appendToAishMessage(AishMsg, "", true);
                continue;
            }

            const parsed = JSON.parse(data);

            if (parsed.cid !== undefined) {
                conversationId = parsed.cid;
                currentConversationId = parsed.cid;

                console.log("Conversation ID:", conversationId);

                continue;
            }

            if (parsed.text !== undefined) {
                appendToAishMessage(
                    AishMsg,
                    parsed.text,
                    true
                );
            }
        }
    }

    return conversationId;
}

async function renameSelectedConversation() {
    let new_name = prompt("Enter new name for the conversation");
    const body = { cid: currentConversationId, new_name: new_name };
    if (new_name) {
        const response = await fetch(`${APIURL}/aish/rename-conversation?cid=${targetedId}&new_name=${encodeURIComponent(new_name)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(body)
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const responseData = await response.json();
            alert(`Error: ${responseData.detail || "Unknown"}`);
        }
    }
}

async function deleteSelectedConversation() {
    if (confirm(`Are you sure you want to delete that conversation?`)) {
        const response = await fetch(`${APIURL}/aish/delete-conversation?cid=${targetedId}`, { method: "POST", credentials: "include" });
        if (response.ok) {
            if (currentConversationId == targetedId) window.location.href = "https://aish.maltion.com/app";
            else window.location.reload();
        } else {
            const responseData = await response.json();
            alert(`Error: ${responseData.detail || "Unknown"}`);
        }
    }
}

async function checkMessagesLeft() {
    const response = await fetch(`${APIURL}/aish`, { credentials: "include" });
    if (response.ok) {
        const responseData = await response.json();
        messagesLeft = responseData.messages_left;
        messagesLeftCounter.textContent = messagesLeft;
        messagesLeftProgress.value = messagesLeft;
    } else {
        const responseData = await response.json();
        alert(`Error: ${response.detail || "Unknown"}`);
    }
}

async function retryAnswer() {
    if (messagesLeft > 0) {
        const response1 = await fetch(`${APIURL}/aish/delete-last-2-messages?cid=${currentConversationId}`, {
            method: "POST",
            credentials: "include"
        });
        if (response1.ok) {
            if (lastAishMessageEl) lastAishMessageEl.remove();
            const AishMsg = addAishMsg();
            sendMessage(lastUserMessage, AishMsg, currentConversationId);
        } else {
            const error_data = await response1.json();
            alert(`Error: ${error_data || "Unknown error"}`);
        }
    } else {
        openForm("message-limit-form");
    }
}

userMsgForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const thing = document.querySelector(".msg-box-new-conversation");
    if (thing) thing.classList.remove("msg-box-new-conversation");
    userMsgForm.disabled = true;
    userMsgSubmitBtn.disabled = true;
    const messageText = userMsgTextBox.value;
    userMsgTextBox.value = "";
    if (messageText.trim() == "") {
        userMsgTextBox.placeholder = "You can't just ask nothing! Start typing.";
    }

    addUserMsg(messageText);
    const AishMsg = addAishMsg();
    sendMessage(messageText, AishMsg, currentConversationId);
    userMsgForm.disabled = false;
    userMsgSubmitBtn.disabled = false;
});

document.addEventListener("DOMContentLoaded", async () => {
    await initializeSession(true);
    if (isVip() || getUsername() == "NytrixNinja") {
        if (currentConversationId) loadConversation(currentConversationId);
        getConversations();
        checkMessagesLeft();
    } else {
        openForm("vip-required-form");
    }
});