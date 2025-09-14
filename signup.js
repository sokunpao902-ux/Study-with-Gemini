
const cancelbtn = document.getElementsByClassName("cancel-btn")[0];
console.log(cancelbtn);
cancelbtn.addEventListener("click", async () => {
    await chrome.action.setPopup({ popup: "popup.html"});
    window.location.assign("popup.html");
});

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.email.value;
  const password = form.psw.value;
  const confirmPassword = form["psw-confirm"].value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    // await createUser(email, password);
    alert("Signup successful");

    // Redirect to popup.html inside your extension
    const popupUrl = chrome.runtime.getURL("popup.html");
    window.location.href = popupUrl;

  } catch (error) {
    console.error(error);
    alert("Signup failed: " + error.message);
  }
});