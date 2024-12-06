// Importuojame reikalingus modulius
import express from 'express';
import path from 'path';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';

import { registerUser } from './registration/register.js';
import { loginUser } from './login/login.js';
import logoutRouter from './logout/logout.js';
import profileRouter from './profile/profileController.js';
import eventsRouter from './ongoingEvents/ongoingEventController.js';

// Sukuriame Express serverį
const app = express();
const port = 3000;  // Serverio prievadas

app.use(session({
    secret: 'secret-key', // Sesijos slaptažodis
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Konfigūruojame statinių failų (HTML, CSS, JS) aptarnavimą iš /web katalogo
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'web')));
app.use(logoutRouter);
app.use(bodyParser.json());
app.use(profileRouter);
app.use(eventsRouter);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'web'));

// Pagrindinis maršrutas (GET užklausa į /)
app.get('/', (req, res) => {
    // Pateikiame index.html, kuris yra /web kataloge
    res.render('index');
});

app.post('/register', registerUser);
app.post('/login', loginUser);


// Sukuriame MySQL ryšį (čia reikia įrašyti savo duomenų bazės duomenis)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // įrašykite savo slaptažodį
    database: 'renginiu_sistema'  // jūsų duomenų bazės pavadinimas
});

// Patikriname, ar ryšys su MySQL veikia
connection.connect((err) => {
    if (err) {
        console.error('Klaida jungiantis prie MySQL:', err);
        return;
    }
    console.log('Prisijungta prie MySQL!');
});

// Paleidžiame serverį
app.listen(port, () => {
    console.log(`Serveris veikia http://localhost:${port}`);
});