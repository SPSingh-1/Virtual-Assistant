import express from "express";
import { signUp, Login } from "../controllers/auth.controllers.js";
import { Logout } from "../controllers/auth.controllers.js";
const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", Login);
authRouter.get("/logout", Logout);

export default authRouter;