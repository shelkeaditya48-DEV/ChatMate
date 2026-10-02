const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const newChatBtn = document.getElementById("newChatBtn");
const clearChatBtn = document.getElementById("clearChatBtn");

const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


// =========================================
// CURRENT SESSION
// =========================================

let currentSessionId =
    localStorage.getItem("currentChatSession");


// =========================================
// ADD MESSAGE
// =========================================
function addMessage(text, type) {

    const message = document.createElement("div");

    if (type === "user") {

        message.style.cssText = `
            max-width: 700px;
            margin: 0 auto 15px;
            padding: 15px 18px;
            background: #171717;
            color: #f5f5f5;
            border: 1px solid #262626;
            border-radius: 16px 16px 4px 16px;
            line-height: 1.6;
        `;

        message.textContent = text;

    } else {

        message.style.cssText = `
            max-width: 700px;
            margin: 0 auto 15px;
            padding: 15px 18px;
            background: #0d0d0d;
            color: #d4d4d4;
            border: 1px solid #222;
            border-radius: 16px 16px 16px 4px;
            line-height: 1.6;
        `;

        message.innerHTML = marked.parse(text);
    }

    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}


// =========================================
// CREATE SESSION
// =========================================

async function createSession() {

    const response =
        await fetch(
            "http://localhost:8082/api/chat/session",
            {
                method: "POST",
                headers: {
                    "X-User-Id": userId
                }
            }
        );

    if (!response.ok) {
        throw new Error("Session creation failed");
    }

    const session =
        await response.json();

    currentSessionId =
        session.id;

    localStorage.setItem(
        "currentChatSession",
        currentSessionId
    );

    return session;
}

// =========================================
// THINKING INDICATOR
// =========================================

function showThinking() {

    const thinking = document.createElement("div");

    thinking.id = "thinkingMessage";
    thinking.className = "thinking-message";

    thinking.innerHTML = `
        <span>ChatMate is thinking</span>
        <span class="thinking-dots">
            <i></i>
            <i></i>
            <i></i>
        </span>
    `;

    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;
}


function hideThinking() {

    const thinking =
        document.getElementById("thinkingMessage");

    if (thinking) {
        thinking.remove();
    }
}
// =========================================
// SEND MESSAGE
// =========================================

async function sendMessage() {

    const message =
        messageInput.value.trim();

    if (!message) {
        return;
    }


    const welcome =
        document.querySelector(".welcome");

    const suggestions =
        document.querySelector(".suggestions");


    if (welcome) {
        welcome.style.display = "none";
    }

    if (suggestions) {
        suggestions.style.display = "none";
    }


    // First message of new chat
    if (!currentSessionId) {

        try {

            await createSession();

        } catch (error) {

            addMessage(
                "❌ Could not create chat session.",
                "bot"
            );

            console.error(error);

            return;
        }
    }


    addMessage(
        message,
        "user"
    );


    messageInput.value = "";

    messageInput.style.height =
        "auto";


    try {

        const response =
            await fetch(
                "http://localhost:8082/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "text/plain",
                        "X-User-Id": userId,
                        "X-Session-Id":
                            currentSessionId
                    },

                    body: message
                }
            );


        if (!response.ok) {

    hideThinking();

    addMessage(
        "❌ ChatMate could not process your request. Please try again.",
        "bot"
    );

    return;
}


       const reply = await response.text();

hideThinking();

addMessage(reply, "bot");

        // Refresh sidebar
        loadChatSessions();


    } catch (error) {

        addMessage(
            "❌ Backend connection failed.",
            "bot"
        );

        console.error(error);
    }
}


// =========================================
// SEND BUTTON
// =========================================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// =========================================
// ENTER
// =========================================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


// =========================================
// AUTO RESIZE
// =========================================

messageInput.addEventListener(
    "input",
    function() {

        this.style.height = "auto";

        this.style.height =
            this.scrollHeight + "px";
    }
);

// =========================================
// CLEAR CHAT
// =========================================

clearChatBtn.addEventListener(
    "click",
    function() {

        currentSessionId = null;

        localStorage.removeItem(
            "currentChatSession"
        );

        messages.innerHTML = `

            <div class="welcome">

                <div class="welcome-icon">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>

                <h1>Hi, I'm ChatMate 👋</h1>

                <p>
                    Your AI Learning & Coding Companion
                </p>

                <span>
                    Ask me anything about learning,
                    coding, projects or technology.
                </span>

            </div>

            <div class="suggestions">

                <button class="suggestion">
                    <i class="fa-brands fa-java"></i>
                    <div>
                        <strong>Learn Java</strong>
                        <small>Explain Java basics</small>
                    </div>
                </button>

                <button class="suggestion">
                    <i class="fa-solid fa-code"></i>
                    <div>
                        <strong>Explain Code</strong>
                        <small>Help me understand code</small>
                    </div>
                </button>

                <button class="suggestion">
                    <i class="fa-solid fa-laptop-code"></i>
                    <div>
                        <strong>Build a Project</strong>
                        <small>Give me project guidance</small>
                    </div>
                </button>

                <button class="suggestion">
                    <i class="fa-solid fa-graduation-cap"></i>
                    <div>
                        <strong>Study Help</strong>
                        <small>Explain a topic simply</small>
                    </div>
                </button>

            </div>
        `;

        attachSuggestions();

        messageInput.focus();
    }
);
// =========================================
// NEW CHAT
// =========================================

newChatBtn.addEventListener(
    "click",
    function() {

        currentSessionId = null;

        localStorage.removeItem(
            "currentChatSession"
        );


        messages.innerHTML = `

            <div class="welcome">

                <div class="welcome-icon">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>

                <h1>Hi, I'm ChatMate 👋</h1>

                <p>
                    Your AI Learning & Coding Companion
                </p>

                <span>
                    Ask me anything about learning,
                    coding, projects or technology.
                </span>

            </div>

            <div class="suggestions">

                <button class="suggestion">
                    <i class="fa-brands fa-java"></i>

                    <div>
                        <strong>Learn Java</strong>
                        <small>Explain Java basics</small>
                    </div>
                </button>

                <button class="suggestion">
                    <i class="fa-solid fa-code"></i>

                    <div>
                        <strong>Explain Code</strong>
                        <small>Help me understand code</small>
                    </div>
                </button>

                <button class="suggestion">
                    <i class="fa-solid fa-laptop-code"></i>

                    <div>
                        <strong>Build a Project</strong>
                        <small>Give me project guidance</small>
                    </div>
                </button>

                <button class="suggestion">
                    <i class="fa-solid fa-graduation-cap"></i>

                    <div>
                        <strong>Study Help</strong>
                        <small>Explain a topic simply</small>
                    </div>
                </button>

            </div>
        `;


        attachSuggestions();

        messageInput.focus();
    }
);


// =========================================
// LOAD CHAT SESSIONS
// =========================================

async function loadChatSessions() {

    try {

        const response =
            await fetch(
                "http://localhost:8082/api/chat/sessions?userId="
                + userId
            );


        if (!response.ok) {
            throw new Error(
                "Failed to load sessions"
            );
        }


        const sessions =
            await response.json();


        const chatHistory =
            document.getElementById(
                "chatHistory"
            );


        if (!chatHistory) {
            return;
        }


        chatHistory.innerHTML = "";


        if (sessions.length === 0) {

            const empty =
                document.createElement("div");

            empty.className =
                "history-empty";

            empty.textContent =
                "No conversations yet";

            chatHistory.appendChild(empty);

            return;
        }


        sessions.forEach(
            function(session) {

                createHistoryItem(
                    session,
                    chatHistory
                );

            }
        );


    } catch (error) {

        console.error(
            "Session history error:",
            error
        );
    }
}


// =========================================
// CREATE SIDEBAR ITEM
// =========================================

function createHistoryItem(
    session,
    container
) {

    const item =
        document.createElement("div");

    item.className =
        "history-item";


    if (
        String(currentSessionId)
        === String(session.id)
    ) {

        item.classList.add("active");
    }


    const left =
        document.createElement("div");

    left.className =
        "history-left";


    const icon =
        document.createElement("i");

    icon.className =
        session.pinned
            ? "fa-solid fa-thumbtack"
            : "fa-regular fa-message";


    const title =
        document.createElement("span");

    title.textContent =
        session.title;


    left.appendChild(icon);
    left.appendChild(title);


    // =====================================
    // RIGHT ACTIONS
    // =====================================

    const actions =
        document.createElement("div");

    actions.className =
        "history-actions";


    // PIN
    const pinBtn =
        document.createElement("button");

    pinBtn.className =
        "history-pin";

    pinBtn.title =
        session.pinned
            ? "Unpin"
            : "Pin";

    pinBtn.innerHTML =
        `<i class="fa-solid fa-thumbtack"></i>`;


    if (session.pinned) {
        pinBtn.classList.add("pinned");
    }


    pinBtn.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            togglePin(session.id);
        }
    );


    // THREE DOT
    const moreBtn =
        document.createElement("button");

    moreBtn.className =
        "history-more";

    moreBtn.title =
        "More";

    moreBtn.innerHTML =
        `<i class="fa-solid fa-ellipsis"></i>`;


    moreBtn.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            openChatMenu(
                moreBtn,
                session
            );
        }
    );


    actions.appendChild(pinBtn);
    actions.appendChild(moreBtn);


    item.appendChild(left);
    item.appendChild(actions);


    // OPEN CHAT
    item.addEventListener(
        "click",
        function() {

            openSession(
                session.id
            );

        }
    );


    container.appendChild(item);
}


// =========================================
// OPEN SESSION
// =========================================

async function openSession(
    sessionId
) {

    currentSessionId =
        sessionId;

    localStorage.setItem(
        "currentChatSession",
        sessionId
    );


    try {

        const response =
            await fetch(
                "http://localhost:8082/api/chat/session/"
                + sessionId
                + "?userId="
                + userId
            );


        const chats =
            await response.json();


        messages.innerHTML = "";


        chats.forEach(
            function(chat) {

                addMessage(
                    chat.userMessage,
                    "user"
                );

                addMessage(
                    chat.aiResponse,
                    "bot"
                );

            }
        );


        loadChatSessions();


    } catch (error) {

        console.error(
            "Open session error:",
            error
        );
    }
}


// =========================================
// PIN
// =========================================

async function togglePin(
    sessionId
) {

    try {

        await fetch(
            "http://localhost:8082/api/chat/session/"
            + sessionId
            + "/pin?userId="
            + userId,
            {
                method: "PUT"
            }
        );


        // Refresh = pinned chat comes top
        loadChatSessions();


    } catch (error) {

        console.error(
            "Pin error:",
            error
        );
    }
}


// =========================================
// CHAT MENU
// =========================================

function openChatMenu(
    button,
    session
) {

    closeChatMenus();


    const menu =
        document.createElement("div");

    menu.className =
        "chat-context-menu";


    // SHARE
    const share =
        document.createElement("button");

    share.innerHTML =
        `<i class="fa-solid fa-share-nodes"></i>
         <span>Share</span>`;


    share.addEventListener(
        "click",
        function() {

            shareConversation(
                session.id
            );

            menu.remove();
        }
    );


    // RENAME
    const rename =
        document.createElement("button");

    rename.innerHTML =
        `<i class="fa-solid fa-pen"></i>
         <span>Rename</span>`;


    rename.addEventListener(
        "click",
        function() {

            renameChat(
                session
            );

            menu.remove();
        }
    );


    // PIN
    const pin =
        document.createElement("button");

    pin.innerHTML =
        `<i class="fa-solid fa-thumbtack"></i>
         <span>${
             session.pinned
                ? "Unpin"
                : "Pin"
         }</span>`;


    pin.addEventListener(
        "click",
        function() {

            togglePin(
                session.id
            );

            menu.remove();
        }
    );


    // DELETE
    const deleteBtn =
        document.createElement("button");

    deleteBtn.className =
        "delete-menu-item";

    deleteBtn.innerHTML =
        `<i class="fa-solid fa-trash"></i>
         <span>Delete</span>`;


    deleteBtn.addEventListener(
        "click",
        function() {

            deleteChat(
                session.id
            );

            menu.remove();
        }
    );


    menu.appendChild(share);
    menu.appendChild(rename);
    menu.appendChild(pin);
    menu.appendChild(deleteBtn);


    document.body.appendChild(menu);


    const rect =
        button.getBoundingClientRect();


    menu.style.top =
        rect.bottom + 5 + "px";

    menu.style.left =
        rect.right - 170 + "px";


    setTimeout(
        function() {

            document.addEventListener(
                "click",
                closeChatMenus,
                {
                    once: true
                }
            );

        },
        0
    );
}


// =========================================
// CLOSE MENUS
// =========================================

function closeChatMenus() {

    document
        .querySelectorAll(
            ".chat-context-menu"
        )
        .forEach(
            function(menu) {
                menu.remove();
            }
        );
}


// =========================================
// RENAME
// =========================================

async function renameChat(
    session
) {

    const newTitle =
        prompt(
            "Rename conversation:",
            session.title
        );


    if (
        !newTitle ||
        !newTitle.trim()
    ) {
        return;
    }


    try {

        await fetch(
            "http://localhost:8082/api/chat/session/"
            + session.id
            + "/rename?userId="
            + userId,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "text/plain"
                },

                body:
                    newTitle.trim()
            }
        );


        loadChatSessions();


    } catch (error) {

        console.error(
            "Rename error:",
            error
        );
    }
}


// =========================================
// DELETE
// =========================================

async function deleteChat(
    sessionId
) {

    const confirmed =
        confirm(
            "Delete this conversation?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await fetch(
            "http://localhost:8082/api/chat/session/"
            + sessionId
            + "?userId="
            + userId,
            {
                method: "DELETE"
            }
        );


        if (
            String(currentSessionId)
            === String(sessionId)
        ) {

            currentSessionId = null;

            localStorage.removeItem(
                "currentChatSession"
            );


            messages.innerHTML = "";

        }


        loadChatSessions();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );
    }
}


// =========================================
// SHARE
// =========================================

async function shareConversation(
    sessionId
) {

    try {

        const response =
            await fetch(
                "http://localhost:8082/api/chat/session/"
                + sessionId
                + "?userId="
                + userId
            );


        const chats =
            await response.json();


        if (!chats.length) {

            alert(
                "This conversation is empty."
            );

            return;
        }


        let shareText =
            "ChatMate Conversation\n\n";


        chats.forEach(
            function(chat) {

                shareText +=
                    "You: "
                    + chat.userMessage
                    + "\n\n";

                shareText +=
                    "ChatMate: "
                    + chat.aiResponse
                    + "\n\n";

            }
        );


        // Native mobile/browser sharing
        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    "ChatMate Conversation",

                text:
                    shareText

            });

        } else {

            // Desktop fallback
            await navigator.clipboard.writeText(
                shareText
            );

            alert(
                "Conversation copied to clipboard!"
            );
        }


    } catch (error) {

        console.error(
            "Share error:",
            error
        );
    }
}


// =========================================
// SUGGESTIONS
// =========================================

function attachSuggestions() {

    document
        .querySelectorAll(".suggestion")
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const strong =
                            this.querySelector(
                                "strong"
                            );

                        if (strong) {

                            messageInput.value =
                                strong.textContent;

                            messageInput.focus();
                        }
                    }
                );

            }
        );
}


// =========================================
// START
// =========================================

loadChatSessions();

attachSuggestions();

// =========================================
// PROFILE
// =========================================

const profileBtn =
    document.getElementById("profileBtn");

const profileDropdown =
    document.getElementById("profileDropdown");


// =========================================
// GET LOGGED-IN USER DATA
// =========================================

const loggedUserName =
    localStorage.getItem("userName") || "User";

const loggedUserEmail =
    localStorage.getItem("userEmail") || "email@example.com";


// =========================================
// PROFILE ELEMENTS
// =========================================

const profileName =
    document.getElementById("profileName");

const profileAvatar =
    document.getElementById("profileAvatar");

const dropdownName =
    document.getElementById("dropdownName");

const dropdownEmail =
    document.getElementById("dropdownEmail");

const dropdownAvatar =
    document.getElementById("dropdownAvatar");


// =========================================
// CREATE INITIALS
// =========================================

function getInitials(name) {

    return name
        .trim()
        .split(" ")
        .map(function(word) {
            return word.charAt(0);
        })
        .join("")
        .substring(0, 2)
        .toUpperCase();
}


const userInitials =
    getInitials(loggedUserName);


// =========================================
// SHOW USER DATA IN PROFILE
// =========================================

if (profileName) {

    profileName.textContent =
        loggedUserName;
}


if (profileAvatar) {

    profileAvatar.textContent =
        userInitials;
}


if (dropdownName) {

    dropdownName.textContent =
        loggedUserName;
}


if (dropdownEmail) {

    dropdownEmail.textContent =
        loggedUserEmail;
}


if (dropdownAvatar) {

    dropdownAvatar.textContent =
        userInitials;
}


// =========================================
// OPEN / CLOSE PROFILE DROPDOWN
// =========================================

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            if (profileDropdown) {

                profileDropdown.classList.toggle(
                    "show"
                );
            }
        }
    );
}


// =========================================
// CLOSE DROPDOWN WHEN CLICK OUTSIDE
// =========================================

document.addEventListener(
    "click",
    function(event) {

        if (
            profileDropdown &&
            profileBtn &&
            !profileDropdown.contains(event.target) &&
            !profileBtn.contains(event.target)
        ) {

            profileDropdown.classList.remove(
                "show"
            );
        }
    }
);


// =========================================
// PROFILE PAGE
// =========================================

const profileMenuBtn =
    document.getElementById(
        "profileMenuBtn"
    );

if (profileMenuBtn) {

    profileMenuBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "profile.html";
        }
    );
}


// =========================================
// ADD ANOTHER ACCOUNT
// =========================================

const addAccountBtn =
    document.getElementById(
        "addAccountBtn"
    );

if (addAccountBtn) {

    addAccountBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "login.html";
        }
    );
}


// =========================================
// LOGOUT
// =========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "userName"
            );

            localStorage.removeItem(
                "userEmail"
            );

            localStorage.removeItem(
                "currentChatSession"
            );

            window.location.href =
                "login.html";
        }
    );
}