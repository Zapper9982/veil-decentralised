import { db } from "@/lib/db";

export async function getUserRegistrationStatus(userId: string) {
  // Check if user is a patient
  const patient = await db.patient.findFirst({ where: { userId } });
  if (patient) return "patient";
  // Check if user is a doctor
  const doctor = await db.doctor.findFirst({ where: { userId } });
  if (doctor) return "doctor";
  return null;
}
