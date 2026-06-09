const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/actos', require('./routes/actos'));
app.use('/api/graduandos', require('./routes/graduandos'));
app.use('/api/pases', require('./routes/pases'));
app.use('/api/validar', require('./routes/validar'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listo en http://localhost:${PORT}`));