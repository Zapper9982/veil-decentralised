import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { AppointmentStatus } from "@prisma/client"
import { z } from "zod"

const routeContextSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
})

const respondSchema = z.object({
    action: z.enum(["accept", "reject"]),
    proposedTime: z.string().optional(),
    estimatedDuration: z.number().optional(),
    message: z.string().optional(),
})

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return new Response("Unauthorized", { status: 401 })
        }

        // Verify user is a doctor
        const doctor = await db.doctor.findFirst({
            where: { userId: user.id },
        })

        if (!doctor) {
            // Fallback for role mismatch issue saw earlier
            const userRecord = await db.user.findUnique({ where: { id: user.id } })
            if (userRecord?.role === "patient") {
                return new Response("Unauthorized - User is not a doctor", { status: 403 })
            }
            return new Response("Doctor profile not found", { status: 404 })
        }

        const json = await req.json()
        const { action, proposedTime, estimatedDuration, message } = respondSchema.parse(json)

        // Verify appointment exists and belongs to doctor
        const appointment = await db.appointment.findUnique({
            where: {
                id: params.id,
                doctorId: doctor.id,
            },
        })

        if (!appointment) {
            return new Response("Appointment not found", { status: 404 })
        }

        if (action === "reject") {
            await db.appointment.update({
                where: { id: params.id },
                data: {
                    status: AppointmentStatus.CANCELLED,
                    doctorMessage: message,
                    doctorConfirmed: false,
                },
            })

            return Response.json({ status: "success", message: "Appointment rejected" })
        }

        if (action === "accept") {
            if (!proposedTime) {
                return new Response("Proposed time is required for acceptance", { status: 400 })
            }

            // Parse proposed time
            const startTime = new Date(proposedTime)
            if (isNaN(startTime.getTime())) {
                return new Response("Invalid time format", { status: 400 })
            }

            // Calculate end time based on estimated duration (default 30 mins)
            const duration = estimatedDuration || 30
            const endTime = new Date(startTime.getTime() + duration * 60000)

            const updatedAppointment = await db.appointment.update({
                where: { id: params.id },
                data: {
                    status: AppointmentStatus.PENDING_PATIENT_CONFIRMATION,
                    proposedTime: startTime,
                    startTime: startTime, // Updating the actual start time to the proposed one
                    endTime: endTime,
                    doctorMessage: message,
                    doctorConfirmed: true, // Doctor has implicitly confirmed by proposing
                    symptomsRevealed: true,
                },
            })

            // Decrypt symptoms (Base64 decode)
            // Note: In a real app this would be actual encryption
            const symptomsDecrypted = Buffer.from(updatedAppointment.symptomsEncrypted, 'base64').toString('utf-8')

            return Response.json({
                status: "success",
                data: {
                    appointment: updatedAppointment,
                    symptoms: symptomsDecrypted
                }
            })
        }

        return new Response("Invalid action", { status: 400 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }

        console.error("DEBUG: Error responding to appointment:", error)
        return new Response(null, { status: 500 })
    }
}
