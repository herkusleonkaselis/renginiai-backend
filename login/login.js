// login.js

import bcrypt from 'bcrypt';
import mysql from 'mysql2';

// Sukuriame MySQL ryšį
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Įrašykite savo slaptažodį
    database: 'renginiu_sistema'  // Jūsų duomenų bazės pavadinimas
});

// Prisijungimo funkcija
export const loginUser = (req, res) => {
    const { email, password } = req.body;

    // Patikriname, ar vartotojas su tokiu el. paštu egzistuoja
    connection.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Klaida tikrinant vartotoją:', err);
            return res.status(500).json({ success: false, message: 'Klaida prisijungiant' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'Toks vartotojas neegzistuoja' });
        }

        const user = results[0];

        // Patikriname slaptažodį
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) {
                console.error('Klaida lyginant slaptažodį:', err);
                return res.status(500).json({ success: false, message: 'Klaida' });
            }

            if (isMatch) {
                // Sėkmingas prisijungimas
                res.json({ success: true, message: 'Prisijungimas sėkmingas!', username: user.contact_name, role: user.fk_account_type});
            } else {
                res.status(400).json({ success: false, message: 'Neteisingas slaptažodis' });
            }
        });
    });
};
