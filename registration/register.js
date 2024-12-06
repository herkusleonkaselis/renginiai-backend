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
    const { username, email, password, contact_name, dob, bio, address, phone_number } = req.body;

    // Check if a user with the same email already exists
    connection.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ success: false, message: 'Error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ success: false, message: 'Error' });
            }

            // Create current date
            const createDate = new Date().toISOString().slice(0, 19).replace('T', ' ');  // Format: "2024-12-06 14:30:00"
            const status = 'active';  // Default status
            const accountType = 1;  // Default account type (Attendee)

            // Insert the new user into the user table
            const userQuery = `
                INSERT INTO user (username, password_hash, email, contact_name, create_date, status, fk_Account_Type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            connection.query(userQuery, [username, hashedPassword, email, contact_name, createDate, status, accountType], (err, userResults) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ success: false, message: 'Error' });
                }

                const userId = userResults.insertId; // Get the ID of the newly created user

                // Insert attendee information
                const attendeeQuery = `
                    INSERT INTO attendee_information (dob, bio, address, phone_number, fk_Locationid_Location, fk_Userid_User, fk_gender)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                connection.query(attendeeQuery, [dob, bio, address, phone_number, 1, userId, 3], (err, attendeeResults) => {
                    if (err) {
                        console.error('Error inserting attendee information:', err);
                        return res.status(500).json({ success: false, message: 'Error' });
                    }

                    // Store user session
                    req.session.user = {
                        username: username,
                    };

                    res.json({ success: true, message: 'Successfully registered!' });
                });
            });
        });
    });
}
