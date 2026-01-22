import { createServer } from './server';
import { Dashboard } from './templates/pages/Dashboard';

// Start the server with the Dashboard page
createServer(Dashboard, 1228);
