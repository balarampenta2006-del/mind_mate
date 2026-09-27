import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { TherapistModel, AvailabilityModel, UserModel } from '../models/index.js';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isOwnerOrAdmin(req, therapistId) {
  if (req.user?.role === 'admin') return true;
  return req.user?.role === 'therapist' && req.user?.userId === therapistId;
}

export async function getTherapists(req, res) {
  try {
    const { search, specialization } = req.query;

    if (isMongoConnected()) {
      const query = { isActive: true };
      if (specialization) {
        query.specialization = new RegExp(escapeRegex(specialization), 'i');
      }
      if (search) {
        const q = new RegExp(escapeRegex(search), 'i');
        query.$or = [{ name: q }, { specialization: q }, { email: q }];
      }
      const result = await TherapistModel.find(query).lean();
      return res.status(200).json(result);
    }

    let result = db.therapists.filter((t) => t.isActive);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.specialization && t.specialization.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q))
      );
    }

    if (specialization) {
      result = result.filter(
        (t) => t.specialization && t.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('getTherapists error:', error);
    res.status(500).json({ message: 'Unable to load therapists. Please try again.' });
  }
}

export async function getTherapistById(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const therapist = await TherapistModel.findOne({
        $or: [{ therapistId: id }, { userId: id }],
      }).lean();

      if (!therapist) {
        return res.status(404).json({ message: 'Therapist not found.' });
      }

      const availability = await AvailabilityModel.find({ therapistId: therapist.therapistId }).lean();
      return res.status(200).json({
        ...therapist,
        availability,
      });
    }

    const therapist = db.therapists.find((t) => t.therapistId === id || t.userId === id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found.' });
    }

    const availability = db.availability.filter((s) => s.therapistId === therapist.therapistId);
    res.status(200).json({
      ...therapist,
      availability,
    });
  } catch (error) {
    console.error('getTherapistById error:', error);
    res.status(500).json({ message: 'Unable to load the therapist. Please try again.' });
  }
}

export async function getTherapistAvailability(req, res) {
  try {
    const { id } = req.params;
    // Owners (and admins) see every slot including booked ones;
    // patients only ever see free slots.
    const seeAll = isOwnerOrAdmin(req, id);
    const filter = seeAll ? { therapistId: id } : { therapistId: id, isBooked: false };

    if (isMongoConnected()) {
      const slots = await AvailabilityModel.find(filter).lean();
      return res.status(200).json(slots);
    }

    const slots = db.availability.filter(
      (s) => s.therapistId === id && (seeAll || !s.isBooked)
    );
    res.status(200).json(slots);
  } catch (error) {
    console.error('getTherapistAvailability error:', error);
    res.status(500).json({ message: 'Unable to load availability. Please try again.' });
  }
}

export async function addAvailabilitySlot(req, res) {
  try {
    const { therapistId, date, startTime, endTime } = req.body;

    if (!therapistId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'therapistId, date, startTime, and endTime are required.' });
    }
    if (!isOwnerOrAdmin(req, therapistId)) {
      return res.status(403).json({ message: 'You can only manage your own availability.' });
    }

    const slotId = `s_${Date.now()}`;
    const slot = {
      slotId,
      therapistId,
      date,
      startTime,
      endTime,
      isBooked: false,
    };

    if (isMongoConnected()) {
      const doc = await AvailabilityModel.create(slot);
      const resObj = doc.toObject();
      db.availability.push(resObj);
      return res.status(201).json(resObj);
    }

    db.availability.push(slot);
    res.status(201).json(slot);
  } catch (error) {
    console.error('addAvailabilitySlot error:', error);
    res.status(500).json({ message: 'Unable to add the slot. Please try again.' });
  }
}

export async function removeAvailabilitySlot(req, res) {
  try {
    const { slotId } = req.params;

    let slot = null;
    if (isMongoConnected()) {
      slot = await AvailabilityModel.findOne({ slotId }).lean();
    } else {
      slot = db.availability.find((s) => s.slotId === slotId) || null;
    }

    if (!slot) {
      return res.status(404).json({ message: 'Availability slot not found.' });
    }
    if (!isOwnerOrAdmin(req, slot.therapistId)) {
      return res.status(403).json({ message: 'You can only manage your own availability.' });
    }

    if (isMongoConnected()) {
      await AvailabilityModel.deleteOne({ slotId });
    }

    const index = db.availability.findIndex((s) => s.slotId === slotId);
    if (index !== -1) {
      db.availability.splice(index, 1);
    }

    res.status(200).json({ success: true, message: 'Slot removed successfully.' });
  } catch (error) {
    console.error('removeAvailabilitySlot error:', error);
    res.status(500).json({ message: 'Unable to remove the slot. Please try again.' });
  }
}

const PROFILE_FIELDS = ['name', 'phone', 'bio', 'specialization', 'experience', 'languages', 'avatar', 'sessionFee'];

/**
 * Therapist self-service profile update (PUT /therapists/:id/profile).
 * The authenticated therapist may only update their own record.
 */
export async function updateTherapistProfile(req, res) {
  try {
    const { id } = req.params;
    if (!isOwnerOrAdmin(req, id)) {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    const updates = {};
    for (const key of PROFILE_FIELDS) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid profile fields to update.' });
    }

    if (isMongoConnected()) {
      const doc = await TherapistModel.findOneAndUpdate(
        { $or: [{ therapistId: id }, { userId: id }] },
        { $set: updates },
        { new: true }
      ).lean();

      if (!doc) {
        return res.status(404).json({ message: 'Therapist not found.' });
      }

      // Mirror the shared fields (name/phone) onto the login user record.
      const userUpdates = {};
      if (updates.name !== undefined) userUpdates.name = updates.name;
      if (updates.phone !== undefined) userUpdates.phone = updates.phone;
      if (Object.keys(userUpdates).length > 0) {
        await UserModel.updateOne({ userId: id }, { $set: userUpdates });
        const cachedUser = db.users.find((u) => u.userId === id);
        if (cachedUser) Object.assign(cachedUser, userUpdates);
      }

      const cached = db.therapists.find((t) => t.therapistId === doc.therapistId);
      if (cached) Object.assign(cached, updates);

      return res.status(200).json(doc);
    }

    const therapist = db.therapists.find((t) => t.therapistId === id || t.userId === id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found.' });
    }

    Object.assign(therapist, updates);

    const user = db.users.find((u) => u.userId === id);
    if (user) {
      if (updates.name !== undefined) user.name = updates.name;
      if (updates.phone !== undefined) user.phone = updates.phone;
    }

    res.status(200).json(therapist);
  } catch (error) {
    console.error('updateTherapistProfile error:', error);
    res.status(500).json({ message: 'Unable to update the profile. Please try again.' });
  }
}
