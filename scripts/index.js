document.addEventListener("DOMContentLoaded", async () => {
    if (await initializeSession()) window.location.href = "https://aish.maltion.com/app";
});