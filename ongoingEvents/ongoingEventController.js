import mysql from 'mysql2';
import express from 'express';

// Sukuriame MySQL ryšį
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'renginiu_sistema'
});

const router = express.Router();

// GET endpoint for fetching events that are not "Ended"
router.get('/events', async (req, res) => {
    try {
        // SQL query to get events that are still ongoing (not ended)
        const query = `
            SELECT 
                E.id_Event, E.name, E.desc_short,
                DATE_FORMAT(E.publish_date, '%m/%d/%Y %H:%i') AS publish_date,
                DATE_FORMAT(E.start_time, '%m/%d/%Y %H:%i') AS start_time,
                DATE_FORMAT(E.end_time, '%m/%d/%Y %H:%i') AS end_time,
                L.latitude, L.longitude, 
                ET.event_name AS event_type
            FROM Event E
            JOIN Event_Type ET ON E.fk_Event_Typeid_Event_Type = ET.id_Event_Type
            JOIN Location L ON E.fk_Locationid_Location = L.id_Location
            WHERE E.fk_Event_Statusid_Event_Status != 3  -- Exclude "frEnded" events
            ORDER BY E.publish_date DESC
        `;

        // Execute the query and fetch results
        connection.query(query, (err, results) => {
            if (err) {
                // If there is an error, send a 500 response with error message
                console.error('Database query error:', err);
                return res.status(500).json({ message: 'Error retrieving events' });
            }

            // If query is successful, send the results as JSON
            console.log(results);
            res.json(results);
        });
    } catch (err) {
        // If there's an exception, send a 500 response with error message
        console.error('Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
