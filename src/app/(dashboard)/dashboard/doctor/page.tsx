"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { motion } from "framer-motion"
import {
  Clock,
  DollarSign,
  Droplet,
  FileText,
  Heart,
  Mail,
  Phone,
  Plus,
  Shield,
  User,
  Zap,
} from "lucide-react"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicalContract } from "@/components/contract"
import { DashboardHeader } from "@/components/header"
import { Icons } from "@/components/icons"
import { DashboardShell } from "@/components/shell"
import { getHealthTokenContract, getSigner } from "@/lib/web3"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Doctor benefits data
const doctorBenefits = [
  {
    icon: <Heart className="size-6 text-red-500" />,
    title: "24/7 Care",
    description: "Round-the-clock access to medical professionals",
  },
  {
    icon: <Shield className="size-6 text-blue-500" />,
    title: "Secure Records",
    description:
      "Your medical data is protected with state-of-the-art encryption",
  },
  {
    icon: <Zap className="size-6 text-yellow-500" />,
    title: "Fast Appointments",
    description: "Book appointments quickly and easily",
  },
]

export default function DoctorProfile() {
  const [doctorData, setDoctorData] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [balance, setBalance] = useState(100)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [walletConnected, setWalletConnected] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState("")
  const { toast } = useToast()

  // Appointment handling state
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [proposalData, setProposalData] = useState({
    proposedTime: "",
    estimatedDuration: 30,
    message: ""
  })

  useEffect(() => {
    // Fetch doctor data from database
    const fetchDoctorData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/users/doctor")
        if (!res.ok) {
          setDoctorData(null)
          setIsLoading(false)
          return
        }
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const doctor = data[0] as any
          setDoctorData({
            id: doctor.id,
            userId: doctor.userId,
            name: doctor.name || "",
            email: doctor.email || "",
            image: doctor.image || "/logo.svg",
            phoneNumber: doctor.phoneNumber || "N/A",
            specialty: doctor.specialty || "N/A",
            mbbsId: doctor.mbbsId || "N/A",
            aadharNumber: doctor.aadharNumber || "N/A",
            verified: doctor.verified || false,
            blockId: doctor.blockId || "",
          })
        } else {
          setDoctorData(null)
        }
      } catch (error) {
        console.error("Failed to fetch doctor data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch doctor data from backend.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctorData()

    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments?status=PENDING_DOCTOR_RESPONSE")
        if (res.ok) {
          const response: any = await res.json()
          console.log("Frontend Fetch Response:", response)
          if (response.status === "success" && Array.isArray(response.data)) {
            console.log("Setting appointments:", response.data)
            setAppointments(response.data)
          } else {
            console.error("Invalid API response format:", response)
            setAppointments([])
          }
        } else {
          console.error("Fetch failed with status:", res.status)
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
      }
    }

    fetchAppointments()

    // Mock prescriptions for now
    setPrescriptions([
      {
        id: "presc1",
        issueDate: new Date("2023-06-01"),
        validTill: new Date("2023-07-01"),
      },
    ])

    // Fetch actual HTK balance from blockchain
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      console.log("🔍 Fetching balance...")
      const signer = await getSigner()
      console.log("👤 Signer for balance:", signer ? "✅ Connected" : "❌ Not connected")

      if (!signer) {
        console.log("❌ No signer available")
        setWalletConnected(false)
        return
      }

      setWalletConnected(true)

      // Check network
      const network = await signer.provider?.getNetwork()
      console.log("🌐 Current network:", network)
      setCurrentNetwork(network ? `${network.name} (${network.chainId})` : "Unknown")

      const address = await signer.getAddress()
      console.log("🏠 User address:", address)

      const healthTokenContract = await getHealthTokenContract()
      console.log("🏥 Health token contract for balance:", healthTokenContract ? "✅ Loaded" : "❌ Failed")

      const balance = await healthTokenContract.balanceOf(address)
      console.log("💰 Raw balance:", balance.toString())

      // Convert from wei to tokens (assuming 18 decimals for ERC20)
      const balanceInTokens = ethers.formatEther(balance)
      console.log("💎 Balance in tokens:", balanceInTokens)

      setBalance(parseFloat(balanceInTokens))
    } catch (error) {
      console.error("❌ Error fetching balance:", error)
      setWalletConnected(false)
    }
  }

  const handleTopUp = async () => {
    console.log("🔥 Top-up button clicked!")

    const amount = parseFloat(topUpAmount)
    console.log("💰 Amount entered:", amount)

    if (!isNaN(amount) && amount > 0) {
      setIsLoading(true)
      try {
        console.log("🔍 Getting signer...")
        const signer = await getSigner()
        console.log("👤 Signer:", signer ? "✅ Connected" : "❌ Not connected")

        if (!signer) {
          toast({
            title: "Wallet Not Connected",
            description: "Please connect your wallet to buy tokens",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        console.log("🏥 Getting health token contract...")
        const healthTokenContract = await getHealthTokenContract()
        console.log("📋 Health token contract:", healthTokenContract ? "✅ Loaded" : "❌ Failed")

        // Convert ETH amount to wei
        const valueInWei = ethers.parseEther(amount.toString())
        console.log("💎 Value in wei:", valueInWei.toString())

        // Call buyTokens function with ETH payment
        console.log("🚀 Calling buyTokens with", amount, "ETH...")
        const tx = await healthTokenContract.buyTokens({ value: valueInWei })
        console.log("📄 Transaction hash:", tx.hash)

        toast({
          title: "Transaction Submitted",
          description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
        })

        // Wait for transaction confirmation
        console.log("⏳ Waiting for transaction confirmation...")
        const receipt = await tx.wait()
        console.log("✅ Transaction confirmed! Block number:", receipt.blockNumber)

        toast({
          title: "Tokens Purchased Successfully",
          description: `You have purchased ${amount * 100} HTK tokens for ${amount} ETH`,
        })

        // Refresh balance after purchase
        console.log("🔄 Refreshing balance...")
        await fetchBalance()
        setTopUpAmount("")

      } catch (error: any) {
        console.error("❌ Error buying tokens:", error)
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          reason: error.reason,
          stack: error.stack
        })

        let errorMessage = "Failed to purchase tokens"
        if (error.code === 4001) {
          errorMessage = "Transaction was rejected by user"
        } else if (error.code === -32603) {
          errorMessage = "Transaction failed - insufficient funds or network error"
        } else if (error.reason) {
          errorMessage = error.reason
        }

        toast({
          title: "Transaction Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      })
    }
  }

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/appointments/${appointmentId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          message: "Doctor is unavailable at this time."
        })
      })

      if (!res.ok) throw new Error("Failed to reject appointment")

      toast({
        title: "Appointment Rejected",
        description: "The appointment has been cancelled.",
      })

      // Refresh list
      const updated = appointments.filter(a => a.id !== appointmentId)
      setAppointments(updated)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject appointment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptAppointment = async () => {
    if (!selectedAppointment || !proposalData.proposedTime) {
      toast({
        title: "Error",
        description: "Please select a proposed time",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch(`/api/appointments/${selectedAppointment.id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          proposedTime: proposalData.proposedTime,
          estimatedDuration: proposalData.estimatedDuration,
          message: proposalData.message
        })
      })

      if (!res.ok) throw new Error("Failed to accept appointment")

      const data: any = await res.json()

      toast({
        title: "Appointment Accepted",
        description: "Time proposed to patient. Symptoms revealed.",
      })

      // Show symptoms (optional: could show in a dialog)
      console.log("Decrypted Symptoms:", data.data.symptoms)

      setIsResponseDialogOpen(false)
      // Remove from pending list
      setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id))
      setSelectedAppointment(null)

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept appointment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Doctor Profile"
        text="See all things related to you"
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading doctor profile...</div>
        </div>
      ) : !doctorData ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">No doctor profile found. Please register as a doctor.</div>
        </div>
      ) : (
        <div className={`min-h-screen`}>
          <div className="container mx-auto space-y-6 bg-background p-6 text-foreground transition-colors duration-300">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="relative flex justify-between">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Icons.logo className="size-2/3 opacity-20 duration-300 hover:animate-pulse" />
                  </div>
                  <div>
                    <CardHeader className="flex flex-row items-center space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Avatar className="size-20">
                          <AvatarImage
                            src={doctorData?.image}
                            alt={doctorData?.name}
                          />
                          <AvatarFallback>
                            {doctorData?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl">
                          {doctorData?.name}
                        </CardTitle>
                        <CardDescription>
                          {doctorData?.specialty}
                        </CardDescription>
                        {doctorData?.verified && (
                          <Badge className="mt-2 bg-green-500">Verified</Badge>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">ID: {doctorData?.id}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <InfoItem
                        icon={
                          <Mail className="text-green-500 dark:text-green-400" />
                        }
                        label="Email"
                        value={doctorData?.email}
                      />
                      <InfoItem
                        icon={
                          <Phone className="text-yellow-500 dark:text-yellow-400" />
                        }
                        label="Phone"
                        value={doctorData?.phoneNumber}
                      />
                      <InfoItem
                        icon={
                          <FileText className="text-blue-500 dark:text-blue-400" />
                        }
                        label="MBBS ID"
                        value={doctorData?.mbbsId}
                      />
                    </CardContent>
                  </div>
                  <Image
                    src="/illustrations/doctor-1.svg"
                    alt="Health Journey Visualization"
                    width={400}
                    height={300}
                    className="hidden rounded-lg shadow-lg lg:block"
                  />
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">doctor Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {doctorBenefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="flex flex-col items-center rounded-lg bg-secondary p-4 text-center"
                      >
                        {benefit.icon}
                        <h3 className="mt-2 font-semibold">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {benefit.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Blockchain Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InfoItem
                      icon={
                        <Shield className="text-blue-500 dark:text-blue-400" />
                      }
                      label="Block ID"
                      value={doctorData?.blockId}
                    />
                    <div className="mt-4 text-sm text-muted-foreground">
                      Wallet connected and verified on blockchain
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Account Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center text-3xl font-bold">
                          <code className="mr-2 mt-2 text-sm text-secondary-foreground">
                            HTK
                          </code>
                          {balance.toFixed(2)}
                        </div>
                        <span className="flex items-center text-sm text-primary/70">
                          Health Tokens Balance
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="ETH Amount"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="w-28"
                          disabled={isLoading}
                        />
                        <Button
                          onClick={handleTopUp}
                          disabled={isLoading}
                          className="bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Buying...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 size-4" /> Buy HTK
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Rate: 1 ETH = 100 HTK tokens
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Medical Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="appointments" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="appointments">Appointments</TabsTrigger>
                      <TabsTrigger value="prescriptions">
                        Prescriptions
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="appointments">
                      <div className="space-y-4">
                        {appointments.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No pending appointment requests.
                          </p>
                        ) : (
                          appointments.map((appointment, index) => (
                            <motion.div
                              key={appointment.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <Card>
                                <CardContent className="flex items-center justify-between p-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">
                                        Request #{appointment.id.slice(-4)}
                                      </h4>
                                      <Badge
                                        variant={
                                          appointment.urgencyLevel === "high" ? "destructive" :
                                            appointment.urgencyLevel === "medium" ? "default" : "secondary"
                                        }
                                      >
                                        {appointment.urgencyLevel}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Status: {appointment.status}
                                    </p>
                                    <p className="text-sm">
                                      Preferred Times: {appointment.preferredTimes?.length || 0} options
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        setSelectedAppointment(appointment)
                                        setIsResponseDialogOpen(true)
                                      }}
                                    >
                                      Review & Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleRejectAppointment(appointment.id)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="prescriptions">
                      <div className="space-y-4">
                        {prescriptions.map((prescription, index) => (
                          <motion.div
                            key={prescription.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="text-pink-500 dark:text-pink-400" />
                              <span>
                                Issued:{" "}
                                {prescription.issueDate.toLocaleDateString()}
                              </span>
                            </div>
                            <span>
                              Valid till:{" "}
                              {prescription.validTill.toLocaleDateString()}
                            </span>
                          </motion.div>
                        ))}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className="mt-4 w-full border-purple-500 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900"
                          >
                            View All Prescriptions
                          </Button>
                        </motion.div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Respond to Appointment Request</DialogTitle>
            <DialogDescription>
              Propose a time for this appointment. Encrypted symptoms will be revealed upon acceptance.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Patient Preferences</h4>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p><span className="font-semibold">Urgency:</span> {selectedAppointment?.urgencyLevel}</p>
                <div className="mt-2">
                  <p className="font-semibold mb-1">Preferred Times:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {selectedAppointment?.preferredTimes?.map((time: any, i: number) => (
                      <li key={i}>{new Date(time).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="proposedTime">Proposed Time</Label>
              <Input
                id="proposedTime"
                type="datetime-local"
                value={proposalData.proposedTime}
                onChange={(e) => setProposalData(prev => ({ ...prev, proposedTime: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Estimated Duration (mins)</Label>
              <Input
                id="duration"
                type="number"
                value={proposalData.estimatedDuration}
                onChange={(e) => setProposalData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Additional instructions for the patient..."
                value={proposalData.message}
                onChange={(e) => setProposalData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptAppointment} disabled={isLoading}>
              {isLoading ? "Processing..." : "Propose Time & Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <motion.div
      className="flex items-center space-x-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </motion.div>
  )
}
