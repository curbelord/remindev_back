import { Router } from "express";
import { AuthController } from "../controllers/auth.js";


export const loginRouter = Router();

loginRouter.post('/', AuthController.login);