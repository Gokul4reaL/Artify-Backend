// index.ts

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './api/users/routes';
import auctionRoutes from './api/auction/routes'
import adminRoutes from './api/admin/routes'
import singleStyleRoutes from './api/single-style/routes'
import multiStyleRoutes from './api/multi-style/routes'
import { sequelize } from './sequelize-connection'; // Import Sequelize connection
import { authenticateToken } from './middleware/authenticate';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use('/api', (req, res, next) => {
  if (req.path !== '/login' && req.path !== '/register' && req.path !== '/admin/login' && req.path !== '/admin/register') {
      authenticateToken(req, res, next);
  } else {
      next(); // Skip authentication for login and register routes
  }
});

// Routes
app.use('/api', userRoutes, auctionRoutes, adminRoutes, singleStyleRoutes, multiStyleRoutes);

// Sync Sequelize models with database (if needed)
sequelize.sync({ force: false }) // Uncomment this line if you want to synchronize models with the database

// MySQL Connection
sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL database successfully');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
