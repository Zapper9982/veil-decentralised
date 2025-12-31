import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export default async function PostLoginRedirect() {
    const user = await getCurrentUser()

    if (!user || !user.id) {
        return redirect("/login")
    }

    // Check if user is registered as a patient
    const patient = await db.patient.findFirst({
        where: { userId: user.id },
    })

    if (patient) {
        return redirect("/dashboard/patient/profile")
    }

    // Check if user is registered as a doctor
    const doctor = await db.doctor.findFirst({
        where: { userId: user.id },
    })

    if (doctor) {
        return redirect("/dashboard/doctor")
    }

    // If user is not registered as either, redirect to verification
    return redirect("/verification")
}
