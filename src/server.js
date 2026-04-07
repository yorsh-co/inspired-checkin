import './config/env.js';
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port || 3000, () => {
  console.log('Server running');
});
