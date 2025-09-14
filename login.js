const cancelbtn = document.getElementsByClassName("cancel-btn")[0];
cancelbtn.addEventListener("click", async () => {
    await chrome.action.setPopup({ popup: "popup.html"});
    window.location.assign("popup.html");
});
