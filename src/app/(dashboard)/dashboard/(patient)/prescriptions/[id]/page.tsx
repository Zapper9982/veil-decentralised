"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ethers } from "ethers"
import { Mail, MapPin, Phone, Printer, Stethoscope, Shield, Eye, EyeOff } from "lucide-react"

import { getMedicalContract, getMedicalWithZKContract, getZKVerifierContract } from "@/lib/web3"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"

export default function Component() {
  const { id } = useParams()
  const [prescription, setPrescription] = useState<any>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [zkVerified, setZkVerified] = useState(false)
  const [showAnonymousView, setShowAnonymousView] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPrescription = async () => {
      if (id) {
        try {
          // First try to fetch from regular Medical contract
          let medicalContract = await getMedicalContract()
          let p = await medicalContract.prescriptions(id)
          
          // If not found or if it's anonymous, try ZK contract
          if (!p.active || p.patientAddress === ethers.ZeroAddress) {
            medicalContract = await getMedicalWithZKContract()
            p = await medicalContract.prescriptions(id)
            
            if (p.isAnonymous) {
              setIsAnonymous(true)
              
              // Verify ZK proof
              const zkVerifierContract = await getZKVerifierContract()
              const zkId = await medicalContract.prescriptionToZKId(id)
              const verified = await zkVerifierContract.verifyAnonymousPrescription(zkId)
              setZkVerified(verified)
            }
          }
          
          setPrescription({
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
            isAnonymous: p.isAnonymous || false,
          })
        } catch (error) {
          console.error("Failed to fetch prescription:", error)
          toast({
            title: "Error",
            description: "Failed to fetch prescription details.",
            variant: "destructive",
          })
        }
      }
    }
    fetchPrescription()
  }, [id, toast])

  if (!prescription) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Card className="mx-auto max-w-4xl shadow-lg">
        <CardHeader className={`border-b ${isAnonymous ? 'bg-gradient-to-r from-green-600 to-green-800' : 'bg-gradient-to-r from-blue-600 to-blue-800'} text-white`}>
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center md:mb-0">
              {isAnonymous ? (
                <Shield className="mr-3 size-10" />
              ) : (
                <Stethoscope className="mr-3 size-10" />
              )}
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  {isAnonymous ? "Anonymous Prescription" : `Dr. ${prescription.doctorAddress}`}
                </CardTitle>
                <p className="text-secondary-foreground">
                  {isAnonymous ? "Zero-Knowledge Protected" : "General Practitioner"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {isAnonymous && (
                <Badge
                  variant={zkVerified ? "default" : "secondary"}
                  className={zkVerified ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}
                >
                  {zkVerified ? "ZK Verified" : "Pending Verification"}
                </Badge>
              )}
              {!isAnonymous && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnonymousView(!showAnonymousView)}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  {showAnonymousView ? (
                    <>
                      <Eye className="mr-2 size-4" />
                      Show Full Details
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 size-4" />
                      Anonymous View
                    </>
                  )}
                </Button>
              )}
              <div className="text-sm">
                <div className="mb-1 flex items-center">
                  <Phone className="mr-2 size-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="mb-1 flex items-center">
                  <Mail className="mr-2 size-4" />
                  <span>dr.smith@example.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 size-4" />
                  <span>123 Medical Center, City, State 12345</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-6 space-y-8">
          {/* Zero-Knowledge Privacy Notice for Anonymous Prescriptions */}
          {isAnonymous && (
            <div className="rounded-lg bg-green-50 p-6 border border-green-200">
              <div className="flex items-start">
                <Shield className="mr-3 mt-1 size-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Zero-Knowledge Privacy Protection</h3>
                  <p className="text-sm text-green-700 mt-1">
                    This prescription uses cryptographic zero-knowledge proofs to ensure patient anonymity 
                    while maintaining prescription authenticity and doctor verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Anonymous View Notice for Regular Prescriptions */}
          {!isAnonymous && showAnonymousView && (
            <div className="rounded-lg bg-blue-50 p-6 border border-blue-200">
              <div className="flex items-start">
                <EyeOff className="mr-3 mt-1 size-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Anonymous View Mode</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Patient-identifying information has been hidden to protect privacy. 
                    This simulates how the prescription would appear in zero-knowledge mode.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-secondary p-6">
            <h2 className="mb-3 text-xl font-semibold text-primary">
              {isAnonymous ? "Cryptographic Verification" : "Blockchain Addresses"}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-primary">Doctor ID:</p>
                <p className="break-all text-sm">{prescription.doctorAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary">
                  {isAnonymous ? "Patient ID:" : "Patient ID:"}
                </p>
                <p className="break-all text-sm">
                  {isAnonymous || showAnonymousView ? 
                    "Protected by zero-knowledge proof" : 
                    prescription.patientAddress
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-xl font-semibold text-primary">
                Prescription Information
              </h2>
              <p className="mb-2">
                <span className="block font-medium">Prescription ID:</span>
                {prescription.id}
              </p>
              <p className="mb-2">
                <span className="font-medium">Issue Date:</span>{" "}
                {prescription.issueDate.toDateString()}
              </p>
              <p className="mb-2">
                <span className="font-medium">Diagnosis:</span>{" "}
                {prescription.diagnosis}
              </p>
            </div>
            <div>
              <h2 className="mb-3 text-xl font-semibold text-primary">
                Patient Information
              </h2>
              {isAnonymous || showAnonymousView ? (
                <div className="space-y-2">
                  <p className="mb-2">
                    <span className="font-medium">Name:</span> 
                    <span className="text-muted-foreground italic ml-2">Protected by ZK proof</span>
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Age:</span> 
                    <span className="text-muted-foreground italic ml-2">Protected by ZK proof</span>
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span> 
                    <span className="text-muted-foreground italic ml-2">Protected by ZK proof</span>
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-2">
                    <span className="font-medium">Name:</span> John Doe
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Age:</span> 35 years
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span> Male
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-primary">
              Medications
            </h2>
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="font-bold text-primary">
                    Medication
                  </TableHead>
                  <TableHead className="font-bold text-primary">
                    Dosage
                  </TableHead>
                  <TableHead className="font-bold text-primary">
                    Duration
                  </TableHead>
                  <TableHead className="font-bold text-primary">
                    Instructions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.medications.map((medication: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {medication.name}
                    </TableCell>
                    <TableCell>{medication.dosage}</TableCell>
                    <TableCell>{medication.duration} days</TableCell>
                    <TableCell>{medication.additionalInstructions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-between border-t pt-6 md:flex-row">
          <div className="mb-4 text-center md:mb-0 md:text-left">
            <Image
              src="/logo.svg"
              alt="Doctor's Signature"
              height={50}
              width={50}
              className="object-contain"
            />
            <p className="text-sm font-semibold">Dr. {prescription.doctorAddress}</p>
            <p className="text-xs text-muted-foreground">License No: MD12345</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Icons.logo className="mb-2 size-12" />
            <p className="text-xs text-muted-foreground">Official Stamp</p>
          </div>
        </CardFooter>
      </Card>
      <div className="mx-auto mt-8 max-w-4xl space-y-6 text-sm">
        <Separator className="bg-secondary" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-secondary p-6 shadow">
            <h3 className="mb-3 text-lg font-semibold text-primary">
              Important Points:
            </h3>
            <ul className="list-inside list-disc space-y-2">
              <li>
                This prescription is valid for the duration specified for each
                medication.
              </li>
              <li>
                Take medications as prescribed. Do not alter dosage without
                consulting your doctor.
              </li>
              <li>
                Report any unusual side effects to your healthcare provider
                immediately.
              </li>
              <li>Keep all medications out of reach of children.</li>
            </ul>
          </div>
          <div className="rounded-lg bg-secondary p-6 shadow">
            <h3 className="mb-3 text-lg font-semibold text-primary">
              Follow-up:
            </h3>
            <p className="mb-2">
              Next appointment:{" "}
              {new Date(
                prescription.issueDate.getTime() + 30 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}{" "}
              at 10:00 AM
            </p>
            <p>For any questions or concerns, please contact our office.</p>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button className={`w-full max-w-4xl ${isAnonymous ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
          <Printer className="mr-2 size-4" /> 
          {isAnonymous ? "Print Anonymous Prescription" : "Print Prescription"}
        </Button>
      </div>
    </div>
  )
}
