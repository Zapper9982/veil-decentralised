import { AppointmentStatus } from "@prisma/client"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// GET /api/appointments/[id]/location
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentUser()
        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        // Get patient profile
        const patient = await db.patient.findFirst({
            where: { userId: session.id },
        })

        if (!patient) {
            return new Response("Patient profile not found", { status: 404 })
        }

        // Get appointment
        const appointment = await db.appointment.findUnique({
            where: { id: params.id },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        })

        if (!appointment) {
            return new Response("Appointment not found", { status: 404 })
        }

        // Verify this patient owns the appointment
        if (appointment.patientId !== patient.id) {
            return new Response("Not authorized for this appointment", { status: 403 })
        }

        // Check if location should be revealed
        if (!appointment.locationRevealed) {
            return Response.json(
                {
                    status: "error",
                    message:
                        "Location not available yet. Please confirm the appointment first.",
                    revealed: false,
                },
                { status: 403 }
            )
        }

        // Location is revealed only after patient confirms (status = CONFIRMED or later)
        if (
            ![
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.IN_PROGRESS,
                AppointmentStatus.COMPLETED,
                AppointmentStatus.PAID,
            ].includes(appointment.status)
        ) {
            return Response.json(
                {
                    status: "error",
                    message: "Location available only after appointment confirmation",
                    revealed: false,
                },
                { status: 403 }
            )
        }

        // Prepare location data
        const doctor = appointment.doctor
        const location = {
            clinicName: doctor.clinicName || "Clinic",
            address: doctor.clinicAddress
                ? Buffer.from(doctor.clinicAddress, "base64").toString("utf-8")
                : "Address not provided",
            city: doctor.clinicCity || "",
            state: doctor.clinicState || "",
            pincode: doctor.clinicPincode || "",
            phone: doctor.clinicPhone
                ? Buffer.from(doctor.clinicPhone, "base64").toString("utf-8")
                : doctor.phoneNumber, // Fallback to doctor's phone
            doctorName: doctor.user.name,
            specialty: doctor.specialty,
        }

        return Response.json({
            status: "success",
            message: "Location revealed",
            revealed: true,
            data: {
                appointment: {
                    id: appointment.id,
                    confirmedTime: appointment.confirmedTime,
                    status: appointment.status,
                },
                location,
            },
        })
    } catch (error) {
        console.error("Error fetching appointment location:", error)
        return new Response("Internal Server Error", { status: 500 })
    }
}
