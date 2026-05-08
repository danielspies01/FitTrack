// Express, CORS und bcrypt laden
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const connectDB = require("./database");

// Server erstellen
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Port
const PORT = 3000;
let db;

// Startseite
app.get("/", (req, res) => {
    res.send("FitTrack Backend läuft");
});

// Produkte API
app.get("/products", (req, res) => {

    const products = [

        {
            id: 1,
            name: "Whey Protein Elite",
            cat: "nutrition",
            price: 34.99,
            rating: "★★★★★",
            icon: "🥤",
            desc: "24g Protein pro Portion, cremig und perfekt nach dem Training."
        },

        {
            id: 2,
            name: "Creatine Monohydrate",
            cat: "nutrition",
            price: 19.99,
            rating: "★★★★★",
            icon: "⚡",
            desc: "Kraft, Leistung und saubere Progression im Training."
        },

        {
            id: 3,
            name: "Resistance Bands Pro",
            cat: "equipment",
            price: 24.99,
            rating: "★★★★☆",
            icon: "🟩",
            desc: "5 Widerstände für Home-Workouts, Mobility und Warm-ups."
        },

        {
            id: 4,
            name: "Smart Shaker 700ml",
            cat: "accessories",
            price: 14.99,
            rating: "★★★★☆",
            icon: "🥛",
            desc: "Dicht, robust und mit extra Fach für Pulver oder Kapseln."
        }

    ];

    res.json(products);

});

// REGISTER API
app.post("/register", async (req, res) => {

    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Bitte alle Felder ausfüllen."
            });
        }

        const existingUser = await db.get(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existingUser) {
            return res.status(400).json({
                message: "E-Mail existiert bereits."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.run(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        res.status(201).json({
            message: "Registrierung erfolgreich"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Serverfehler bei der Registrierung."
        });
    }

});

// LOGIN API
app.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Bitte E-Mail und Passwort eingeben."
            });
        }

        const user = await db.get(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (!user) {
            return res.status(400).json({
                message: "User wurde nicht gefunden."
            });
        }

        const passwordIsCorrect = await bcrypt.compare(password, user.password);

        if (!passwordIsCorrect) {
            return res.status(400).json({
                message: "Passwort ist falsch."
            });
        }

        res.json({
            message: "Login erfolgreich",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Serverfehler beim Login."
        });
    }

});

// Server starten
connectDB().then(database => {

    db = database;

    app.listen(PORT, () => {
        console.log(`Server läuft auf http://localhost:${PORT}`);
    });

});