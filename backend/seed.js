import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Doctor from "./models/DoctorSchema.js";
import User from "./models/UserSchema.js";
import Booking from "./models/BookingSchema.js";
import Review from "./models/ReviewSchema.js";
import Contact from "./models/ContactSchema.js";
import Notification from "./models/NotificationSchema.js";

dotenv.config();

const PASSWORD = "Password123!";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

const adminSeeds = [
  { email: "admin@hospital.test", name: "Ava Admin" },
  { email: "superadmin@hospital.test", name: "Sam Superadmin" },
];

// Hand-authored doctors covering each approval status, used for admin-workflow testing.
const namedDoctorSeeds = [
  {
    email: "dr.morgan@example.com",
    name: "Dr. Alex Morgan",
    phone: 5550101,
    ticketPrice: 550,
    gender: "male",
    specialization: "General Practitioner",
    qualifications: [
      { degree: "MBBS", university: "State Medical University", startingDate: "2008", endingDate: "2014" },
    ],
    experiences: [
      { position: "Remote Care Physician", university: "Independent Practice", startingDate: "2016", endingDate: "Present" },
    ],
    bio: "Primary care over video, available worldwide.",
    about:
      "Dr. Morgan provides general primary care through secure video visits, helping patients manage everyday health concerns from wherever they are.",
    timeSlots: [
      { day: "monday", startingTime: "09:00", endingTime: "13:00" },
      { day: "wednesday", startingTime: "09:00", endingTime: "13:00" },
    ],
    isApproved: "approved",
  },
  {
    email: "dr.chen@example.com",
    name: "Dr. Sam Chen",
    phone: 5550102,
    ticketPrice: 800,
    gender: "male",
    specialization: "Neurologist",
    qualifications: [
      { degree: "MD, Neurology", university: "Metro Health Institute", startingDate: "2007", endingDate: "2013" },
    ],
    experiences: [
      { position: "Consulting Neurologist", university: "Remote Neurology Network", startingDate: "2015", endingDate: "Present" },
    ],
    bio: "Neurology consultations delivered remotely.",
    about:
      "Dr. Chen consults on neurological conditions through video appointments, offering follow-up and second-opinion care without requiring travel.",
    timeSlots: [
      { day: "tuesday", startingTime: "10:00", endingTime: "15:00" },
      { day: "thursday", startingTime: "10:00", endingTime: "15:00" },
    ],
    isApproved: "approved",
  },
  {
    email: "dr.patel@example.com",
    name: "Dr. Riya Patel",
    phone: 5550103,
    ticketPrice: 650,
    gender: "female",
    specialization: "Dermatologist",
    qualifications: [
      { degree: "MD, Dermatology", university: "Coastal Medical School", startingDate: "2010", endingDate: "2016" },
    ],
    experiences: [
      { position: "Teledermatology Specialist", university: "Virtual Skin Clinic", startingDate: "2018", endingDate: "Present" },
    ],
    bio: "Skin consultations from your own home.",
    about:
      "Dr. Patel reviews skin concerns through photos and video calls, providing diagnosis and treatment plans entirely online.",
    timeSlots: [
      { day: "monday", startingTime: "14:00", endingTime: "18:00" },
      { day: "friday", startingTime: "09:00", endingTime: "12:00" },
    ],
    isApproved: "approved",
  },
  {
    email: "dr.nguyen@example.com",
    name: "Dr. Jordan Nguyen",
    phone: 5550104,
    ticketPrice: 700,
    gender: "other",
    specialization: "Mental Health Counselor",
    qualifications: [
      { degree: "PsyD, Clinical Psychology", university: "Open Sky University", startingDate: "2012", endingDate: "2018" },
    ],
    experiences: [
      { position: "Licensed Counselor", university: "Remote Wellness Collective", startingDate: "2019", endingDate: "Present" },
    ],
    bio: "Confidential counseling sessions, online only.",
    about:
      "Dr. Nguyen offers individual counseling sessions over secure video, supporting patients anywhere with a stable connection.",
    timeSlots: [
      { day: "wednesday", startingTime: "13:00", endingTime: "17:00" },
      { day: "friday", startingTime: "13:00", endingTime: "17:00" },
    ],
    isApproved: "approved",
  },
  {
    email: "dr.oconnor@example.com",
    name: "Dr. Casey O'Connor",
    phone: 5550105,
    ticketPrice: 600,
    gender: "female",
    specialization: "Pediatrician",
    qualifications: [
      { degree: "MD, Pediatrics", university: "Lakeside Medical College", startingDate: "2011", endingDate: "2017" },
    ],
    experiences: [
      { position: "Telepediatrics Specialist", university: "Family Virtual Clinic", startingDate: "2020", endingDate: "Present" },
    ],
    bio: "Awaiting admin approval.",
    about: "Dr. O'Connor recently applied to join the platform and is pending review.",
    timeSlots: [{ day: "tuesday", startingTime: "09:00", endingTime: "12:00" }],
    isApproved: "pending",
  },
  {
    email: "dr.silva@example.com",
    name: "Dr. Marco Silva",
    phone: 5550106,
    ticketPrice: 500,
    gender: "male",
    specialization: "Nutritionist",
    qualifications: [
      { degree: "MSc, Clinical Nutrition", university: "Green Valley University", startingDate: "2015", endingDate: "2019" },
    ],
    experiences: [
      { position: "Remote Nutrition Coach", university: "Healthy Habits Network", startingDate: "2021", endingDate: "Present" },
    ],
    bio: "New applicant, still pending review.",
    about: "Dr. Silva is a recent applicant awaiting the admin approval workflow.",
    timeSlots: [{ day: "thursday", startingTime: "08:00", endingTime: "11:00" }],
    isApproved: "pending",
  },
  {
    email: "dr.rejected@example.com",
    name: "Dr. Ray Jected",
    phone: 5550107,
    ticketPrice: 500,
    gender: "male",
    specialization: "General Practitioner",
    qualifications: [{ degree: "MBBS", university: "Unverified University", startingDate: "2019", endingDate: "2020" }],
    experiences: [],
    bio: "Application rejected during credential review.",
    about: "This application was rejected because credentials could not be verified.",
    timeSlots: [],
    isApproved: "rejected",
  },
  {
    email: "dr.suspended@example.com",
    name: "Dr. Suzy Suspended",
    phone: 5550108,
    ticketPrice: 1000,
    gender: "female",
    specialization: "Cardiologist",
    qualifications: [
      { degree: "MD, Cardiology", university: "Riverside Medical University", startingDate: "2005", endingDate: "2011" },
    ],
    experiences: [
      { position: "Cardiology Consultant", university: "Heartcare Virtual Clinic", startingDate: "2013", endingDate: "Present" },
    ],
    bio: "Account currently suspended by admin.",
    about: "Previously approved, this account was suspended pending a compliance review.",
    timeSlots: [{ day: "monday", startingTime: "10:00", endingTime: "12:00" }],
    isApproved: "suspended",
  },
];

// ---- Randomly generated approved doctors, 3-5 per service specialization ----

const FIRST_NAMES = [
  "James", "Maria", "Wei", "Fatima", "Liam", "Sofia", "Noah", "Amara",
  "Lucas", "Priya", "Ethan", "Elena", "Omar", "Grace", "Daniel", "Ines",
  "Kenji", "Zara", "Mateo", "Nina",
];
const LAST_NAMES = [
  "Whitfield", "Alvarez", "Zhang", "Haddad", "Bennett", "Rossi", "Carter",
  "Okafor", "Reyes", "Sharma", "Cole", "Petrova", "Farouk", "Bishop",
  "Kowalski", "Duarte", "Tanaka", "Novak", "Herrera", "Lindqvist",
];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const SPEC_CONFIG = {
  "General Practitioner": {
    degree: "MBBS",
    universities: ["State Medical University", "Lakeview School of Medicine", "Harborview Medical College"],
    positions: ["Primary Care Physician", "Family Medicine Physician", "General Practitioner"],
    hospitals: ["Independent Practice", "Community Health Partners", "Riverside Family Clinic"],
    bios: [
      "Everyday care, entirely over video.",
      "Family medicine, no waiting rooms.",
      "Checkups and prescriptions online.",
    ],
  },
  Neurologist: {
    degree: "MD, Neurology",
    universities: ["Metro Health Institute", "Northfield Medical University", "Crestwood School of Medicine"],
    positions: ["Consulting Neurologist", "Neurology Specialist", "Teleneurology Physician"],
    hospitals: ["Remote Neurology Network", "Crestwood Neuro Center", "Northfield Brain Clinic"],
    bios: [
      "Neurology consultations, fully remote.",
      "Follow-ups and second opinions online.",
      "Video visits for neurological care.",
    ],
  },
  Dermatologist: {
    degree: "MD, Dermatology",
    universities: ["Coastal Medical School", "Bayview University", "Summit School of Medicine"],
    positions: ["Teledermatology Specialist", "Consulting Dermatologist", "Skin Care Physician"],
    hospitals: ["Virtual Skin Clinic", "Bayview Dermatology Group", "Summit Skin Care"],
    bios: [
      "Skin consultations from home.",
      "Photo-based dermatology, done right.",
      "Diagnosis and care plans online.",
    ],
  },
  "Mental Health Counselor": {
    degree: "PsyD, Clinical Psychology",
    universities: ["Open Sky University", "Harmony Graduate School", "Clearwater University"],
    positions: ["Licensed Counselor", "Clinical Therapist", "Mental Health Counselor"],
    hospitals: ["Remote Wellness Collective", "Harmony Counseling Group", "Clearwater Mind Clinic"],
    bios: [
      "Confidential counseling, online only.",
      "Therapy sessions on your schedule.",
      "Support wherever you're connected.",
    ],
  },
  Pediatrician: {
    degree: "MD, Pediatrics",
    universities: ["Lakeside Medical College", "Willow Creek University", "Brightside School of Medicine"],
    positions: ["Telepediatrics Specialist", "Consulting Pediatrician", "Child Health Physician"],
    hospitals: ["Family Virtual Clinic", "Willow Creek Children's Clinic", "Brightside Pediatric Care"],
    bios: [
      "Child checkups over video.",
      "Pediatric care, family-friendly.",
      "Kid-focused visits from home.",
    ],
  },
  Nutritionist: {
    degree: "MSc, Clinical Nutrition",
    universities: ["Green Valley University", "Meadowbrook College", "Fairhaven University"],
    positions: ["Remote Nutrition Coach", "Clinical Nutritionist", "Dietary Consultant"],
    hospitals: ["Healthy Habits Network", "Meadowbrook Nutrition Clinic", "Fairhaven Wellness Center"],
    bios: [
      "Nutrition guidance, video-based.",
      "Personalized meal plans online.",
      "Ongoing dietary check-ins.",
    ],
  },
  "Chronic Care Specialist": {
    degree: "MD, Internal Medicine",
    universities: ["Riverside Medical University", "Pinecrest School of Medicine", "Stonebridge University"],
    positions: ["Chronic Care Physician", "Internal Medicine Specialist", "Long-Term Care Consultant"],
    hospitals: ["Pinecrest Chronic Care Center", "Stonebridge Internal Medicine", "Riverside Ongoing Care Clinic"],
    bios: [
      "Long-term condition management.",
      "Regular remote check-ins, ongoing care.",
      "Chronic care, consistent and remote.",
    ],
  },
};

let phoneCounter = 5550300;
function nextPhone() {
  return phoneCounter++;
}

let doctorSeqNumber = 0;
function buildGeneratedDoctor(specialization) {
  const config = SPEC_CONFIG[specialization];
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const name = `Dr. ${first} ${last}`;
  const gender = pick(["male", "female", "other"]);
  const experienceYears = randomInt(5, 10);
  const currentYear = new Date().getFullYear();
  const eduEndYear = currentYear - experienceYears - randomInt(1, 3);
  const eduStartYear = eduEndYear - 6;

  const dayChoices = shuffle(DAYS).slice(0, 2);
  const startHour = randomInt(8, 15);
  const timeSlots = dayChoices.map((day) => ({
    day,
    startingTime: `${pad(startHour)}:00`,
    endingTime: `${pad(startHour + 4)}:00`,
  }));

  doctorSeqNumber += 1;

  return {
    email: `dr.${first.toLowerCase()}.${last.toLowerCase()}${doctorSeqNumber}@example.com`,
    name,
    phone: nextPhone(),
    ticketPrice: randomInt(500, 1000),
    gender,
    specialization,
    qualifications: [
      {
        degree: config.degree,
        university: pick(config.universities),
        startingDate: String(eduStartYear),
        endingDate: String(eduEndYear),
      },
    ],
    experiences: [
      {
        position: pick(config.positions),
        university: pick(config.hospitals),
        startingDate: String(currentYear - experienceYears),
        endingDate: "Present",
      },
    ],
    bio: pick(config.bios),
    about: `${name} provides ${specialization.toLowerCase()} care through secure video visits, drawing on ${experienceYears} years of clinical experience.`,
    timeSlots,
    isApproved: "approved",
  };
}

// Specializations that already have one hand-authored approved doctor above.
const FLAGSHIP_COUNTS = {
  "General Practitioner": 1,
  Neurologist: 1,
  Dermatologist: 1,
  "Mental Health Counselor": 1,
};

const ALL_SERVICE_SPECIALIZATIONS = [
  "General Practitioner",
  "Mental Health Counselor",
  "Dermatologist",
  "Neurologist",
  "Nutritionist",
  "Chronic Care Specialist",
  "Pediatrician",
];

const generatedDoctorSeeds = [];
for (const specialization of ALL_SERVICE_SPECIALIZATIONS) {
  const target = randomInt(3, 5);
  const already = FLAGSHIP_COUNTS[specialization] || 0;
  const toGenerate = Math.max(0, target - already);
  for (let i = 0; i < toGenerate; i++) {
    generatedDoctorSeeds.push(buildGeneratedDoctor(specialization));
  }
}

const doctorSeeds = [...namedDoctorSeeds, ...generatedDoctorSeeds];

const patientSeeds = [
  { email: "jamie.lee@example.com", name: "Jamie Lee", phone: 5550201, gender: "female", bloodType: "O+" },
  { email: "taylor.brooks@example.com", name: "Taylor Brooks", phone: 5550202, gender: "male", bloodType: "A-" },
  { email: "casey.kim@example.com", name: "Casey Kim", phone: 5550203, gender: "other", bloodType: "B+" },
  { email: "morgan.diaz@example.com", name: "Morgan Diaz", phone: 5550204, gender: "female", bloodType: "AB+" },
  { email: "riley.stone@example.com", name: "Riley Stone", phone: 5550205, gender: "male", bloodType: "O-" },
  { email: "suspended.patient@example.com", name: "Suspended Patient", phone: 5550206, gender: "other", bloodType: "A+", isActive: false },
];

const reviewTexts = [
  "Easy to book and the video call quality was great.",
  "Felt heard during the consultation, would book again.",
  "Quick, convenient, and no need to leave home.",
  "Clear explanations and a solid follow-up plan.",
  "Professional and punctual, highly recommend.",
  "Made a stressful visit feel simple and calm.",
];

const contactSeeds = [
  { email: "jamie.lee@example.com", subject: "Trouble uploading photo", message: "The photo upload button doesn't seem to respond on Safari." },
  { email: "taylor.brooks@example.com", subject: "Billing question", message: "Can I get a receipt for my last appointment?" },
  { email: "prospective.doctor@example.com", subject: "How do I apply as a doctor?", message: "I'd like to know the credential requirements before registering." },
];

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function pastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function dateOnly(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toEndTime(startTime, minutes = 30) {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const eh = Math.floor(total / 60).toString().padStart(2, "0");
  const em = (total % 60).toString().padStart(2, "0");
  return `${eh}:${em}`;
}

const NOTIFY_TYPES = {
  confirmed: "booking_confirmed",
  rejected: "booking_rejected",
  cancelled: "booking_cancelled",
  completed: "booking_completed",
  "no-show": "booking_no_show",
};

const NOTIFY_MESSAGES = {
  confirmed: "Your appointment has been confirmed.",
  rejected: "Your appointment request was declined.",
  cancelled: "Your appointment has been cancelled.",
  completed: "Your appointment has been marked completed.",
  "no-show": "You were marked as a no-show for your appointment.",
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected");

  await Promise.all([
    Doctor.deleteMany({}),
    User.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Contact.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log("Cleared existing Doctor/User/Booking/Review/Contact/Notification data");

  const hashedPassword = await bcrypt.hash(PASSWORD, await bcrypt.genSalt(10));

  const admins = await User.insertMany(
    adminSeeds.map((a) => ({
      ...a,
      password: hashedPassword,
      role: "admin",
    }))
  );

  const doctors = await Doctor.insertMany(
    doctorSeeds.map((d) => ({
      ...d,
      password: hashedPassword,
      role: "doctor",
    }))
  );

  const patients = await User.insertMany(
    patientSeeds.map((p) => ({
      ...p,
      password: hashedPassword,
      role: "patient",
    }))
  );

  const approvedDoctors = doctors.filter((d) => d.isApproved === "approved");

  const bookings = [];

  // One "happening today" confirmed booking so doctor dashboard "today's appointments" has data.
  const todayDoctor = approvedDoctors[0];
  const todaySlot = todayDoctor.timeSlots[0];
  bookings.push({
    doctor: todayDoctor._id,
    user: patients[0]._id,
    ticketPrice: String(todayDoctor.ticketPrice),
    appointmentDate: dateOnly(new Date()),
    startTime: todaySlot.startingTime,
    endTime: toEndTime(todaySlot.startingTime),
    status: "confirmed",
    paymentStatus: "paid",
    consultationType: "video",
  });

  // Spread of pending / confirmed / cancelled / rejected / no-show across patients & doctors.
  const variedStatuses = ["pending", "confirmed", "cancelled", "rejected", "no-show"];
  for (let i = 0; i < patients.length; i++) {
    const doctor = approvedDoctors[i % approvedDoctors.length];
    const slot = doctor.timeSlots[i % doctor.timeSlots.length];
    const status = variedStatuses[i % variedStatuses.length];
    const isPast = status === "no-show" || status === "rejected";
    bookings.push({
      doctor: doctor._id,
      user: patients[i]._id,
      ticketPrice: String(doctor.ticketPrice),
      appointmentDate: dateOnly(isPast ? pastDate(5 + i * 3) : futureDate(3 + i * 4)),
      startTime: slot.startingTime,
      endTime: toEndTime(slot.startingTime),
      status,
      paymentStatus: status === "confirmed" ? "paid" : "unpaid",
      consultationType: status === "confirmed" ? "video" : "clinic",
      cancellationReason:
        status === "cancelled"
          ? "Patient requested to cancel."
          : status === "rejected"
          ? "Doctor unavailable at that time."
          : undefined,
    });
  }

  // One completed booking left deliberately unreviewed, to exercise the "leave a review" gate in the UI.
  const reviewableDoctor = approvedDoctors[1];
  const reviewableSlot = reviewableDoctor.timeSlots[reviewableDoctor.timeSlots.length - 1];
  bookings.push({
    doctor: reviewableDoctor._id,
    user: patients[2]._id,
    ticketPrice: String(reviewableDoctor.ticketPrice),
    appointmentDate: dateOnly(pastDate(3)),
    startTime: reviewableSlot.startingTime,
    endTime: toEndTime(reviewableSlot.startingTime),
    status: "completed",
    paymentStatus: "paid",
  });

  const savedBookings = await Booking.insertMany(bookings);

  // For every approved doctor, generate several completed + reviewed bookings so
  // averageRating/totalRating are computed for real (via Review's post-save hook)
  // and land naturally between 4 and 5.
  let reviewCount = 0;
  for (let di = 0; di < approvedDoctors.length; di++) {
    const doctor = approvedDoctors[di];
    if (!doctor.timeSlots || doctor.timeSlots.length === 0) continue;
    const numReviews = randomInt(3, 8);
    for (let r = 0; r < numReviews; r++) {
      const patient = patients[(di + r) % patients.length];
      const slot = doctor.timeSlots[r % doctor.timeSlots.length];
      try {
        const booking = await Booking.create({
          doctor: doctor._id,
          user: patient._id,
          ticketPrice: String(doctor.ticketPrice ?? 0),
          appointmentDate: dateOnly(pastDate(20 + r * 5)),
          startTime: slot.startingTime,
          endTime: toEndTime(slot.startingTime),
          status: "completed",
          paymentStatus: "paid",
        });
        const review = await new Review({
          doctor: doctor._id,
          user: patient._id,
          booking: booking._id,
          reviewText: pick(reviewTexts),
          rating: pick([4, 5]),
        }).save();
        await Doctor.findByIdAndUpdate(doctor._id, { $push: { reviews: review._id } });
        reviewCount += 1;
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
  }

  await Contact.insertMany(contactSeeds);

  const notifications = [];
  for (const booking of savedBookings) {
    notifications.push({
      recipient: booking.doctor,
      recipientModel: "Doctor",
      type: "booking_created",
      message: "You have a new appointment request.",
      booking: booking._id,
      isRead: false,
    });
    if (NOTIFY_TYPES[booking.status]) {
      notifications.push({
        recipient: booking.user,
        recipientModel: "User",
        type: NOTIFY_TYPES[booking.status],
        message: NOTIFY_MESSAGES[booking.status],
        booking: booking._id,
        isRead: false,
      });
    }
  }
  const suspendedDoctor = doctors.find((d) => d.isApproved === "suspended");
  const rejectedDoctor = doctors.find((d) => d.isApproved === "rejected");
  if (suspendedDoctor) {
    notifications.push({
      recipient: suspendedDoctor._id,
      recipientModel: "Doctor",
      type: "doctor_suspended",
      message: "Your doctor account has been suspended by an administrator.",
      isRead: false,
    });
  }
  if (rejectedDoctor) {
    notifications.push({
      recipient: rejectedDoctor._id,
      recipientModel: "Doctor",
      type: "doctor_rejected",
      message: "Your doctor registration was rejected. Please contact support for details.",
      isRead: false,
    });
  }
  await Notification.insertMany(notifications);

  console.log(
    `Seeded ${admins.length} admins, ${doctors.length} doctors (${approvedDoctors.length} approved), ${patients.length} patients, ${savedBookings.length + reviewCount} bookings, ${reviewCount} reviews, ${contactSeeds.length} contact messages, ${notifications.length} notifications`
  );
  console.log(
    "Approved doctors per specialization:",
    ALL_SERVICE_SPECIALIZATIONS.map(
      (s) => `${s}: ${approvedDoctors.filter((d) => d.specialization === s).length}`
    ).join(", ")
  );
  console.log(`All seeded accounts use password: ${PASSWORD}`);
  console.log("Admin logins:", adminSeeds.map((a) => a.email).join(", "));
  console.log("Pending doctors:", doctors.filter((d) => d.isApproved === "pending").map((d) => d.email).join(", "));
  console.log("Rejected doctor:", rejectedDoctor?.email);
  console.log("Suspended doctor:", suspendedDoctor?.email);
  console.log("Suspended patient:", patientSeeds.find((p) => p.isActive === false)?.email);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
