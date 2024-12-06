import mysql from 'mysql2';
import bcrypt from 'bcrypt';

// Sukuriame MySQL ryšį
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Jūsų slaptažodis
    database: 'renginiu_sistema'  // Jūsų duomenų bazės pavadinimas
});

// Registracijos užklausa (POST)
export function registerUser(req, res) {
    const { username, email, password, contact_name } = req.body;

    // Patikriname, ar vartotojas su tokiu el. paštu jau egzistuoja
    connection.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Klaida tikrinant vartotoją:', err);
            return res.status(500).json({ success: false, message: 'Klaida' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Vartotojas su tokiu el. paštu jau egzistuoja' });
        }

        // Slaptažodžio šifravimas
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Klaida šifruojant slaptažodį:', err);
                return res.status(500).json({ success: false, message: 'Klaida' });
            }

            // Sukuriame dabartinę datą
            const createDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Pvz., "2024-12-06 14:30:00"
            const status = 'active';  // Numatytoji reikšmė
            const accountType = 1;//'Attendee';  // Numatytas paskyros tipas

            // Įrašome naują vartotoją į duomenų bazę
            const query = `
                INSERT INTO user (username, password_hash, email, contact_name, create_date, status, fk_Account_Type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            connection.query(query, [username, hashedPassword, email, contact_name, createDate, status, accountType], (err, results) => {
                if (err) {
                    console.error('Klaida įrašant vartotoją:', err);
                    return res.status(500).json({ success: false, message: 'Klaida' });
                }

                req.session.user = {
                    username: username,  // Įrašykite vardą į sesiją
                };

                res.json({ success: true, message: 'Sėkmingai užsiregistravote!' });
            });
        });
    });
}