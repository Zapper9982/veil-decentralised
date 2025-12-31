import { AppointmentStatus } from "@prisma/client"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

const doctorResponseSchema = z.object({
    action: z.enum(["accept", "reject"]),
    proposedTime: z.string().datetime().optional(),
    estimatedDuration: z.number().int().positive().optional().default(30),
    message: z.string().optional(),
})

// PATCH /api/appointments/[id]/respond
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentUser()
        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        // Get doctor profile
        const doctor = await db.doctor.findFirst({
            where: { userId: session.id },
        })

        if (!doctor) {
            return new Response("Doctor profile not found", { status: 404 })
        }

        // Parse request body
        const json = await req.json()
        const { action, proposedTime, estimatedDuration, message } =
            doctorResponseSchema.parse(json)

        // Get appointment
        const appointment = await db.appointment.findUnique({
            where: { id: params.id },
            include: {
                patient: {
                    select: {
                        id: true,
                        blockId: true, // Only blockchain address for privacy
                    },
                },
            },
        })

        if (!appointment) {
            return new Response("Appointment not found", { status: 404 })
        }

        // Verify this doctor owns the appointment
        if (appointment.doctorId !== doctor.id) {
            return new Response("Not authorized for this appointment", { status: 403 })
        }

        // Verify appointment is in correct status
        if (appointment.status !== AppointmentStatus.PENDING_DOCTOR_RESPONSE) {
            return new Response(
                `Cannot respond to appointment with status: ${appointment.status}`,
                { status: 400 }
            )
        }

        // Handle rejection
        if (action === "reject") {
            const updated = await db.appointment.update({
                where: { id: params.id },
                data: {
                    status: AppointmentStatus.CANCELLED,
                    doctorMessage: message || "Doctor declined this appointment",
                    doctorConfirmed: false,
                },
                include: {
                    patient: {
                        select: {
                            id: true,
                            blockId: true,
                        },
                    },
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            })

            return Response.json({
                status: "success",
                message: "Appointment rejected",
                data: updated,
            })
        }

        // Handle acceptance with proposed time
        if (!proposedTime) {
            return new Response("proposedTime is required when accepting", {
                status: 400,
            })
        }

        const proposedDateTime = new Date(proposedTime)
        const endTime = new Date(
            proposedDateTime.getTime() + (estimatedDuration || 30) * 60000
        )

        // Check if proposed time conflicts with other appointments
        const conflictingAppointment = await db.appointment.findFirst({
            where: {
                doctorId: doctor.id,
                id: { not: params.id }, // Exclude current appointment
                startTime: {
                    lte: endTime,
                },
                endTime: {
                    gte: proposedDateTime,
                },
                status: {
                    in: [
                        AppointmentStatus.CONFIRMED,
                        AppointmentStatus.PENDING_PATIENT_CONFIRMATION,
                        AppointmentStatus.IN_PROGRESS,
                    ],
                },
            },
        })

        if (conflictingAppointment) {
            return new Response("Proposed time conflicts with another appointment", {
                status: 409,
            })
        }

        // Update appointment with doctor's response
        const updated = await db.appointment.update({
            where: { id: params.id },
            data: {
                proposedTime: proposedDateTime,
                startTime: proposedDateTime,
                endTime: endTime,
                doctorMessage: message,
                doctorConfirmed: true,
                confirmationTime: new Date(),
                status: AppointmentStatus.PENDING_PATIENT_CONFIRMATION,
                symptomsRevealed: true, // Doctor can now see symptoms
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        blockId: true, // Anonymous - only wallet address
                    },
                },
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

        // Decrypt symptoms for doctor (Base64 placeholder)
        const decryptedSymptoms = Buffer.from(
            appointment.symptomsEncrypted,
            "base64"
        ).toString("utf-8")

        return Response.json({
            status: "success",
            message: "Appointment time proposed. Waiting for patient confirmation.",
            data: {
                ...updated,
                symptoms: decryptedSymptoms, // Include decrypted symptoms in response
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json(
                {
                    status: "error",
                    message: "Validation failed",
                    errors: error.errors,
                },
                { status: 422 }
            )
        }

        console.error("Error responding to appointment:", error)
        return new Response("Internal Server Error", { status: 500 })
    }
}
