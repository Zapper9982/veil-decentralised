"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Medication, Prescription } from "@prisma/client"
import { ethers } from "ethers"

import { getMedicalContract, getSigner } from "@/lib/web3"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { useToast } from "@/components/ui/use-toast"

import { PrescriptionCard } from "./_components/prescription-card"

interface ColorScheme {
  primary: string
  secondary: string
  text: string
}

const colorSchemes: ColorScheme[] = [
  { primary: "bg-blue-500", secondary: "bg-blue-700", text: "text-blue-100" },
  {
    primary: "bg-purple-500",
    secondary: "bg-purple-700",
    text: "text-purple-100",
  },
  {
    primary: "bg-green-500",
    secondary: "bg-green-700",
    text: "text-green-100",
  },
  { primary: "bg-pink-500", secondary: "bg-pink-700", text: "text-pink-100" },
]

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const medicalContract = await getMedicalContract()
        const signer = await getSigner()
        if (!signer) {
          toast({
            title: "Not Logged In",
            description: "Please connect your wallet.",
            variant: "destructive",
          })
          redirect("/login")
          return
        }
        const patientAddress = await signer.getAddress()
        
        // This is a simplified way to get prescriptions.
        // A real-world scenario would involve events or a dedicated function to get all prescriptions for a patient.
        const prescriptionCounter = await medicalContract.prescriptionCounter()
        const fetchedPrescriptions = []
        for (let i = 1; i <= prescriptionCounter; i++) {
          const p = await medicalContract.prescriptions(i)
          if (p.patientAddress.toLowerCase() === patientAddress.toLowerCase()) {
            fetchedPrescriptions.push({
              id: p.id.toString(),
              issueDate: new Date(Number(p.issueDate) * 1000),
              doctorAddress: p.doctorAddress,
              patientAddress: p.patientAddress,
              medications: p.medications.map((m: any) => ({
                name: m.name,
                dosage: m.dosage,
                duration: m.duration.toString(),
                additionalInstructions: m.additionalInstructions,
              })),
              diagnosis: p.diagnosis,
              active: p.active,
            })
          }
        }
        setPrescriptions(fetchedPrescriptions)
      } catch (error: any) {
        console.error("Failed to fetch prescriptions:", error)
        toast({
          title: "Error",
          description: "Failed to fetch prescriptions.",
          variant: "destructive",
        })
      }
    }

    fetchPrescriptions()
  }, [toast])

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Prescriptions"
        text="See all prescriptions issued to you"
      />
      <div className="space-y-8">
        {prescriptions.map((prescription, index) => (
          <PrescriptionCard
            key={prescription.id}
            prescription={prescription}
            colorScheme={colorSchemes[index % colorSchemes.length]}
          />
        ))}
      </div>
    </DashboardShell>
  )
}

