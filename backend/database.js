const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Datenbank öffnen
async function connectDB(){

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database
    });

    // User Tabelle erstellen
    await db.exec(`
        
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT NOT NULL,

            email TEXT UNIQUE NOT NULL,

            password TEXT NOT NULL

        )

    `);

    console.log("SQLite Datenbank verbunden");

    return db;

}

module.exports = connectDB;