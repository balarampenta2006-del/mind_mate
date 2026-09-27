import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/store.js';
import { generateToken } from '../middleware/auth.js';
import { isMongoConnected } from '../config/database.js';
import { config } from '../config/config.js';
import { UserModel, TherapistModel } from '../models/index.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

/** Escape user input before building a RegExp. */
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function register(req, res) {
  try {
    // Role is ALWAYS 'user' — therapists/admins are provisioned by an admin.
    const { name, email, password, phone, dob } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const role = 'user';
    const hashed = hashPassword(password);

    if (isMongoConnected()) {
      const existingUser = await UserModel.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') });
      if (existingUser) {
        return res.status(409).json({ message: 'This email is already registered. Please log in instead.' });
      }

      const userId = `u_${Date.now()}`;
      const newUserDoc = await UserModel.create({
        userId,
        name,
        email,
        password: hashed,
        phone: phone || '',
        dob: dob || '',
        role,
        isActive: true,
      });

      const newUserObj = newUserDoc.toObject();
      const { password: _, ...userWithoutPassword } = newUserObj;
      const token = generateToken(newUserObj);

      // Sync to in-memory store
      db.users.push(newUserObj);

      return res.status(201).json({ user: userWithoutPassword, token });
    }

    // Fallback to in-memory store if Mongo disconnected
    const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ message: 'This email is already registered. Please log in instead.' });
    }

    const newUser = {
      userId: `u_${Date.now()}`,
      name,
      email,
      password: hashed,
      phone: phone || '',
      dob: dob || '',
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    const token = generateToken(newUser);

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ message: 'Unable to complete registration. Please try again.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    let user = null;

    if (isMongoConnected()) {
      user = await UserModel.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') }).lean();
    }

    if (!user) {
      user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'This account has been deactivated. Please contact support.' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user);

    res.status(200).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Unable to sign in. Please try again.' });
  }
}

export async function logout(req, res) {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    let user = null;
    if (isMongoConnected()) {
      user = await UserModel.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') }).lean();
    }
    if (!user) {
      user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    // Always answer 200 so the endpoint can't be used to enumerate accounts.
    const payload = { success: true, message: 'If an account exists for that email, a password reset link has been sent.' };
    if (!user) return res.status(200).json(payload);

    const resetToken = uuidv4();
    db.resetTokens.set(resetToken, {
      email: user.email,
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    // Demo mode: no email provider is wired up, so the token is returned to
    // the client outside production to keep the flow usable end-to-end.
    if (config.nodeEnv !== 'production') {
      payload.resetToken = resetToken;
      payload.note = 'Demo mode: no email is sent. Use resetToken to finish the reset flow.';
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ message: 'Unable to process the request. Please try again.' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const record = db.resetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      if (record) db.resetTokens.delete(token);
      return res.status(400).json({ message: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    const hashed = hashPassword(password);

    if (isMongoConnected()) {
      await UserModel.updateOne(
        { email: new RegExp(`^${escapeRegex(record.email)}$`, 'i') },
        { $set: { password: hashed } }
      );
    }
    const user = db.users.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
    if (user) {
      user.password = hashed;
    }
    db.resetTokens.delete(token);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Unable to reset the password. Please try again.' });
  }
}
