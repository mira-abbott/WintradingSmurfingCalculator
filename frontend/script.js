const submit = document.getElementById("submit-button");
const username1 = document.getElementById("username1");
const username2 = document.getElementById("username2");

submit.addEventListener("click", displaySummonerData);

function displaySummonerData() {
  if (username1.value && username2.value) {
    localStorage.setItem("user1", username1.value);
    localStorage.setItem("user2", username2.value);
    location.href = "./datapage.html";
  } else {
    return;
  }
}
