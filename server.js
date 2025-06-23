const express = require('express');
const fs = require('fs');
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const dotenv = require('dotenv');
// dotenv.config();

const app = express();
app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    const { amount } = req.body;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
            price_data: {
                currency: 'eur',
                product_data: { name: 'Donazione' },
                unit_amount: Math.round(amount * 100), // in centesimi
            },
            quantity: 1,
        }],
        success_url: `https://${req.headers.host}/success?amount=${amount}`,
        cancel_url: `https://${req.headers.host}/cancel`,
    });
    res.json({ sessionId: session.id });
});

// Salva l'importo alla fine
app.get('/success', (req, res) => {
    const amount = parseFloat(req.query.amount);
    const data = JSON.parse(fs.readFileSync('donations.json'));
    data.total += amount;
    fs.writeFileSync('donations.json', JSON.stringify(data, null, 2));
    res.redirect('/');
});

// Per la barra di progresso
app.get('/progress', (req, res) => {
    const data = JSON.parse(fs.readFileSync('donations.json'));
    res.json({ total: data.total });
});


const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`✅ Server avviato su porta ${PORT}`);
});

