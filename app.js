const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(300, () => {
      console.log("Server is Running at http://localhost:300/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//1.Get Players list API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = "SELECT * FROM cricket_team;";
  const playersArray = await db.all(getPlayersQuery);
  const ans = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(playersArray.map((eachPlayer) => ans(eachPlayer)));
});

//Add player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO cricket_team(player_name,jersey_number,role)
        VALUES(
            '${playerName}',
            ${jerseyNumber},
            '${role}'
        );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Get player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team 
        WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  const object = {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  };
  response.send(object);
});

//update player API
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
            UPDATE cricket_team 
            SET 
            player_name='${playerName}',
            jersey_number=${jerseyNumber},
            role='${role}' 
            WHERE player_id=${playerId};`;
  const updateResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  const deletedPlayer = await db.get(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
