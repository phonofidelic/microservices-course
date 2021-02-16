import express, { Request, Response } from "express";
import { currentUser } from "@phonotickets/common";

const router = express.Router();

router.get(
  "/api/users/currentuser",
  currentUser,
  (req: Request, res: Response) => {
    console.log("*** currentuser");
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
