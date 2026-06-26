import { createApp } from './app.js';

const { app } = createApp();
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`ICU Steward API running on http://localhost:${port}`);
});
