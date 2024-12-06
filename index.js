// Importuojame reikalingus modulius
const express = require('express');
const path = require('path');
const mysql = require('mysql2');

// Sukuriame Express serverį
const app = express();
const port = 3000;  // Serverio prievadas

// Konfigūruojame statinių failų (HTML, CSS, JS) aptarnavimą iš /web katalogo
app.use(express.static(path.join(__dirname, 'web')));

// Pagrindinis maršrutas (GET užklausa į /)
app.get('/', (req, res) => {
    // Pateikiame index.html, kuris yra /web kataloge
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

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