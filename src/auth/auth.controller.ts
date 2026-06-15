import { registerSchema } from "../../lib/validation/auth.js";
import { loginSchema } from "../../lib/validation/auth.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/auth/password.js";
import { generateToken } from "../../lib/auth/jwt.js";
import { comparePassword } from "../../lib/auth/password.js";
import { sendVerificationEmail } from "../../lib/mail/mail.js";
import { router } from "../../lib/express.js";
import type { Request, Response } from "express";

// Register enpoint
router.post("/register", async (req: Request, res: Response) => {
  try {
    // Get the data from the request body
    const body = req.body;

    // Safely validates the data using zod
    const validatedFields = registerSchema.safeParse(body);

    // Throw a possible error when not properly validated
    if (!validatedFields.success) {
      return res.status(400).json({ error: validatedFields.error.flatten() });
    }

    // Extract the data from the validated fields
    const { fullName, email, password } = validatedFields.data;

    // Check if user already exist
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exist" });
    }

    // if user does not exist, then hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token using CryptoUUId
    const verificationToken = crypto.randomUUID();

    // Save the new user to database
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },

      select: {
        id: true,
        email: true,
      },
    });

    // Get user's full name in order to add to email template
    const name = fullName.split(" ")[0] as string;

    // Send user a verification email
    await sendVerificationEmail(user.email, verificationToken, name);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

// Login endpoinnt
router.post("/login", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const validatedFields = loginSchema.safeParse(body);

    if (!validatedFields.success) {
      return res.status(400).json({
        error: validatedFields.error.flatten(),
      });
    }

    // Get the validated data
    const { email, password } = validatedFields.data;

    // Checking if user exists
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "A user with this email does not exist",
      });
    }

    const correctPassword = await comparePassword(password, user.password);

    if (!correctPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.status(200).json({ message: "Login successfull" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
