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
        success_url: `https://www.matteobucci.com`,
        cancel_url: `https://www.matteobucci.com`,
    });
    res.json({ sessionId: session.id });
});

// Salva l'importo alla fine
// app.get('/success', (req, res) => {
//     const amount = parseFloat(req.query.amount);
//     const data = JSON.parse(fs.readFileSync('donations.json'));
//     data.total += amount;
//     fs.writeFileSync('donations.json', JSON.stringify(data, null, 2));
//     res.redirect('/');
// });

// Per la barra di progresso
app.get('/progress', (req, res) => {
    const data = JSON.parse(fs.readFileSync('donations.json'));
    res.json({ total: data.total });
});


const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`✅ Server avviato su porta ${PORT}`);
});



app.use('/webhook', express.raw({ type: 'application/json' })); // override default body-parser solo per webhook



const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed.', err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gestione evento di pagamento riuscito
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const amount = session.amount_total / 100; // da centesimi a euro

        try {
            const data = JSON.parse(fs.readFileSync('donations.json', 'utf8'));
            data.total += amount;
            fs.writeFileSync('donations.json', JSON.stringify(data, null, 2));
            console.log(`✅ Donazione di €${amount.toFixed(2)} registrata`);
        } catch (err) {
            console.error("❌ Errore nell'aggiornamento di donations.json:", err);
        }
    }

    response.status(200).end();
});




















app.post('/create-checkout-session', async (req, res) => {
    const { priceId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: 'https://www.matteobucci.com/success.html',
            cancel_url: 'https://www.matteobucci.com/cancel.html',
        });

        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



