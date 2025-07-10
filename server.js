const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// ✅ Abilita CORS da tutte le origini (solo se necessario)
app.use(cors());

// ✅ Middleware per JSON
app.use(express.json());

// ✅ Serve file statici se usi una cartella 'public'
app.use(express.static('public'));

// ✅ Endpoint per creare la sessione di pagamento Stripe
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount } = req.body;

        // Validazione semplice
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Importo non valido' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Donazione',
                    },
                    unit_amount: Math.round(parseFloat(amount) * 100), // Da euro a centesimi
                },
                quantity: 1,
            }],
            success_url: 'https://www.matteobucci.com',
            cancel_url: 'https://www.matteobucci.com',
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Errore nella creazione della sessione Stripe:', error);
        res.status(500).json({ error: 'Errore durante la creazione della sessione' });
    }
});



// ✅ API per leggere il totale donato da Stripe
app.get('/total-donated', async (req, res) => {
  try {
    let total = 0;
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      // Prepara i parametri della query
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter; // aggiungi solo se non null
      }

      const paymentIntents = await stripe.paymentIntents.list(params);

      // Somma solo quelli riusciti
      for (const pi of paymentIntents.data) {
        if (pi.status === 'succeeded' && pi.currency === 'eur') {
          total += pi.amount; // centesimi
        }
      }

      hasMore = paymentIntents.has_more;
      if (hasMore) {
        startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id;
      }
    }

    console.log(`Totale raccolto: ${total / 100} €`);
    res.json({ total: total / 100 }); // ritorna in euro
  } catch (error) {
    console.error('❌ Errore Stripe:', error.message, error);
    res.status(500).json({ error: 'Errore durante il recupero del totale' });
  }
});





// ✅ Avvia il server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});





/*app.use('/webhook', express.raw({ type: 'application/json' })); // override default body-parser solo per webhook



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






require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    const { priceId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            success_url: 'https://www.matteobucci.com/success.html',
            cancel_url: 'https://www.matteobucci.com/cancel.html',
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








const express = require('express');
const fetch = require('node-fetch');  // oppure usa native fetch su Node 18+
const app = express();
const path = require('path');

const API_KEY = 'LA_TUA_API_KEY';
const UPLOADS_PLAYLIST_ID = 'UUJopFJWqCV0hGKvGp0lY0Zw';  // playlist "uploads" del tuo canale

app.use(express.static('public'));

// Endpoint che il frontend può chiamare
app.get('/api/videos', async (req, res) => {
    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=12&key=${API_KEY}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Errore API YouTube:', error);
        res.status(500).json({ error: 'Errore nel recupero dei video' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server avviato su porta ${PORT}`);
});
*/