import { Router } from "express";
import { listPromotions } from "../controllers/promotion.controller.js";

export const promotionsRouter = Router();

promotionsRouter.get("/promotions", listPromotions);