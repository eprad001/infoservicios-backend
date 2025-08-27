import 'dotenv/config';
import express from 'express';
const app = express();
import cors from 'cors';

import rolesRoutes from './routes/rolesRoutes.js';
import personasRoutes from './routes/personasRoutes.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import serviciosRoutes from './routes/serviciosRoutes.js';
import contratosRoutes from './routes/contratosRoutes.js';
import authRoutes from './routes/authRoutes.js';
import personasAdminRoutes from './routes/personasAdminRoutes.js';

app.use(cors());
app.use(express.json());

// Importar rutas
app.use('/roles', rolesRoutes);
app.use('/personas', personasRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/contratos', contratosRoutes);
app.use('/auth', authRoutes);
app.use('/admin', personasAdminRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT} 'http://localhost:3001'`));
