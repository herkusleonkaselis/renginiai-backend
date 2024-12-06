import mysql from 'mysql2';
import express from 'express';

// Sukuriame MySQL ryšį
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Įrašykite savo slaptažodį
    database: 'renginiu_sistema'  // Jūsų duomenų bazės pavadinimas
});

// If you're exporting the db connection to another file, you should export it like this
export const db = connection.promise();  // using promise() for async/await support

// Initialize express router
const router = express.Router();

// Get user profile information (with phone_number from both tables)
router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT u.username, u.email, u.contact_name, u.create_date, ai.dob, ai.bio, ai.address, ai.phone_number AS attendee_phone, l.latitude, l.longitude
            FROM user u
                     JOIN attendee_information ai ON u.id = ai.fk_userid_user
                     JOIN location l ON ai.fk_locationid_location = l.id
            WHERE u.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', error: err });
    }
});

// Update user profile information
router.put('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, contact_name, dob, bio, address, phone_number, latitude, longitude } = req.body;

    try {
        const updateUserQuery = `
            UPDATE user
            SET username = ?, email = ?, contact_name = ?
            WHERE id = ?
        `;
        await db.query(updateUserQuery, [username, email, contact_name, id]);

        const updateAttendeeQuery = `
            UPDATE attendee_information
            SET dob = ?, bio = ?, address = ?, phone_number = ?, fk_locationid_location = (SELECT id FROM location WHERE latitude = ? AND longitude = ?)
            WHERE fk_userid_user = ?
        `;
        await db.query(updateAttendeeQuery, [dob, bio, address, phone_number, latitude, longitude, id]);

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err });
    }
});

// Delete user profile
router.delete('/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteAttendeeQuery = `DELETE FROM attendee_information WHERE fk_userid_user = ?`;
        await db.query(deleteAttendeeQuery, [id]);

        const deleteUserQuery = `DELETE FROM user WHERE id = ?`;
        await db.query(deleteUserQuery, [id]);

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete account', error: err });
    }
});

// Export router
export default router;
