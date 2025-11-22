require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');


const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');


const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => res.json({ message: 'Task Manager API' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));