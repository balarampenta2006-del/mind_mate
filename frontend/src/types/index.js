/**
 * @fileoverview Shared JSDoc type definitions for the Mind Mate application.
 * Used for IDE autocompletion and documentation only (no runtime effect).
 */

// ─── Domain entities ──────────────────────────────────────────────────────────

/**
 * @typedef {Object} User
 * @property {string}  userId
 * @property {string}  name
 * @property {string}  email
 * @property {string}  phone
 * @property {string}  dob        - ISO date string (YYYY-MM-DD)
 * @property {string}  role       - 'user' | 'therapist' | 'admin'
 * @property {boolean} isActive
 * @property {string}  createdAt  - ISO datetime
 */

/**
 * @typedef {Object} Mood
 * @property {string} moodId
 * @property {string} userId
 * @property {string} moodType    - MoodType enum value
 * @property {number} moodLevel   - 1–10
 * @property {string} [note]
 * @property {string} date        - ISO date string (YYYY-MM-DD)
 */

/**
 * @typedef {Object} AIChat
 * @property {string} chatId
 * @property {string} userId
 * @property {string} message
 * @property {string} reply
 * @property {string} [emotion]   - detected emotion tag
 * @property {string} dateTime    - ISO datetime
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} recId
 * @property {string} userId
 * @property {string} type        - 'meditation' | 'exercise' | 'journaling'
 * @property {string} title
 * @property {string} description
 * @property {string} date        - ISO date string
 */

/**
 * @typedef {Object} Therapist
 * @property {string}  therapistId
 * @property {string}  name
 * @property {string}  specialization
 * @property {number}  experience  - years
 * @property {string}  email
 * @property {string}  phone
 * @property {boolean} isActive
 * @property {string}  [bio]
 * @property {AvailabilitySlot[]} [availability]
 */

/**
 * @typedef {Object} AvailabilitySlot
 * @property {string}  slotId
 * @property {string}  therapistId
 * @property {string}  date        - ISO date string
 * @property {string}  startTime   - HH:mm
 * @property {string}  endTime     - HH:mm
 * @property {boolean} isBooked
 */

/**
 * @typedef {Object} TherapistBooking
 * @property {string}     bookingId
 * @property {string}     userId
 * @property {string}     therapistId
 * @property {string}     date        - ISO date string
 * @property {string}     time        - HH:mm
 * @property {string}     status      - BookingStatus enum
 * @property {string}     [notes]
 * @property {Therapist}  [therapist] - enriched client-side
 */

/**
 * @typedef {Object} Meditation
 * @property {string} meditationId
 * @property {string} title
 * @property {string} description
 * @property {number} duration     - minutes
 * @property {string} category     - MeditationCategory enum
 * @property {string} [audioUrl]
 */

/**
 * @typedef {Object} Report
 * @property {string} reportId
 * @property {string} userId
 * @property {string} type         - ReportType enum
 * @property {ReportData} data
 * @property {string} generatedAt  - ISO datetime
 * @property {string} [period]     - '7d' | '30d' | '90d'
 */

/**
 * @typedef {Object} ReportData
 * @property {string}  period
 * @property {string}  label
 * @property {Array<{date:string, moodLevel:number, moodType:string}>} trend
 * @property {number}  averageMoodLevel
 * @property {string}  mostFrequentMood
 * @property {string[]} insights
 */

/**
 * @typedef {Object} SOS
 * @property {string} sosId
 * @property {string} userId
 * @property {string} message
 * @property {string} [location]
 * @property {string} sentAt       - ISO datetime
 * @property {string} status       - SOSStatus enum
 */

/**
 * @typedef {Object} EmergencyContact
 * @property {string} contactId
 * @property {string} userId
 * @property {string} name
 * @property {string} relation
 * @property {string} phone
 */

/**
 * @typedef {Object} Notification
 * @property {string}  notificationId
 * @property {string}  userId
 * @property {string}  message
 * @property {string}  type        - NotificationType enum
 * @property {boolean} isRead
 * @property {string}  createdAt   - ISO datetime
 */

// ─── API response wrappers ────────────────────────────────────────────────────

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {T}      data
 * @property {string} [message]
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {T[]}   data
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User}   user
 * @property {string} token
 */

/**
 * @typedef {Object} AdminStats
 * @property {number} totalUsers
 * @property {number} activeUsers
 * @property {number} totalTherapists
 * @property {number} activeTherapists
 * @property {number} totalBookings
 * @property {number} pendingBookings
 * @property {number} moodLogs
 * @property {number} sosAlerts
 */

/**
 * @typedef {Object} AdminUserDetail
 * @property {User}              user
 * @property {TherapistBooking[]} bookings
 * @property {Mood[]}            recentMoods
 */

/**
 * @typedef {Object} AdminTherapistDetail
 * @property {Therapist}         therapist
 * @property {TherapistBooking[]} bookings
 * @property {User[]}            patients
 */

/**
 * @typedef {Object} MoodTrendPoint
 * @property {string} date
 * @property {number} level
 * @property {string} type
 */

/**
 * @typedef {Object} EmergencyView
 * @property {string} userName
 * @property {string} sosMessage
 * @property {string} sentAt
 * @property {string} status
 */

/**
 * @typedef {Object} TherapistMessage
 * @property {string}  msgId
 * @property {boolean} fromTherapist
 * @property {string}  text
 * @property {string}  dateTime
 */
