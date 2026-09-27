import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import {
  BookingModel,
  TherapistModel,
  UserModel,
  AvailabilityModel,
  NotificationModel,
} from '../models/index.js';
import { resolveReadUserId, resolveWriteUserId } from '../middleware/auth.js';

async function enrichBooking(booking) {
  let therapist = null;
  let user = null;

  if (isMongoConnected()) {
    therapist = await TherapistModel.findOne({
      $or: [{ therapistId: booking.therapistId }, { userId: booking.therapistId }],
    }).lean();
    user = await UserModel.findOne({ userId: booking.userId }).select('userId name email').lean();
  }

  if (!therapist) {
    therapist = db.therapists.find((t) => t.therapistId === booking.therapistId || t.userId === booking.therapistId) || null;
  }
  if (!user) {
    const rawUser = db.users.find((u) => u.userId === booking.userId);
    user = rawUser ? { userId: rawUser.userId, name: rawUser.name, email: rawUser.email } : null;
  }

  return {
    ...booking,
    therapist,
    user,
  };
}

export async function getBookings(req, res) {
  try {
    // Therapists may list the sessions assigned to them.
    if (req.user?.role === 'therapist' && req.query.therapistId) {
      if (req.query.therapistId !== req.user.userId) {
        return res.status(403).json({ message: 'You can only view your own bookings.' });
      }
      const therapistId = req.query.therapistId;
      if (isMongoConnected()) {
        const bookings = await BookingModel.find({ therapistId }).sort({ createdAt: -1 }).lean();
        const enriched = await Promise.all(bookings.map(enrichBooking));
        return res.status(200).json(enriched);
      }
      const results = db.bookings.filter((b) => b.therapistId === therapistId);
      const enriched = await Promise.all(results.map(enrichBooking));
      return res.status(200).json(enriched);
    }

    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      const bookings = await BookingModel.find({ userId: targetUserId }).sort({ createdAt: -1 }).lean();
      const enriched = await Promise.all(bookings.map(enrichBooking));
      return res.status(200).json(enriched);
    }

    const results = db.bookings.filter((b) => b.userId === targetUserId);
    const enriched = await Promise.all(results.map(enrichBooking));
    res.status(200).json(enriched);
  } catch (error) {
    console.error('getBookings error:', error);
    res.status(500).json({ message: 'Unable to load bookings. Please try again.' });
  }
}

export async function getBookingById(req, res) {
  try {
    const { id } = req.params;

    let booking = null;
    if (isMongoConnected()) {
      booking = await BookingModel.findOne({ bookingId: id }).lean();
    } else {
      booking = db.bookings.find((b) => b.bookingId === id);
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const isOwner = booking.userId === req.user?.userId;
    const isTherapist = req.user?.role === 'therapist' && booking.therapistId === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isTherapist && !isAdmin) {
      return res.status(403).json({ message: 'You do not have access to this booking.' });
    }

    const enriched = await enrichBooking(booking);
    res.status(200).json(enriched);
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ message: 'Unable to load the booking. Please try again.' });
  }
}

export async function createBooking(req, res) {
  try {
    const { therapistId, date, time, notes } = req.body;
    const resolvedUserId = resolveWriteUserId(req);

    if (!resolvedUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!therapistId || !date || !time) {
      return res.status(400).json({ message: 'therapistId, date, and time are required.' });
    }

    const bookingId = `b_${Date.now()}`;
    const newBooking = {
      bookingId,
      userId: resolvedUserId,
      therapistId,
      date,
      time,
      status: 'Pending',
      notes: notes || '',
    };

    if (isMongoConnected()) {
      const bookingDoc = await BookingModel.create(newBooking);

      await AvailabilityModel.updateOne(
        { therapistId, date, startTime: time },
        { $set: { isBooked: true } }
      );

      const therapist = await TherapistModel.findOne({
        $or: [{ therapistId }, { userId: therapistId }],
      }).lean();

      await NotificationModel.create({
        notificationId: `n_${Date.now()}`,
        userId: resolvedUserId,
        title: 'Booking Submitted',
        message: `Your booking request for ${date} at ${time} with ${therapist ? therapist.name : 'your therapist'} has been submitted.`,
        type: 'booking',
        isRead: false,
      });

      const bookingObj = bookingDoc.toObject();
      db.bookings.unshift(bookingObj);
      const enriched = await enrichBooking(bookingObj);
      return res.status(201).json(enriched);
    }

    db.bookings.unshift(newBooking);

    const slot = db.availability.find(
      (s) => s.therapistId === therapistId && s.date === date && s.startTime === time
    );
    if (slot) {
      slot.isBooked = true;
    }

    const therapist = db.therapists.find((t) => t.therapistId === therapistId);
    db.notifications.unshift({
      notificationId: `n_${Date.now()}`,
      userId: resolvedUserId,
      title: 'Booking Submitted',
      message: `Your booking request for ${date} at ${time} with ${therapist ? therapist.name : 'your therapist'} has been submitted.`,
      type: 'booking',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    const enriched = await enrichBooking(newBooking);
    res.status(201).json(enriched);
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ message: 'Unable to create the booking. Please try again.' });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;

    let booking = null;
    if (isMongoConnected()) {
      booking = await BookingModel.findOne({ bookingId: id }).lean();
    } else {
      booking = db.bookings.find((b) => b.bookingId === id);
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const isOwner = booking.userId === req.user?.userId;
    const isTherapist = req.user?.role === 'therapist' && booking.therapistId === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isTherapist && !isAdmin) {
      return res.status(403).json({ message: 'You do not have access to this booking.' });
    }

    if (isMongoConnected()) {
      const updated = await BookingModel.findOneAndUpdate(
        { bookingId: id },
        { $set: { status: 'Cancelled' } },
        { new: true }
      ).lean();

      await AvailabilityModel.updateOne(
        { therapistId: booking.therapistId, date: booking.date, startTime: booking.time },
        { $set: { isBooked: false } }
      );

      const enriched = await enrichBooking(updated);
      return res.status(200).json(enriched);
    }

    booking.status = 'Cancelled';

    const slot = db.availability.find(
      (s) => s.therapistId === booking.therapistId && s.date === booking.date && s.startTime === booking.time
    );
    if (slot) {
      slot.isBooked = false;
    }

    const enriched = await enrichBooking(booking);
    res.status(200).json(enriched);
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ message: 'Unable to cancel the booking. Please try again.' });
  }
}

export async function getAllAdminBookings(req, res) {
  try {
    if (isMongoConnected()) {
      const bookings = await BookingModel.find({}).sort({ createdAt: -1 }).lean();
      const enriched = await Promise.all(bookings.map(enrichBooking));
      return res.status(200).json(enriched);
    }
    const enriched = await Promise.all(db.bookings.map(enrichBooking));
    res.status(200).json(enriched);
  } catch (error) {
    console.error('getAllAdminBookings error:', error);
    res.status(500).json({ message: 'Unable to load bookings. Please try again.' });
  }
}
