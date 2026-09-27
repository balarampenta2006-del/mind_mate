import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { EmergencyContactModel, SosAlertModel, UserModel } from '../models/index.js';
import { resolveReadUserId, resolveWriteUserId } from '../middleware/auth.js';

const UPDATABLE_FIELDS = ['name', 'phone', 'relation', 'isPrimary'];

export async function getEmergencyContacts(req, res) {
  try {
    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      const contacts = await EmergencyContactModel.find({ userId: targetUserId }).lean();
      return res.status(200).json(contacts);
    }

    const contacts = db.emergencyContacts.filter((c) => c.userId === targetUserId);
    res.status(200).json(contacts);
  } catch (error) {
    console.error('getEmergencyContacts error:', error);
    res.status(500).json({ message: 'Unable to load emergency contacts. Please try again.' });
  }
}

export async function addEmergencyContact(req, res) {
  try {
    const { name, relation, phone } = req.body;
    const targetUserId = resolveWriteUserId(req);

    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!name || !phone) {
      return res.status(400).json({ message: 'Contact name and phone number are required.' });
    }

    const contactId = `ec_${Date.now()}`;
    const contactObj = {
      contactId,
      userId: targetUserId,
      name,
      relation: relation || 'Contact',
      phone,
    };

    if (isMongoConnected()) {
      const doc = await EmergencyContactModel.create(contactObj);
      const resObj = doc.toObject();
      db.emergencyContacts.push(resObj);
      return res.status(201).json(resObj);
    }

    db.emergencyContacts.push(contactObj);
    res.status(201).json(contactObj);
  } catch (error) {
    console.error('addEmergencyContact error:', error);
    res.status(500).json({ message: 'Unable to add the contact. Please try again.' });
  }
}

export async function updateEmergencyContact(req, res) {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const updates = {};
    for (const key of UPDATABLE_FIELDS) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (isMongoConnected()) {
      const filter = isAdmin ? { contactId: id } : { contactId: id, userId: req.user?.userId };
      const doc = await EmergencyContactModel.findOneAndUpdate(filter, { $set: updates }, { new: true }).lean();

      if (!doc) {
        return res.status(404).json({ message: 'Emergency contact not found.' });
      }

      const cached = db.emergencyContacts.find((c) => c.contactId === id);
      if (cached && (isAdmin || cached.userId === req.user?.userId)) Object.assign(cached, updates);

      return res.status(200).json(doc);
    }

    const contact = db.emergencyContacts.find((c) => c.contactId === id);
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found.' });
    }
    if (!isAdmin && contact.userId !== req.user?.userId) {
      return res.status(403).json({ message: 'You do not have access to this contact.' });
    }

    Object.assign(contact, updates);
    res.status(200).json(contact);
  } catch (error) {
    console.error('updateEmergencyContact error:', error);
    res.status(500).json({ message: 'Unable to update the contact. Please try again.' });
  }
}

export async function deleteEmergencyContact(req, res) {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';

    if (isMongoConnected()) {
      const filter = isAdmin ? { contactId: id } : { contactId: id, userId: req.user?.userId };
      const result = await EmergencyContactModel.deleteOne(filter);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Emergency contact not found.' });
      }
      db.emergencyContacts = db.emergencyContacts.filter(
        (c) => !(c.contactId === id && (isAdmin || c.userId === req.user?.userId))
      );
      return res.status(200).json({ success: true, message: 'Emergency contact deleted successfully.' });
    }

    const contact = db.emergencyContacts.find((c) => c.contactId === id);
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found.' });
    }
    if (!isAdmin && contact.userId !== req.user?.userId) {
      return res.status(403).json({ message: 'You do not have access to this contact.' });
    }

    db.emergencyContacts = db.emergencyContacts.filter((c) => c.contactId !== id);
    res.status(200).json({ success: true, message: 'Emergency contact deleted successfully.' });
  } catch (error) {
    console.error('deleteEmergencyContact error:', error);
    res.status(500).json({ message: 'Unable to delete the contact. Please try again.' });
  }
}

/**
 * Public emergency view — only exposes data to callers presenting the
 * per-alert viewToken that is returned when the SOS alert is created.
 */
export async function getEmergencyView(req, res) {
  try {
    const { token } = req.query;

    let latestAlert = null;
    if (token) {
      if (isMongoConnected()) {
        latestAlert = await SosAlertModel.findOne({ viewToken: token }).lean();
      } else {
        latestAlert = db.sosAlerts.find((a) => a.viewToken === token) || null;
      }
    }

    if (!latestAlert) {
      return res.status(404).json({ message: 'Invalid or expired emergency view link.' });
    }

    let user = null;
    if (isMongoConnected()) {
      user = await UserModel.findOne({ userId: latestAlert.userId }).lean();
    } else {
      user = db.users.find((u) => u.userId === latestAlert.userId) || null;
    }

    res.status(200).json({
      userName: user ? user.name : 'Mind Mate User',
      sosMessage: latestAlert.message,
      sentAt: latestAlert.triggeredAt || latestAlert.createdAt || new Date().toISOString(),
      status: latestAlert.status,
      location:
        typeof latestAlert.location === 'object'
          ? latestAlert.location?.address || ''
          : latestAlert.location || '',
    });
  } catch (error) {
    console.error('getEmergencyView error:', error);
    res.status(500).json({ message: 'Unable to load the emergency view. Please try again.' });
  }
}
