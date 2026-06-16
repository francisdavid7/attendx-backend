import { registerSchema } from "../../lib/validation/auth.js";
import { loginSchema } from "../../lib/validation/auth.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/auth/password.js";
import { generateToken, verifyToken } from "../../lib/auth/jwt.js";
import { comparePassword } from "../../lib/auth/password.js";
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "../../lib/mail/mail.js";
import { router } from "../../lib/express.js";
import type { Request, Response } from "express";

// Get current user endpoint
router.get("/me", async (req: Request, res: Response) => {
  try {
    // get token from cookies header
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    // Verify token
    const decoded = verifyToken(token);
    const userId = typeof decoded === "string" ? decoded : decoded.id;

    // Fetch user using the verified token
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        fullName: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

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

    return res.status(200).json({ message: "Login successfull" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Verify email endpoint
router.put("/confirm-email", async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query;
    const token = searchQuery.token as string;

    if (!token) {
      return res.status(400).json({ error: "Invalid Token" });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      return res.status(400).json({ error: "Verification link expired" });
    }

    if (user.isVerified) {
      return res
        .status(200)
        .json({ message: "Your email is already verified" });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Resend verification email endpoint
router.post("/resend-email", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { id: userId, email } = body;

    const verificationToken = crypto.randomUUID();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    const studentName = user.fullName.split(" ")[0] as string;

    await sendVerificationEmail(email, verificationToken, studentName);

    return res.status(200).json({
      success: true,
      message: `Email resent successfully to ${email}`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Forgot password endpoint
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { email } = body;

    const resetPasswordToken = crypto.randomUUID();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        error: "User with this email does not exist",
      });
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken,
        resetPasswordTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    const name = user.fullName.split(" ")[0] as string;
    await sendResetPasswordEmail(name, resetPasswordToken, user.email);

    return res.status(200).json({
      success: true,
      message: `We've sent a password reset link to ${user.email} Please check your inbox and follow the instructions.`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Reset password endpoint
router.put("/reset-password", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { token, password } = body;

    if (!token) {
      return res.status(404).json({ error: "Missing token" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized!" });
    }

    if (
      user.resetPasswordTokenExpiresAt &&
      user.resetPasswordTokenExpiresAt < new Date()
    ) {
      return res.status(410).json({ error: "Verificaiton link expired" });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      },

      select: {
        id: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
      user,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Logout endpoint
router.get("/logout", async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    return res.status(204).json({ message: "Logged out successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
