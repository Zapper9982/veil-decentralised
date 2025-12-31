import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { AppointmentStatus } from "@prisma/client"
import { z } from "zod"

const routeContextSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
})

const confirmSchema = z.object({
    action: z.enum(["confirm", "reject"]),
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

        // Verify user is a patient
        const patient = await db.patient.findFirst({
            where: { userId: user.id },
        })

        if (!patient) {
            // Fallback for role mismatch
            const userRecord = await db.user.findUnique({ where: { id: user.id } })
            if (userRecord?.role === "doctor") {
                return new Response("Unauthorized - User is not a patient", { status: 403 })
            }
            return new Response("Patient profile not found", { status: 404 })
        }

        const json = await req.json()
        const { action, message } = confirmSchema.parse(json)

        // Verify appointment exists and belongs to patient
        const appointment = await db.appointment.findUnique({
            where: {
                id: params.id,
                patientId: patient.id,
            },
            include: {
                doctor: true // Start fetching doctor to reveal location later
            }
        })

        if (!appointment) {
            return new Response("Appointment not found", { status: 404 })
        }

        if (action === "reject") {
            await db.appointment.update({
                where: { id: params.id },
                data: {
                    status: AppointmentStatus.CANCELLED,
                    patientMessage: message,
                    patientConfirmed: false,
                },
            })

            return Response.json({ status: "success", message: "Appointment rejected" })
        }

        if (action === "confirm") {
            if (appointment.status !== AppointmentStatus.PENDING_PATIENT_CONFIRMATION) {
                return new Response("Appointment is not in a confirmable state", { status: 400 })
            }

            const updatedAppointment = await db.appointment.update({
                where: { id: params.id },
                data: {
                    status: AppointmentStatus.CONFIRMED,
                    patientConfirmed: true,
                    locationRevealed: true,
                    patientMessage: message,
                    confirmedTime: appointment.proposedTime || appointment.startTime
                },
            })

            // Reveal Location Details (Mock Decryption)
            // In a real app, strict access control and decryption would happen here
            // For now, we assume the fields in the Doctor model are available (even if base64 encoded)

            const clinicDetails = {
                name: appointment.doctor.clinicName,
                address: appointment.doctor.clinicAddress, // Should be decrypted
                city: appointment.doctor.clinicCity,
                state: appointment.doctor.clinicState,
                pincode: appointment.doctor.clinicPincode,
                phone: appointment.doctor.clinicPhone,
            }

            return Response.json({
                status: "success",
                data: {
                    appointment: updatedAppointment,
                    clinic: clinicDetails
                }
            })
        }

        return new Response("Invalid action", { status: 400 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }

        console.error("Error confirming appointment:", error)
        return new Response(null, { status: 500 })
    }
}
