"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { PatientDashboardData } from "@/types"
import { Heart, Shield, Zap, User, Plus } from "lucide-react"
import { ethers } from "ethers"

import { getMedicalContract, getSigner } from "@/lib/web3"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import PatientProfile from "./profile"

export default function PatientPage() {
  const [patientData, setPatientData] = useState<PatientDashboardData | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [patientName, setPatientName] = useState("")
  const { toast } = useToast()

  const registerPatient = async () => {
    if (!patientName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to register.",
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)
    try {
      const medicalContract = await getMedicalContract()
      const tx = await medicalContract.registerPatient(patientName)
      await tx.wait()
      
      toast({
        title: "Registration Successful",
        description: "You have been registered as a patient.",
      })
      
      // Refresh the page data
      window.location.reload()
    } catch (error: any) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true)
        const signer = await getSigner()
        if (!signer) {
          redirect("/login")
          return
        }
        const medicalContract = await getMedicalContract()
        const patientAddress = await signer.getAddress()
        
        // Check if patient exists in the contract
        try {
          const data = await medicalContract.patients(patientAddress)
          
          // Check if patient data exists (non-zero address indicates registration)
          if (data.patientAddress && data.patientAddress !== "0x0000000000000000000000000000000000000000") {
            setPatientData({
              id: data.patientAddress,
              userId: data.patientAddress,
              name: data.name,
              email: "user@example.com", // Placeholder
              image: "/logo.svg", // Placeholder
              gender: "N/A", // Placeholder
              dateOfBirth: new Date(), // Placeholder
              bloodType: "N/A", // Placeholder
              chronicDiseases: [], // Placeholder
              emergencyContact: "N/A", // Placeholder
              blockId: data.patientAddress,
            })
          } else {
            // Patient not registered, show registration prompt
            setPatientData(null)
            toast({
              title: "Not Registered",
              description: "You are not registered as a patient. Please register to continue.",
              variant: "destructive",
            })
          }
        } catch (contractError) {
          // If contract call fails, patient is likely not registered
          console.log("Patient not found in contract, showing registration prompt")
          setPatientData(null)
          toast({
            title: "Registration Required",
            description: "Please register as a patient to access the dashboard.",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Failed to connect to contract:", error)
        toast({
          title: "Connection Error",
          description: "Failed to connect to the blockchain. Please check your wallet connection.",
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
        <DashboardHeader
          heading="Patient Profile"
          text="Loading your patient information..."
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardShell>
    )
  }

  if (!patientData) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Patient Registration"
          text="Register to access your patient dashboard"
        />
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Register as Patient
              </CardTitle>
              <CardDescription>
                Join our platform to manage your medical records and prescriptions securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="patientName"
                  type="text"
                  placeholder="Enter your full name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  disabled={isRegistering}
                />
              </div>
              <Button 
                onClick={registerPatient} 
                disabled={isRegistering || !patientName.trim()}
                className="w-full"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Register as Patient
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Patient Profile"
        text="See all things related to you"
      />
      <PatientProfile patientData={patientData} />
    </DashboardShell>
  )
}

