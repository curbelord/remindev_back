import express from "express";
import { config } from "dotenv";
import { loginRouter } from "./routes/login.js";
import { registerRouter } from "./routes/register.js";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./middlewares/cors.js";


config();

const app = express();
const PORT = process.env.PORT;

app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);

app.use('/login', loginRouter);
app.use('/register', registerRouter);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});