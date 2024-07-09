# design-challenges-bot

In it's current state, this bot serves as the leaderboard for design challenges on dds.

## Project Structure

To make this project easy to maintain, I've followed the structure used on the discord.js guide. The database used for this project is firestore. 

## .env

| Value                     | Description                                            |
| :------------------------ | :------------------------------------------------------|
| `TOKEN`                   | Token for the bot.                                     |
| `CLIENT`                  | Client id of the bot.                                  |
| `GUILD`                   | Guild id of server the bot is in.                      |
| `ADMIN`                   | Role id of admin role (or equivalent).                 |
| `FIREBASE_ADMIN`          | Key for firebase admin.                                |

## config.json

Seperate from .env to keep it consistent across development and production environments. Just holds the list of leaderboards, which includes the name and the id on the database.

## Database

Database usage in this project is minimal, no initial setup required other than creating the database and configuring the .env and config.json. 

leaderboards > {leaderboard id} > points > {discord user id} 

Inside each document is just a single field with the number of points.

Ranking is not stored, instead it is found using pagination (for the leaderboard command) and querying the number of members with more points (for the rank command).

