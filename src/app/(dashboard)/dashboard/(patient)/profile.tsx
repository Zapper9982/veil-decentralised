"use client"

import Image from "next/image"
import { PatientDashboardData } from "@/types"
import { motion } from "framer-motion"
import {
  Activity,
  Calendar,
  Droplet,
  Heart,
  Mail,
  Phone,
  Shield,
  User,
  Zap,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"

import { HealthTokenBalance } from "./token-operations"

export default function PatientProfile({
  patientData,
}: {
  patientData: PatientDashboardData
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
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
                      src={patientData.image || ""}
                      alt={patientData.name || ""}
                    />
                    <AvatarFallback>
                      {patientData.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <CardTitle className="text-2xl">{patientData.name}</CardTitle>
                  <CardDescription>{patientData.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <InfoItem
                  icon={<User className="text-blue-500 dark:text-blue-400" />}
                  label="Gender"
                  value={patientData.gender}
                />
                <InfoItem
                  icon={
                    <Calendar className="text-green-500 dark:text-green-400" />
                  }
                  label="Date of Birth"
                  value={patientData.dateOfBirth.toLocaleDateString()}
                />
                <InfoItem
                  icon={
                    <Droplet className="text-red-500 dark:text-red-400" />
                  }
                  label="Blood Type"
                  value={patientData.bloodType}
                />
                <InfoItem
                  icon={
                    <Activity className="text-yellow-500 dark:text-yellow-400" />
                  }
                  label="Chronic Diseases"
                  value={patientData.chronicDiseases.join(", ")}
                />
                <InfoItem
                  icon={
                    <Phone className="text-purple-500 dark:text-purple-400" />
                  }
                  label="Emergency Contact"
                  value={patientData.emergencyContact}
                />
              </CardContent>
            </div>
            <Image
              src="/illustrations/health-journey.svg"
              alt="Health Journey Visualization"
              width={400}
              height={300}
              className="hidden rounded-lg shadow-lg lg:block"
            />
          </Card>
        </motion.div>
      </div>
      <div className="space-y-6">
        <HealthTokenBalance />
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
