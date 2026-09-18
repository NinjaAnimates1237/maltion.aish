const header = document.querySelector("header");
const overlay = document.querySelector(".overlay");
const cursor = { x: 0, y: 0 };
let targetedId = null;

header.innerHTML = `<div class="iheader">
                        <div class="logo"><img src="res/aish.svg"><h2 class="aish-word">Aish</h2></div>
                        <a class="account-side" href="https://www.maltion.com/settings" id="header-account-button">
                            <img src="res/DefaultIcon.png" class="pfp" onerror="this.src='res/DefaultIcon.png'">
                            <div class="text-side">
                                <h4 class="displayname-label">User</h4>
                                <h5 class="username-label">@username</h5>
                            </div>
                        </a>    
                        <a class="meui-button1" href="https://accounts.maltion.com/login?next=aish" id="header-login-button">Sign in</a>
                    </div>`;

const headerLoginButton = document.getElementById("header-login-button");
const headerAccountButton = document.getElementById("header-account-button");

function doTheIconThing() {
    const faviconUrl = "res/aish-favicon.ico";

    const link = document.createElement("link");

    link.rel = "icon";
    link.href = faviconUrl;

    document.head.appendChild(link);
}

function escapeHTML(text) {
    return text.toString().replace(/[&<>'"]/g, function (char) {
        switch (char) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case "'": return '&#39;';
            case '"': return '&quot;';
            default: return char;
        }
    });
}

function showContextMenu(e, contextMenu, id) {
    e.stopPropagation();
    targetedId = id;
    contextMenu.style.left = `${cursor.x}px`;
    contextMenu.style.top = `${cursor.y}px`;
    contextMenu.style.display = "flex";
}

function removeContextMenu() {
    const contextMenus = document.querySelectorAll(".context-menu");

    contextMenus.forEach(contextMenu => {
        contextMenu.style.display = "none";
    });
}

function closeForms() {
    overlay.style.display = "none";
    document.querySelectorAll(".generic-form").forEach(gform => {
        gform.style.display = "none";
    })
}

function openForm(id) {
    const formEl = document.getElementById(id);
    formEl.style.display = "flex";
    overlay.style.display = "flex";
}

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX;
    cursor.y = event.clientY;
});

document.addEventListener('click', (e) => {
    const contextMenu = document.querySelector(".context-menu");
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = 'none';
    }
});

doTheIconThing();