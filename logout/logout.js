import express from 'express';  // Naudojame ES modulių importą
const router = express.Router();

// Atsijungimo užklausos apdorojimas
router.post('/logout', (req, res) => {
    // Ištriname sesiją arba tokeną, kad atsijungtume
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Klaida atsijungiant' });
            }
            // Jei atsijungimas sėkmingas, grąžiname sėkmės atsakymą
            res.json({ success: true, message: 'Sėkmingai atsijungėte!' });
        });
    } else {
        res.status(400).json({ success: false, message: 'Jūs nesate prisijungę' });
    }
});

// Eksportuojame router kaip default
export default router;
