import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";

const PORT = Number(process.env.PORT) || 11000;

app.listen(PORT, () => {
  console.log(`Fleet backend running on http://localhost:${PORT}`);
});
