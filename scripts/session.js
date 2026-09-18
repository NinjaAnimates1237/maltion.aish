const APIURL = "https://api.maltion.com";

const session = {
    loggedIn: false,
    displayName: "Guest",
    username: "Guest",
    vip: false
};

function getUsername() {
    return session.username;
}

function getName(){
    return session.displayName;
}

function isVip() {
    return session.vip;
}

async function initializeSession(forceLogin = false) {
    const response = await fetch(`${APIURL}/get-user-info`, {credentials: "include"});
    if (response.ok) {
        const responseData = await response.json();
        session.username = responseData.userinfo.username;
        session.displayName = responseData.userinfo.displayName;
        session.vip = responseData.userinfo.premium;
        loggedIn = true;

        document.querySelectorAll(".username-label").forEach(el => {
            el.textContent = session.username;
        });
        document.querySelectorAll(".displayname-label").forEach(el => {
            el.textContent = session.displayName;
        });
        document.querySelectorAll(".pfp").forEach(el => {
            el.src = `https://uploads.maltion.com/pfp/${session.username.toLowerCase()}.jpg`;
        });

        headerAccountButton.style.display = "flex";
        headerLoginButton.style.display = "none";
        return true
    } else {
        loggedIn = false;
        if (forceLogin) window.location.href = "https://accounts.maltion.com/login?next=aish";
        headerAccountButton.style.display = "none";
        headerLoginButton.style.display = "block";
        return false;
    }
}