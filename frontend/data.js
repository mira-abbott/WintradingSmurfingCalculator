const user1 = localStorage.getItem("user1");
const user2 = localStorage.getItem("user2");

document.getElementById("sum1").innerText = user1;
document.getElementById("sum2").innerText = user2;

async function getApiKey() {
  const request = await fetch(`http://localhost:8080/https://www.op.gg/summoners/na/${user1}`);
  const html = await request.text();
  const apiKeyRegex = /"buildId":"(.+?)"/;
  const match = html.match(apiKeyRegex);
  return match[1];
}

async function getUser(username) {
  const apiKey = await getApiKey();
  const response = await fetch(
    `http://localhost:8080/https://na.op.gg/_next/data/${apiKey}/summoners/na/${username}.json?region=na&summoner=${username}`,
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  );

  const data = await response.json();

  return data;
}

function sum(a, b) {
  return a + b;
}

function getAverage(numberArray) {
  let total = numberArray.reduce(sum)
  const average = total / numberArray.length
  return average.toFixed(1);
}

function setAverageKda(userKdaId, averageKda) {
  const userKdaElement = document.getElementById(userKdaId);
  userKdaElement.innerText = averageKda;
}

function getAverageKda(userData) {
  const games = userData.pageProps.games.data;
  const killsPerGame = [];
  const deathsPerGame = [];
  const assistsPerGame = [];

  for (let i = 0; i < games.length; i++) {
    const {kill, death, assist} = games[i].myData.stats;
    killsPerGame.push(kill);
    deathsPerGame.push(death);
    assistsPerGame.push(assist);
  }

  const averageKills = getAverage(killsPerGame);
  const averageDeaths = getAverage(deathsPerGame);
  const averageAssists = getAverage(assistsPerGame);
  return `${averageKills}/${averageDeaths}/${averageAssists}`;
}

function getAveragePercentage(totalWins, userData) {
  let games = userData.pageProps.games.data;
  let amountOfGames = games.length;
  const percentage = totalWins / amountOfGames;
  return percentage.toFixed(1);
}

function getWinrate(userData) {
  const games = userData.pageProps.games.data;
  let totalWins = 0;

  for (let i = 0; i < games.length; i++) {
    const result = games[i].myData.stats.result;

    if (result === "WIN") {
      totalWins += 1;
    }
  }

  return getAveragePercentage(totalWins, userData);
}

function getWinratePoints(userData) {
  const winrate = getWinrate(userData);

  let totalPoints = 0;

  if (winrate >= .7) {
    totalPoints +=6;
  }

  return totalPoints;
}

function getKdaPoints(userData) {
  let totalPoints = 0;
  const kda = getAverageKda(userData);
  const kdaStringArray = kda.split('/');
  const kdaNumberArray = kdaStringArray.map(Number)
  const [kills, deaths, assists] = kdaNumberArray;

  if (kills > 10 && 4 > deaths && assists > 10) {
    totalPoints += 5;
  }

  return totalPoints;
}

function getCsPoints(userData){
  let totalPoints = 0;
  let totalCs = 0;
  const games = userData.pageProps.games.data;

  for (let i = 0; i < games.length; i++) {
    const cs = games[i].myData.stats.minion_kill;
    totalCs += cs;
  }

  const averageCs = totalCs / games.length;

  if (averageCs >= 180) {
    totalPoints += 3;
  }

  return totalPoints;
}

function getVisionScorePoints(userData){
  let totalPoints = 0;
  let totalVisionScore = 0;
  const games = userData.pageProps.games.data;

  for (let i = 0; i < games.length; i++) {
    const visionScore = games[i].myData.stats.vision_score;
    totalVisionScore += visionScore;
  }

  const averageVisionScore = totalVisionScore/games.length;

  if (averageVisionScore >= 30) {
    totalPoints += 4;
  }

  return totalPoints;
}

function getSmurfPoints(userData) {
  const winratePoints = getWinratePoints(userData);
  const perfectKdaPoints = getKdaPoints(userData);
  const csPoints = getCsPoints(userData);
  const visionPoints = getVisionScorePoints(userData);
  const totalOverallPoints = winratePoints + perfectKdaPoints + csPoints + visionPoints;
  return totalOverallPoints
}

function getSmurfStatusFromPoints(smurfPoints) {
  if (smurfPoints <= 4) {
    return "Very unlikely"
  } else if (smurfPoints <= 9) {
    return "Unlikely"
  } else if (smurfPoints <= 13) {
    return "Possible"
  } else if (smurfPoints <= 17) {
    return "Likely"
  } else if (smurfPoints > 17) {
    return "Very likely"
  }
}

function getSmurfStatus(userData) {
  const smurfPoints = getSmurfPoints(userData);
  return getSmurfStatusFromPoints(smurfPoints);
}

function setSmurfStatus(smurfStatus, identifier) {
  const smurfStatusElement = document.getElementById(`smurf-status-${identifier}`);
  smurfStatusElement.innerText = smurfStatus;
}

// WINTRADING

let userData1;
let userData2;
let smurfStatus1;
let smurfStatus2;

function normalizeUsername(username) {
  return username
  .toLowerCase()
  .replace(" ", "")
}

// Checks if two users have games together
// Returns the amount of games that two users share
function checkGamesTogetherForUser(userData) {
  const games = userData.pageProps.games.data;
  const username1 = normalizeUsername(user1);
  const username2 = normalizeUsername(user2);
  let totalGamesTogether = 0;

  for (let i = 0; i < games.length; i++) {
    const usernames = games[i].participants
    let usersInGame = [];
    for (let i = 0; i < usernames.length; i++) {
      usersInGame.push(usernames[i].summoner.internal_name)
    }
    if (usersInGame.includes(username1) && usersInGame.includes(username2)) {
      totalGamesTogether += 1;
    }
  }

  return totalGamesTogether;
}

function getWintradingStatus(totalGamesTogether1, totalGamesTogether2) {
  if (totalGamesTogether1 <= 1 || totalGamesTogether2 <= 1) {
    return "Very unlikely"
  } else if (totalGamesTogether1 <= 2 || totalGamesTogether2 <= 2) {
    return "Unlikely"
  } else if (totalGamesTogether1 <= 3 || totalGamesTogether2 <= 3) {
    return "Possible"
  } else if (totalGamesTogether1 <= 4 || totalGamesTogether2 <= 4) {
    return "Likely"
  } else {
    return "Very likely"
  }
}

function setWintradingStatus(wintradingStatus) {
  const wintradingStatusElement = document.getElementById('wintrading-status');
  wintradingStatusElement.innerText = wintradingStatus;
}

const isUnlikely = [
  smurfStatus1 === "Very unlikely",
  smurfStatus1 === "Unlikely",
  smurfStatus2 === "Very unlikely",
  smurfStatus2 === "Unlikely"
].some(Boolean)

function determineWintrading() {
  if (isUnlikely) {
    setWintradingStatus("Unlikely");
  }

  const totalGamesTogether1 = checkGamesTogetherForUser(userData1);
  const totalGamesTogether2 = checkGamesTogetherForUser(userData2);
  const wintradingStatus = getWintradingStatus(totalGamesTogether1, totalGamesTogether2);
  setWintradingStatus(wintradingStatus);
}

function fillDataPage(userIdentifier, userData) {
  const averageKDA = getAverageKda(userData);
  const smurfStatus = getSmurfStatus(userData)

  if (userIdentifier === "1") {
    userData1 = userData;
    smurfStatus1 = smurfStatus;
  } else {
    userData2 = userData;
    smurfStatus2 = smurfStatus;
  }

  setAverageKda(`kda${userIdentifier}`, averageKDA);
  setSmurfStatus(smurfStatus, userIdentifier);
}



// when the data both users have arrived and completed, we want to calculate the wintrade

Promise.all([
  getUser(user1).then((data) => fillDataPage("1", data)),
  getUser(user2).then((data) => fillDataPage("2", data))
]).then(() => determineWintrading())
