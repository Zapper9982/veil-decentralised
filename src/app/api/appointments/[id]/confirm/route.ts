import { AppointmentStatus } from "@prisma/client"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

const patientConfirmationSchema = z.object({
    action: z.enum(["accept", "reject"]),
    message: z.string().optional(),
})

// PATCH /api/appointments/[id]/confirm
export async function PATCH(
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

        // Parse request body
        const json = await req.json()
        const { action, message } = patientConfirmationSchema.parse(json)

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

        // Verify appointment is in correct status
        if (
            appointment.status !== AppointmentStatus.PENDING_PATIENT_CONFIRMATION
        ) {
            return new Response(
                `Cannot confirm appointment with status: ${appointment.status}`,
                { status: 400 }
            )
        }

        // Handle rejection - go back to doctor to propose new time
        if (action === "reject") {
            const updated = await db.appointment.update({
                where: { id: params.id },
                data: {
                    status: AppointmentStatus.PENDING_DOCTOR_RESPONSE,
                    patientMessage: message || "Patient declined proposed time",
                    patientConfirmed: false,
                    proposedTime: null, // Clear proposed time
                },
                include: {
                    patient: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
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

            return Response.json({
                status: "success",
                message: "Proposed time rejected. Doctor will be notified.",
                data: updated,
            })
        }

        // Handle acceptance - confirm appointment
        const updated = await db.appointment.update({
            where: { id: params.id },
            data: {
                confirmedTime: appointment.proposedTime,
                patientMessage: message,
                patientConfirmed: true,
                status: AppointmentStatus.CONFIRMED,
                locationRevealed: true, // Reveal doctor's location
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
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

        return Response.json({
            status: "success",
            message: "Appointment confirmed! Check location details.",
            data: updated,
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

        console.error("Error confirming appointment:", error)
        return new Response("Internal Server Error", { status: 500 })
    }
}
