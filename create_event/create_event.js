import mysql from 'mysql2';
import bcrypt from 'bcrypt';

// Sukuriame MySQL ryšį (čia reikia įrašyti savo duomenų bazės duomenis)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // įrašykite savo slaptažodį
    database: 'renginiu_sistema'  // jūsų duomenų bazės pavadinimas
});

// Užklausa sukurti renginį (POST)
export function createEvent(req, res) {
    const { name, start_time, end_time, fk_Locationid_Location } = req.body;

    const desc_long = "";
    const desc_short = "";
    const publish_date = new Date().toISOString().slice(0, 19).replace('T', ' '); // Pvz., "2024-12-06 14:30:00"
    const image = 'default_image.jpg';
    const ticket_count = 0;
    const fk_Event_Typeid_Event_Type = "unnamed1"; // default
    const fk_Event_Statusid_Event_Status = "Planned";

    // Validate input fields 
    if (!name || !start_time || !end_time || !location) { 
        return res.status(400).json({ success: false, message: 'Trūksta privalomų laukų' }); 
    }
    // Įrašome naują renginį į duomenų bazę
    const query = `
        INSERT INTO event (name, desc_long, desc_short, publish_date, start_time, end_time, image, ticket_count, fk_Event_Typeid_Event_Type, fk_Event_Statusid_Event_Status, fk_Locationid_Location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(query, [name, desc_long, desc_short, publish_date, start_time, end_time, image, ticket_count, fk_Event_Typeid_Event_Type, fk_Event_Statusid_Event_Status, fk_Locationid_Location], (err, results) => {
        if (err) {
            console.error('Klaida įrašant renginį:', err);
            return res.status(500).json({ success: false, message: 'Klaida' });
        }

        res.json({ success: true, message: 'Renginys sėkmingai sukurtas!', id: results.insertId });
    });
}