import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import {
  UserModel,
  TherapistModel,
  BookingModel,
  MoodModel,
  SosAlertModel,
  AdminNotificationModel,
  NotificationModel,
} from '../models/index.js';
import { hashPassword } from '../utils/password.js';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Never allow these fields to be mass-assigned from a request body. */
function pickAllowed(updates, allowed) {
  const out = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) out[key] = updates[key];
  }
  return out;
}

const ADMIN_USER_FIELDS = ['name', 'email', 'phone', 'dob', 'role', 'isActive'];
const ADMIN_THERAPIST_FIELDS = [
  'name',
  'email',
  'phone',
  'specialization',
  'experience',
  'bio',
  'languages',
  'avatar',
  'sessionFee',
  'isActive',
  'isAvailable',
  'rating',
];

function serverError(res, error) {
  console.error('admin endpoint error:', error);
  res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
}

export async function getAdminStats(req, res) {
  try {
    if (isMongoConnected()) {
      const [
        totalUsers,
        activeUsers,
        totalTherapists,
        activeTherapists,
        totalBookings,
        pendingBookings,
        moodLogs,
        sosAlerts,
      ] = await Promise.all([
        UserModel.countDocuments({ role: 'user' }),
        UserModel.countDocuments({ role: 'user', isActive: true }),
        TherapistModel.countDocuments({}),
        TherapistModel.countDocuments({ isActive: true }),
        BookingModel.countDocuments({}),
        BookingModel.countDocuments({ status: 'Pending' }),
        MoodModel.countDocuments({}),
        SosAlertModel.countDocuments({}),
      ]);

      return res.status(200).json({
        totalUsers,
        activeUsers,
        totalTherapists,
        activeTherapists,
        totalBookings,
        pendingBookings,
        moodLogs,
        sosAlerts,
      });
    }

    const totalUsers = db.users.filter((u) => u.role === 'user').length;
    const activeUsers = db.users.filter((u) => u.role === 'user' && u.isActive).length;
    const totalTherapists = db.therapists.length;
    const activeTherapists = db.therapists.filter((t) => t.isActive).length;
    const totalBookings = db.bookings.length;
    const pendingBookings = db.bookings.filter((b) => b.status === 'Pending').length;
    const moodLogs = db.moods.length;
    const sosAlerts = db.sosAlerts.length;

    res.status(200).json({
      totalUsers,
      activeUsers,
      totalTherapists,
      activeTherapists,
      totalBookings,
      pendingBookings,
      moodLogs,
      sosAlerts,
    });
  } catch (error) {
    serverError(res, error);
  }
}

export async function getAdminMoods(req, res) {
  try {
    if (isMongoConnected()) {
      const moods = await MoodModel.find({}).sort({ date: -1 }).limit(2000).lean();
      return res.status(200).json(moods);
    }
    res.status(200).json(db.moods);
  } catch (error) {
    serverError(res, error);
  }
}

export async function getAdminUsers(req, res) {
  try {
    const { search, status } = req.query;

    if (isMongoConnected()) {
      const query = { role: 'user' };
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
      if (search) {
        const q = new RegExp(escapeRegex(search), 'i');
        query.$or = [{ name: q }, { email: q }];
      }

      const users = await UserModel.find(query).select('-password').lean();
      return res.status(200).json(users);
    }

    let results = db.users.filter((u) => u.role === 'user');

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    if (status === 'active') results = results.filter((u) => u.isActive);
    if (status === 'inactive') results = results.filter((u) => !u.isActive);

    const sanitized = results.map(({ password, ...rest }) => rest);
    res.status(200).json(sanitized);
  } catch (error) {
    serverError(res, error);
  }
}

export async function getAdminUserDetail(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const user = await UserModel.findOne({ userId: id }).select('-password').lean();
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const bookings = await BookingModel.find({ userId: id }).lean();
      const recentMoods = await MoodModel.find({ userId: id }).sort({ createdAt: -1 }).limit(7).lean();

      return res.status(200).json({
        user,
        bookings,
        recentMoods,
      });
    }

    const user = db.users.find((u) => u.userId === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const bookings = db.bookings.filter((b) => b.userId === id);
    const recentMoods = db.moods.filter((m) => m.userId === id).slice(0, 7);

    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      user: userWithoutPassword,
      bookings,
      recentMoods,
    });
  } catch (error) {
    serverError(res, error);
  }
}

export async function updateAdminUser(req, res) {
  try {
    const { id } = req.params;
    const updates = pickAllowed(req.body || {}, ADMIN_USER_FIELDS);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    if (isMongoConnected()) {
      const updatedUser = await UserModel.findOneAndUpdate(
        { userId: id },
        { $set: updates },
        { new: true }
      ).select('-password').lean();

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const cached = db.users.find((u) => u.userId === id);
      if (cached) Object.assign(cached, updates);

      return res.status(200).json(updatedUser);
    }

    const user = db.users.find((u) => u.userId === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    Object.assign(user, updates);
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    serverError(res, error);
  }
}

export async function deactivateUser(req, res) {
  try {
    const { id } = req.params;
    const cached = db.users.find((u) => u.userId === id);
    let exists = Boolean(cached);

    if (isMongoConnected()) {
      const result = await UserModel.updateOne({ userId: id }, { $set: { isActive: false } });
      exists = result.matchedCount > 0 || exists;
    }

    if (!exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (cached) cached.isActive = false;
    res.status(200).json({ success: true, message: 'User deactivated.' });
  } catch (error) {
    serverError(res, error);
  }
}

export async function reactivateUser(req, res) {
  try {
    const { id } = req.params;
    const cached = db.users.find((u) => u.userId === id);
    let exists = Boolean(cached);

    if (isMongoConnected()) {
      const result = await UserModel.updateOne({ userId: id }, { $set: { isActive: true } });
      exists = result.matchedCount > 0 || exists;
    }

    if (!exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (cached) cached.isActive = true;
    res.status(200).json({ success: true, message: 'User reactivated.' });
  } catch (error) {
    serverError(res, error);
  }
}

export async function removeUser(req, res) {
  try {
    const { id } = req.params;
    const index = db.users.findIndex((u) => u.userId === id);
    let exists = index !== -1;

    if (isMongoConnected()) {
      const result = await UserModel.deleteOne({ userId: id });
      exists = result.deletedCount > 0 || exists;
    }

    if (!exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (index !== -1) {
      db.users.splice(index, 1);
    }

    res.status(200).json({ success: true, message: 'User removed successfully.' });
  } catch (error) {
    serverError(res, error);
  }
}

export async function getAdminTherapists(req, res) {
  try {
    const { search, status } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
      if (search) {
        const q = new RegExp(escapeRegex(search), 'i');
        query.$or = [{ name: q }, { specialization: q }, { email: q }];
      }

      const therapists = await TherapistModel.find(query).lean();
      return res.status(200).json(therapists);
    }

    let results = db.therapists;

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.specialization && t.specialization.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q))
      );
    }

    if (status === 'active') results = results.filter((t) => t.isActive);
    if (status === 'inactive') results = results.filter((t) => !t.isActive);

    res.status(200).json(results);
  } catch (error) {
    serverError(res, error);
  }
}

export async function getAdminTherapistDetail(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const therapist = await TherapistModel.findOne({
        $or: [{ therapistId: id }, { userId: id }],
      }).lean();

      if (!therapist) {
        return res.status(404).json({ message: 'Therapist not found.' });
      }

      const bookings = await BookingModel.find({ therapistId: id }).lean();
      const patientIds = [...new Set(bookings.map((b) => b.userId))];
      const patients = await UserModel.find({ userId: { $in: patientIds } })
        .select('-password')
        .lean();

      return res.status(200).json({
        therapist,
        bookings,
        patients,
      });
    }

    const therapist = db.therapists.find((t) => t.therapistId === id || t.userId === id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found.' });
    }

    const bookings = db.bookings.filter((b) => b.therapistId === id);
    const patientIds = [...new Set(bookings.map((b) => b.userId))];
    const patients = db.users
      .filter((u) => patientIds.includes(u.userId))
      .map(({ password, ...rest }) => rest);

    res.status(200).json({
      therapist,
      bookings,
      patients,
    });
  } catch (error) {
    serverError(res, error);
  }
}

export async function onboardTherapist(req, res) {
  try {
    const { name, email, specialization, phone, experience, bio } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const id = `t_${Date.now()}`;
    const password = hashPassword('demo1234');
    const newTherapist = {
      therapistId: id,
      userId: id,
      name,
      email,
      specialization: specialization || 'General Therapy',
      phone: phone || '',
      experience: Number(experience || 1),
      bio: bio || '',
      isActive: true,
    };

    if (isMongoConnected()) {
      // Create the login user first so a duplicate email fails before the
      // therapist record exists (no orphaned documents).
      await UserModel.create({
        userId: id,
        name,
        email,
        password,
        phone: phone || '',
        role: 'therapist',
        isActive: true,
      });

      const doc = await TherapistModel.create(newTherapist);

      const obj = doc.toObject();
      db.therapists.push(obj);
      db.users.push({
        userId: id,
        name,
        email,
        password,
        phone: phone || '',
        dob: '',
        role: 'therapist',
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      return res.status(201).json(obj);
    }

    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    db.therapists.push(newTherapist);
    db.users.push({
      userId: id,
      name,
      email,
      password,
      phone: phone || '',
      dob: '',
      role: 'therapist',
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newTherapist);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }
    serverError(res, error);
  }
}

export async function updateAdminTherapist(req, res) {
  try {
    const { id } = req.params;
    const updates = pickAllowed(req.body || {}, ADMIN_THERAPIST_FIELDS);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    if (isMongoConnected()) {
      const updated = await TherapistModel.findOneAndUpdate(
        { $or: [{ therapistId: id }, { userId: id }] },
        { $set: updates },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ message: 'Therapist not found.' });
      }

      const cached = db.therapists.find((t) => t.therapistId === id || t.userId === id);
      if (cached) Object.assign(cached, updates);

      return res.status(200).json(updated);
    }

    const therapist = db.therapists.find((t) => t.therapistId === id || t.userId === id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found.' });
    }

    Object.assign(therapist, updates);
    res.status(200).json(therapist);
  } catch (error) {
    serverError(res, error);
  }
}

export async function deactivateTherapist(req, res) {
  try {
    const { id } = req.params;
    const cached = db.therapists.find((t) => t.therapistId === id || t.userId === id);
    let exists = Boolean(cached);

    if (isMongoConnected()) {
      const result = await TherapistModel.updateOne(
        { $or: [{ therapistId: id }, { userId: id }] },
        { $set: { isActive: false } }
      );
      exists = result.matchedCount > 0 || exists;
    }

    if (!exists) {
      return res.status(404).json({ message: 'Therapist not found.' });
    }

    if (cached) cached.isActive = false;
    res.status(200).json({ success: true, message: 'Therapist deactivated.' });
  } catch (error) {
    serverError(res, error);
  }
}

export async function reactivateTherapist(req, res) {
  try {
    const { id } = req.params;
    const cached = db.therapists.find((t) => t.therapistId === id || t.userId === id);
    let exists = Boolean(cached);

    if (isMongoConnected()) {
      const result = await TherapistModel.updateOne(
        { $or: [{ therapistId: id }, { userId: id }] },
        { $set: { isActive: true } }
      );
      exists = result.matchedCount > 0 || exists;
    }

    if (!exists) {
      return res.status(404).json({ message: 'Therapist not found.' });
    }

    if (cached) cached.isActive = true;
    res.status(200).json({ success: true, message: 'Therapist reactivated.' });
  } catch (error) {
    serverError(res, error);
  }
}

export async function removeTherapist(req, res) {
  try {
    const { id } = req.params;
    const index = db.therapists.findIndex((t) => t.therapistId === id || t.userId === id);
    let exists = index !== -1;

    if (isMongoConnected()) {
      const result = await TherapistModel.deleteOne({ $or: [{ therapistId: id }, { userId: id }] });
      exists = result.deletedCount > 0 || exists;
    }

    if (!exists) {
      return res.status(404).json({ message: 'Therapist not found.' });
    }

    if (index !== -1) {
      db.therapists.splice(index, 1);
    }

    res.status(200).json({ success: true, message: 'Therapist removed.' });
  } catch (error) {
    serverError(res, error);
  }
}

export async function getAdminNotifications(req, res) {
  try {
    if (isMongoConnected()) {
      const list = await AdminNotificationModel.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json(list);
    }

    const list = [...db.adminNotifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json(list);
  } catch (error) {
    serverError(res, error);
  }
}

export async function markAdminNotificationRead(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const result = await AdminNotificationModel.updateOne(
        { adminNotificationId: id },
        { $set: { isRead: true } }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Notification not found.' });
      }
    }

    const notif = db.adminNotifications.find(
      (n) => n.adminNotificationId === id || n.notificationId === id
    );
    if (notif) {
      notif.isRead = true;
    } else if (!isMongoConnected()) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    serverError(res, error);
  }
}

export async function broadcastNotification(req, res) {
  try {
    const { title, message, targetRole = 'all' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const notif = {
      adminNotificationId: `an_${Date.now()}`,
      title,
      message: `[Broadcast to ${targetRole}] ${title}: ${message}`,
      type: 'broadcast',
      targetRole,
      isRead: false,
    };

    if (isMongoConnected()) {
      await AdminNotificationModel.create(notif);

      const query = targetRole === 'all' ? {} : { role: targetRole };
      const targetUsers = await UserModel.find(query).lean();

      const userNotifications = targetUsers.map((u) => ({
        notificationId: `n_${Date.now()}_${u.userId}`,
        userId: u.userId,
        title,
        message: `${title}: ${message}`,
        type: 'system',
        isRead: false,
      }));

      if (userNotifications.length > 0) {
        await NotificationModel.insertMany(userNotifications);
      }

      return res.status(200).json({ success: true, message: 'Broadcast sent successfully.' });
    }

    db.adminNotifications.unshift(notif);
    const targetUsers = db.users.filter(
      (u) => targetRole === 'all' || u.role === targetRole
    );

    targetUsers.forEach((u) => {
      db.notifications.unshift({
        notificationId: `n_${Date.now()}_${u.userId}`,
        userId: u.userId,
        title,
        message: `${title}: ${message}`,
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    res.status(200).json({ success: true, message: 'Broadcast sent successfully.' });
  } catch (error) {
    serverError(res, error);
  }
}
