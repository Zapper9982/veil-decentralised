"use client"

import { useState } from "react"
import { CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Loading skeleton component
export const AppointmentSkeleton = () => (
  <Card className="flex animate-pulse items-center justify-between shadow-sm">
    <CardHeader className="w-2/3">
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-6 w-20" />
    </CardContent>
  </Card>
)

type ClinicDetails = {
  name: string | null
  address: string | null
}

// Appointment card component
export const AppointmentCard = ({ appointment, isPast = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [status, setStatus] = useState(appointment.status)
  const [isLoading, setIsLoading] = useState(false)
  const [clinicDetails, setClinicDetails] = useState<ClinicDetails | null>(null)
  const [showLocation, setShowLocation] = useState(appointment.locationRevealed)

  const handleAction = async (action: "confirm" | "reject") => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/appointments/${appointment.id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })

      if (!res.ok) throw new Error("Failed to process request")

      const data = (await res.json()) as { data: { clinic: ClinicDetails } }

      if (action === "confirm") {
        try {
          // Blockchain integration
          const { getMedicalWithZKContract } = await import("@/lib/web3")
          const contract = await getMedicalWithZKContract()

          if (appointment.proposedTime && appointment.doctor?.blockId) {
            const timeInSeconds = Math.floor(new Date(appointment.proposedTime).getTime() / 1000)

            // Initial user feedback
            alert("Please confirm the transaction in your wallet to record this appointment on the blockchain.")

            console.log("DEBUG: Calling createAppointment with:", {
              doctorAddress: appointment.doctor.blockId,
              time: timeInSeconds
            })

            const tx = await contract.createAppointment(
              appointment.doctor.blockId,
              timeInSeconds
            )
            console.log("Transaction sent:", tx.hash)
            await tx.wait()
            console.log("Appointment recorded on blockchain:", tx.hash)
          }
        } catch (bcError: any) {
          console.error("Blockchain error details:", bcError)
          if (bcError.reason) console.error("Revert reason:", bcError.reason)
          if (bcError.message) console.error("Error message:", bcError.message)

          alert(`Blockchain recording failed: ${bcError.reason || bcError.message || "Unknown error"}. Check console for details.`)
          // We proceed anyway to show the UI update since backend succeeded
        }

        setStatus("CONFIRMED")
        const clinic = data.data.clinic
        setClinicDetails(clinic)
        setShowLocation(true)
        alert(`Appointment Confirmed! Clinic: ${clinic.name}, ${clinic.address}`)
      } else {
        setStatus("CANCELLED")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to process request")
    } finally {
      setIsLoading(false)
    }
  }

  // Determine display time (proposed takes precedence if pending confirmation)
  const displayStartTime = appointment.proposedTime && status === "PENDING_PATIENT_CONFIRMATION"
    ? appointment.proposedTime
    : appointment.startTime

  const displayEndTime = appointment.endTime

  return (
    <Card
      key={appointment.id}
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-md",
        isPast && "opacity-75 hover:opacity-100",
        status === "PENDING_PATIENT_CONFIRMATION" && "border-yellow-500 bg-yellow-50/10"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between p-6">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            {appointment.doctor.user.name}
            <span className="text-sm text-muted-foreground">
              ({appointment.doctor.mbbsId})
            </span>
          </CardTitle>
          <CardDescription className="mt-2 flex items-center">
            <CalendarIcon className="mr-2 size-4" />
            <span>
              {new Date(displayStartTime).toLocaleDateString()} at{" "}
              {new Date(displayStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {status === "PENDING_PATIENT_CONFIRMATION" && " (Proposed)"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 p-0">
          <Badge
            className={cn(
              "transition-colors",
              status === "PENDING_DOCTOR_RESPONSE" && "bg-blue-600",
              status === "PENDING_PATIENT_CONFIRMATION" && "bg-yellow-600 hover:bg-yellow-700",
              status === "CONFIRMED" && "bg-green-600 hover:bg-green-700",
              status === "CANCELLED" && "bg-red-600 hover:bg-red-700"
            )}
            variant="outline"
          >
            {status === "PENDING_PATIENT_CONFIRMATION" ? "Action Required" : status}
          </Badge>
          <ChevronDown
            className={cn(
              "size-5 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </CardContent>
      </div>

      <div
        className={cn(
          "grid transition-all duration-200",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t p-6">
            {/* Action Section for Pending Confirmation */}
            {status === "PENDING_PATIENT_CONFIRMATION" && (
              <div className="mb-4 rounded-md bg-yellow-100 p-4 dark:bg-yellow-900/20">
                <h4 className="mb-2 font-semibold">Doctor Proposed Time</h4>
                <p className="mb-4 text-sm">
                  The doctor has proposed: {new Date(appointment.proposedTime).toLocaleString()}
                  {appointment.doctorMessage && (
                    <span className="block mt-1 italic">"Note: {appointment.doctorMessage}"</span>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction("confirm")
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Confirm & Reveal Location"}
                  </button>
                  <button
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction("reject")
                    }}
                    disabled={isLoading}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* Confirmed Details */}
            {status === "CONFIRMED" && showLocation && (
              <div className="mt-2 rounded-md bg-green-50 p-4 dark:bg-green-900/10">
                <h4 className="font-semibold text-green-700 dark:text-green-400">Appointment Confirmed</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Clinic:</strong> {clinicDetails?.name || appointment.doctor.clinicName || "Revealed"}</p>
                  <p><strong>Address:</strong> {clinicDetails?.address || appointment.doctor.clinicAddress || "Revealed"}</p>
                  {/* In real implementation, these would be properly decoded here if passed from server */}
                  <p className="text-xs text-muted-foreground mt-2">
                    📍 Proceed to this location at the confirmed time.
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-2">
              Status: {status}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
