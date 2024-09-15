import { Router } from "express";
import { AuthController } from "../controllers/auth.js";


export const registerRouter = Router();

registerRouter.post('/', AuthController.register);