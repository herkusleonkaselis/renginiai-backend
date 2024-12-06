import mysql from 'mysql2';
import express from 'express';

// Sukuriame MySQL ryšį
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'renginiu_sistema'
});

// If you're exporting the db connection to another file, you should export it like this
export const db = connection.promise();  // using promise() for async/await support

// Initialize express router
const router = express.Router();

// Get user profile information (with phone_number from both tables)
router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    //console.log(id);
    try {
        const query = `
            SELECT u.username, u.email, u.contact_name,DATE_FORMAT(u.create_date, '%m/%d/%Y') AS create_date, DATE_FORMAT(ai.dob, '%m/%d/%Y') AS dob, ai.bio, ai.address, ai.phone_number AS attendee_phone, l.latitude, l.longitude, g.gender_name
            FROM user u
                     JOIN attendee_information ai ON u.id_User = ai.fk_userid_user
                     JOIN location l ON ai.fk_locationid_location = l.id_Location
                     LEFT JOIN gender g ON ai.fk_gender = g.id_gender
            WHERE u.id_User = ?
        `;
        const [rows] = await db.query(query, [id]);
        //res.json(rows[0]);
        //console.log(res.json(rows[0]));
        console.log(rows);
        res.json(rows[0]);
        //res.json({ success: true, message: 'Prisijungimas sėkmingas!', id: user.id_User, username: user.username, role: user.fk_account_type});
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ message: 'Failed to fetch profile', error: err });
    }
});

// Update user profile information
router.put('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, contact_name, dob, bio, address, phone_number, latitude, longitude, gender_name } = req.body;

    console.log(gender_name);

    let fkGender;

    if (gender_name === "male") {
        fkGender = 1;
    } else if (gender_name === "female") {
        fkGender = 2;
    } else if (gender_name === "unspecified") {
        fkGender = 3;
    } else {
        return res.status(400).json({ message: 'Invalid gender value' });
    }

    try {
        const updateUserQuery = `
            UPDATE user
            SET username = ?, email = ?, contact_name = ?
            WHERE id_User = ?
        `;
        await db.query(updateUserQuery, [username, email, contact_name, id]);

        const updateAttendeeQuery = `
            UPDATE attendee_information
            SET dob = ?, bio = ?, address = ?, phone_number = ?, fk_gender = ?
            WHERE fk_userid_user = ?
        `;
        await db.query(updateAttendeeQuery, [dob, bio, address, phone_number, fkGender, id]);

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err });
    }
        /*
        const updateAttendeeQuery = `
            UPDATE attendee_information
            SET dob = ?, bio = ?, address = ?, phone_number = ?, fk_locationid_location = (SELECT id_Location FROM location WHERE latitude = ? AND longitude = ?)
            WHERE fk_userid_user = ?
        `;
        await db.query(updateAttendeeQuery, [dob, bio, address, phone_number, latitude, longitude, id]);

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err });
    }
         */
});

// Delete user profile
router.delete('/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteAttendeeQuery = `DELETE FROM attendee_information WHERE fk_userid_user = ?`;
        await db.query(deleteAttendeeQuery, [id]);

        const deleteUserQuery = `DELETE FROM user WHERE id_User = ?`;
        await db.query(deleteUserQuery, [id]);

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete account', error: err });
    }
});

// Export router
export default router;
