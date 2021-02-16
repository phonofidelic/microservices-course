import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@phonotickets/common";

import { User } from "../models/user";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").trim().notEmpty().withMessage("Please provide a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    /**
     * Generate JWP
     */
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env
        .JWT_KEY! /** Existence of key is checked during server startup */
    );

    /**
     * Store JWT on the session object
     */
    req.session = { jwt: userJwt };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
