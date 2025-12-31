"use client"

import PatientProfile from "../profile"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { PatientDashboardData } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export default function PatientProfilePage() {
  const [patientData, setPatientData] = useState<PatientDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/users/patient")
        if (!res.ok) {
          setPatientData(null)
          return
        }
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          // Map backend data to PatientDashboardData
          const patient = data[0] as PatientDashboardData
          setPatientData({
            id: patient.id,
            userId: patient.userId,
            name: patient.name || "",
            email: patient.email || "",
            // The image from database already comes from Google OAuth
            image: patient.image || "/logo.svg",
            gender: patient.gender || "N/A",
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : new Date(),
            bloodType: patient.bloodType || "N/A",
            chronicDiseases: patient.chronicDiseases || [],
            emergencyContact: patient.emergencyContact || "N/A",
            blockId: patient.blockId || "",
          })
        } else {
          setPatientData(null)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch patient data from backend.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientData()
  }, [toast])

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Patient Profile" text="Loading your patient information..." />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardShell>
    )
  }

  if (!patientData) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Patient Profile" text="No patient data found." />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Patient Profile" text="Comprehensive view of your health information" />
      <PatientProfile patientData={patientData} />
    </DashboardShell>
  )
}
