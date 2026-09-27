import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { UserModel, TherapistModel, BookingModel } from '../models/index.js';

const UPDATABLE_FIELDS = ['name', 'phone', 'dob'];

export async function getUsers(req, res) {
  try {
    const { role } = req.query;
    const requesterRole = req.user?.role;

    // Regular users never receive a directory — only their own record.
    if (requesterRole === 'user') {
      const self = db.users.find((u) => u.userId === req.user.userId);
      if (isMongoConnected()) {
        const me = await UserModel.findOne({ userId: req.user.userId }).select('-password').lean();
        return res.status(200).json(me ? [me] : []);
      }
      return res.status(200).json(self ? [{ ...self, password: undefined }] : []);
    }

    // Therapists only ever see the patients they actually have sessions with.
    if (requesterRole === 'therapist' && role === 'user') {
      if (isMongoConnected()) {
        const bookings = await BookingModel.find({ therapistId: req.user.userId }).lean();
        const patientIds = [...new Set(bookings.map((b) => b.userId))];
        const patients = patientIds.length
          ? await UserModel.find({ userId: { $in: patientIds } }).select('-password').lean()
          : [];
        return res.status(200).json(patients);
      }
      const patientIds = new Set(
        db.bookings.filter((b) => b.therapistId === req.user.userId).map((b) => b.userId)
      );
      const patients = db.users
        .filter((u) => u.role === 'user' && patientIds.has(u.userId))
        .map(({ password, ...rest }) => rest);
      return res.status(200).json(patients);
    }

    if (isMongoConnected()) {
      if (role === 'therapist') {
        const therapists = await TherapistModel.find({}).lean();
        return res.status(200).json(therapists);
      }
      const query = role ? { role } : {};
      const users = await UserModel.find(query).select('-password').lean();
      return res.status(200).json(users);
    }

    if (role === 'therapist') {
      return res.status(200).json(db.therapists);
    }
    if (role) {
      const filtered = db.users
        .filter((u) => u.role === role)
        .map(({ password, ...rest }) => rest);
      return res.status(200).json(filtered);
    }
    const allUsers = db.users.map(({ password, ...rest }) => rest);
    res.status(200).json(allUsers);
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Unable to load users. Please try again.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';

    // Ownership: only the account owner (or an admin) may update the profile.
    if (!isAdmin && id !== req.user?.userId) {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    // Whitelist — role/password/isActive can never be changed through this endpoint.
    const updates = {};
    for (const key of UPDATABLE_FIELDS) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid profile fields to update.' });
    }

    if (isMongoConnected()) {
      const updatedUserDoc = await UserModel.findOneAndUpdate(
        { userId: id },
        { $set: updates },
        { new: true }
      ).lean();

      if (!updatedUserDoc) {
        return res.status(404).json({ message: 'User not found.' });
      }

      await TherapistModel.updateOne(
        { $or: [{ therapistId: id }, { userId: id }] },
        { $set: updates }
      );

      const { password, ...userWithoutPassword } = updatedUserDoc;

      const dbUser = db.users.find((u) => u.userId === id);
      if (dbUser) Object.assign(dbUser, updates);

      return res.status(200).json(userWithoutPassword);
    }

    const user = db.users.find((u) => u.userId === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    Object.assign(user, updates);

    const therapist = db.therapists.find((t) => t.therapistId === id || t.userId === id);
    if (therapist) {
      Object.assign(therapist, updates);
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Unable to update the profile. Please try again.' });
  }
}
