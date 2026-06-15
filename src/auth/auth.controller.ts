import { registerSchema } from "../../lib/validation/auth.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/auth/password.js";
import { sendVerificationEmail } from "../../lib/mail/mail.js";
import { router } from "../../lib/express.js";

router.post("/register", async (req, res) => {
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

export default router;
