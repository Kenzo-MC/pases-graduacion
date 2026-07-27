const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const helmet = require('helmet');
app.use(helmet());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/actos', require('./routes/actos'));
app.use('/api/graduandos', require('./routes/graduandos'));
app.use('/api/pases', require('./routes/pases'));
app.use('/api/validar', require('./routes/validar'));

app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listo en http://localhost:${PORT}`));