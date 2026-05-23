import {Router} from "express";
import { SignupController, SigninController, passwordReset } from "../Controller/Auth.controller.js";
import { requireSignIn } from "../Middlewares/auth.middleware.js";

const router = Router();
router.post("/signup", SignupController);
router.post("/signin", SigninController);
router.put("/reset-password", requireSignIn, passwordReset);
export default router;
