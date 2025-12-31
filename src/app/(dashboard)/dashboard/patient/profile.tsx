"use client"

import { useEffect, useState } from "react"
import { PatientDashboardData } from "@/types"
import { motion } from "framer-motion"
import {
  Activity,
  Calendar,
  Copy,
  Droplet,
  Heart,
  Shield,
  User,
  Wallet,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import { ethers } from "ethers"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { getHealthTokenContract, getSigner } from "@/lib/web3"

import { HealthTokenBalance } from "./token-operations"

export default function PatientProfile({
  patientData,
}: {
  patientData: PatientDashboardData
}) {
  const { toast } = useToast()
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [tokenBalance, setTokenBalance] = useState<string>("0")
  const [isLoadingBlockchain, setIsLoadingBlockchain] = useState(true)

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        setIsLoadingBlockchain(true)
        const signer = await getSigner()
        if (signer) {
          const address = await signer.getAddress()
          setWalletAddress(address)

          // Fetch token balance
          const tokenContract = await getHealthTokenContract()
          const balanceWei = await tokenContract.balanceOf(address)
          const balanceEth = ethers.formatEther(balanceWei)
          setTokenBalance(balanceEth)
        }
      } catch (error) {
        console.error("Failed to fetch blockchain data:", error)
      } finally {
        setIsLoadingBlockchain(false)
      }
    }

    fetchBlockchainData()
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main Profile Section */}
      <div className="md:col-span-2 space-y-6">
        {/* Header Card with Profile Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <motion.div
                  className="-mt-16 relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="size-32 border-4 border-background">
                    <AvatarImage
                      src={patientData.image || ""}
                      alt={patientData.name || ""}
                    />
                    <AvatarFallback className="text-4xl">
                      {patientData.name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-2 right-2 size-6 bg-green-500 rounded-full border-4 border-background" />
                </motion.div>
                <div className="flex-1 pb-2">
                  <h2 className="text-3xl font-bold">{patientData.name}</h2>
                  <p className="text-muted-foreground">{patientData.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Heart className="size-3" />
                      Patient
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-green-500" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your health and contact details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <InfoItem
                icon={<User className="text-blue-500" />}
                label="Gender"
                value={patientData.gender}
              />
              <InfoItem
                icon={<Calendar className="text-green-500" />}
                label="Date of Birth"
                value={patientData.dateOfBirth.toLocaleDateString()}
              />
              <InfoItem
                icon={<Droplet className="text-red-500" />}
                label="Blood Type"
                value={patientData.bloodType ?? "N/A"}
              />
              <InfoItem
                icon={<Activity className="text-yellow-500" />}
                label="Emergency Contact"
                value={patientData.emergencyContact}
              />
              <div className="md:col-span-2">
                <div className="flex items-start gap-2">
                  <Activity className="size-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Chronic Diseases</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {patientData.chronicDiseases.length > 0 ? (
                        patientData.chronicDiseases.map((disease, idx) => (
                          <Badge key={idx} variant="outline">
                            {disease}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None reported</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Blockchain Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Blockchain Information
              </CardTitle>
              <CardDescription>Your on-chain identity and assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingBlockchain ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading blockchain data...
                </div>
              ) : (
                <>
                  {/* Wallet Address */}
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Wallet className="size-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium">Wallet Address</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(walletAddress)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(walletAddress, "Wallet address")}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>

                  {/* Block ID */}
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Shield className="size-5 text-cyan-500" />
                      <div>
                        <p className="text-sm font-medium">Block ID</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(patientData.blockId)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(patientData.blockId, "Block ID")}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>

                  {/* Token Balance */}
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-500/10">
                          <Icons.logo className="size-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">HTK Token Balance</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {parseFloat(tokenBalance).toFixed(2)} HTK
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="#token-operations">
                          <ExternalLink className="size-4 mr-2" />
                          Manage
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Network Status */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                    Connected to Hardhat Network
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6" id="token-operations">
        <HealthTokenBalance />

        {/* Quick Stats Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatItem label="Total Appointments" value="0" />
              <StatItem label="Active Prescriptions" value="0" />
              <StatItem label="Medical Records" value="0" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | undefined
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "N/A"}</p>
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-bold text-lg">{value}</span>
    </div>
  )
}
