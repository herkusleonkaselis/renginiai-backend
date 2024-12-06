import mysql from 'mysql2';

// createCart.js
// Sukuriame MySQL ryšį
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Jūsų slaptažodis
    database: 'renginiu_sistema'  // Jūsų duomenų bazės pavadinimas
});


/**
 * Sukuria naują krepšelį naujam vartotojui
 * @param {number} userId - Vartotojo ID
 * @returns {Promise} - Grąžina sukurtą krepšelio ID
 */
const createCart = async (userId) => {
    const query = `
        INSERT INTO cart (fk_user_id, created_at, updated_at)
        VALUES (?, NOW(), NOW())
    `;

    try {
        const [result] = await db.execute(query, [userId]);
        return {
            success: true,
            cartId: result.insertId,
        };
    } catch (error) {
        console.error('Klaida kuriant krepšelį:', error.message);
        throw new Error('Nepavyko sukurti krepšelio.');
    }
};

export default createCart;  // Panaudokite 'export default'
