import express from "express";
import { 
    askToAssistant, 
    getCurrentUser, 
    updateAssistant,
    toggleLearningMode,
    changeLanguage,
    changePersonality,
    toggleEmotionDetection,
    changeTheme  // NEW
} from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);
userRouter.post("/asktoassistant", isAuth, askToAssistant);
userRouter.post("/toggle-learning", isAuth, toggleLearningMode);
userRouter.post("/change-language", isAuth, changeLanguage);
userRouter.post("/change-personality", isAuth, changePersonality);
userRouter.post("/toggle-emotion", isAuth, toggleEmotionDetection);
userRouter.post("/change-theme", isAuth, changeTheme);  // NEW ROUTE

export default userRouter;