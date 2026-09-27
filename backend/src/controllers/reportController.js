import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { ReportModel, MoodModel } from '../models/index.js';
import { resolveReadUserId, resolveWriteUserId } from '../middleware/auth.js';

/** Build the `data` payload the frontend renders (insights/averages/trend). */
function buildReportData(userMoods, avgLevel) {
  const trend = userMoods
    .slice()
    .reverse()
    .map((m) => ({
      date: m.date || m.createdAt || '',
      moodLevel: m.moodLevel || m.intensity || 5,
      moodType: m.moodType || m.mood || 'Calm',
    }));

  const counts = {};
  for (const m of userMoods) {
    const type = m.moodType || m.mood || 'Neutral';
    counts[type] = (counts[type] || 0) + 1;
  }
  const mostFrequentMood =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Calm';

  const insights = [];
  if (userMoods.length === 0) {
    insights.push('No mood entries were recorded for this period. Start logging moods to unlock insights.');
  } else {
    insights.push(
      `Your average mood across ${userMoods.length} entries was ${avgLevel}/10 this period.`
    );
    insights.push(`Most frequently logged mood: ${mostFrequentMood}.`);
    const first = trend[0]?.moodLevel;
    const last = trend[trend.length - 1]?.moodLevel;
    if (first != null && last != null) {
      insights.push(
        last > first
          ? 'Your mood trend is moving upward over the period — keep up the good habits.'
          : last < first
            ? 'Your mood trend dipped over the period — consider extra rest and support.'
            : 'Your mood stayed steady across the period.'
      );
    }
  }

  return {
    trend,
    averageMoodLevel: avgLevel,
    mostFrequentMood,
    insights,
  };
}

function canViewReport(req, report) {
  if (req.user?.role === 'admin' || req.user?.role === 'therapist') return true;
  return report.userId === req.user?.userId;
}

export async function getReports(req, res) {
  try {
    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      const results = await ReportModel.find({ userId: targetUserId })
        .sort({ generatedAt: -1 })
        .lean();
      return res.status(200).json(results);
    }

    const results = db.reports.filter((r) => r.userId === targetUserId);
    res.status(200).json(results);
  } catch (error) {
    console.error('getReports error:', error);
    res.status(500).json({ message: 'Unable to load reports. Please try again.' });
  }
}

export async function getReportById(req, res) {
  try {
    const { id } = req.params;

    let report = null;
    if (isMongoConnected()) {
      report = await ReportModel.findOne({ reportId: id }).lean();
    } else {
      report = db.reports.find((r) => r.reportId === id);
    }

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    if (!canViewReport(req, report)) {
      return res.status(403).json({ message: 'You do not have access to this report.' });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('getReportById error:', error);
    res.status(500).json({ message: 'Unable to load the report. Please try again.' });
  }
}

export async function generateReport(req, res) {
  try {
    const { period = '30d' } = req.body;
    const targetUserId = resolveWriteUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

    let userMoods = [];
    if (isMongoConnected()) {
      userMoods = await MoodModel.find({ userId: targetUserId })
        .sort({ date: -1 })
        .limit(days)
        .lean();
    } else {
      userMoods = db.moods
        .filter((m) => m.userId === targetUserId)
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, days);
    }

    const avgLevel = userMoods.length
      ? Number((userMoods.reduce((acc, m) => acc + (m.moodLevel || m.intensity || 5), 0) / userMoods.length).toFixed(1))
      : 0;

    const data = buildReportData(userMoods, avgLevel);
    const label = period === '7d' ? 'Last 7 Days' : period === '90d' ? 'Last 90 Days' : 'Last 30 Days';

    const newReport = {
      reportId: `rep_${Date.now()}`,
      userId: targetUserId,
      type: 'mood',
      period,
      summary: `${label} Mental Health & Mood Analytics (Average: ${avgLevel}/10)`,
      data: { ...data, period, label },
      moodSummary: {
        averageMoodLevel: avgLevel,
        totalEntries: userMoods.length,
        mostFrequentMood: data.mostFrequentMood,
      },
      recommendations: data.insights,
      generatedAt: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      const doc = await ReportModel.create(newReport);
      const obj = doc.toObject();
      db.reports.unshift(obj);
      return res.status(201).json(obj);
    }

    db.reports.unshift(newReport);
    res.status(201).json(newReport);
  } catch (error) {
    console.error('generateReport error:', error);
    res.status(500).json({ message: 'Unable to generate the report. Please try again.' });
  }
}

export async function getTherapistPatientReports(req, res) {
  try {
    const { userId } = req.params;

    if (isMongoConnected()) {
      const reports = await ReportModel.find({ userId }).sort({ generatedAt: -1 }).lean();
      return res.status(200).json(reports);
    }

    const reports = db.reports.filter((r) => r.userId === userId);
    res.status(200).json(reports);
  } catch (error) {
    console.error('getTherapistPatientReports error:', error);
    res.status(500).json({ message: 'Unable to load patient reports. Please try again.' });
  }
}
