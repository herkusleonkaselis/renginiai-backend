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
router.get('/eventsDone', async (req, res) => {
    try {
        // SQL query to get events that are still ongoing (not ended)
        const query = `
            SELECT
                E.id_Event,
                E.name,
                E.desc_short,
                DATE_FORMAT(E.publish_date, '%m/%d/%Y %H:%i') AS publish_date,
                DATE_FORMAT(E.start_time, '%m/%d/%Y %H:%i') AS start_time,
                DATE_FORMAT(E.end_time, '%m/%d/%Y %H:%i') AS end_time,
                L.latitude,
                L.longitude,
                ET.event_name AS event_type,
                R.stars AS latest_rating
            FROM Event E
                     JOIN Event_Type ET
                          ON E.fk_Event_Typeid_Event_Type = ET.id_Event_Type
                     JOIN Location L
                          ON E.fk_Locationid_Location = L.id_Location
                     LEFT JOIN (
                SELECT fk_Eventid_Event, MAX(date) AS latest_date
                FROM rating
                GROUP BY fk_Eventid_Event
            ) AS latest_rating_date
                               ON E.id_Event = latest_rating_date.fk_Eventid_Event
                     LEFT JOIN rating R
                               ON latest_rating_date.fk_Eventid_Event = R.fk_Eventid_Event
                                   AND latest_rating_date.latest_date = R.date
            WHERE E.fk_Event_Statusid_Event_Status = 3  -- Exclude "frEnded" events
            ORDER BY E.publish_date DESC;
        `;

        // Execute the query and fetch results
        connection.query(query, (err, results) => {
            if (err) {
                // If there is an error, send a 500 response with error message
                console.error('Database query error:', err);
                return res.status(500).json({ message: 'Error retrieving events' });
            }

            // If query is successful, send the results as JSON
            //console.log(results);
            res.json(results);
        });
    } catch (err) {
        // If there's an exception, send a 500 response with error message
        console.error('Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST endpointas, skirtas įrašyti atsiliepimus
router.post('/submitFeedback', (req, res) => {
    const { eventId, rating, id } = req.body;

    const userId = id;

    console.log(userId);

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // First, check if a rating already exists for this eventId and userId
    const checkQuery = `
        SELECT * FROM rating
        WHERE fk_Eventid_Event = ? AND fk_Userid_User = ?
    `;

    connection.query(checkQuery, [eventId, userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error checking existing feedback' });
        }

        if (results.length > 0) {
            // If a rating exists, update it
            const updateQuery = `
                UPDATE rating
                SET stars = ?, date = NOW()
                WHERE fk_Eventid_Event = ? AND fk_Userid_User = ?
            `;

            connection.query(updateQuery, [rating, eventId, userId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Error updating feedback' });
                }
                res.json({ message: 'Feedback updated successfully' });
            });
        } else {
            // If no existing rating, insert a new one
            const insertQuery = `
                INSERT INTO rating (stars, date, fk_Eventid_Event, fk_Userid_User)
                VALUES (?, NOW(), ?, ?)
            `;

            connection.query(insertQuery, [rating, eventId, userId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Error saving feedback' });
                }
                res.json({ message: 'Feedback saved successfully' });
            });
        }
    });
});




export default router;
