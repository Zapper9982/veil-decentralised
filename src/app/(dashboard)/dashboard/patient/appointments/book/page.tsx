"use client"

import { useEffect, useState } from "react"
import { DoctorData } from "@/types"
import axios from "axios"
import { format } from "date-fns"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

interface AppointmentFormData {
  symptoms: string
  preferredTimes: string[] // Array of datetime ISOs
  urgencyLevel: "low" | "medium" | "high"
}

// API Functions
const getDoctorRecommendation = async (symptoms: string): Promise<string> => {
  try {
    const response = await fetch("http://127.0.0.1:5000/get_recommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem: symptoms }),
    })

    if (!response.ok) throw new Error("Failed to get recommendation")

    const data = await response.json() as { doctors?: string[] }
    return data?.doctors?.[0] ?? "Neurosurgeon"
  } catch (error) {
    console.error("Recommendation error:", error)
    throw error
  }
}

export default function AppointmentBookingPage() {
  // State
  const [doctors, setDoctors] = useState<DoctorData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null)
  const [formData, setFormData] = useState<AppointmentFormData>({
    symptoms: "",
    preferredTimes: [],
    urgencyLevel: "medium",
  })
  const [tempTime, setTempTime] = useState({ date: "", time: "" })
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingDoctors, setIsFetchingDoctors] = useState(true)

  const { toast } = useToast()

  // Effects
  useEffect(() => {
    fetchDoctors()
  }, [])

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setIsFetchingDoctors(true)
      const response = await axios.get("/api/doctors")
      setDoctors(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch doctors. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsFetchingDoctors(false)
    }
  }

  // Filter doctors based on search
  const filteredDoctors = doctors.filter((doctor) => {
    const searchTerm = searchQuery.toLowerCase()
    return (
      doctor?.name?.toLowerCase().includes(searchTerm) ||
      doctor.specialty.toLowerCase().includes(searchTerm)
    )
  })

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAIRecommendation = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Error",
        description: "Please enter your symptoms",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const specialty = await getDoctorRecommendation(symptoms)
      setSearchQuery(specialty)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI recommendation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPreferredTime = () => {
    if (!tempTime.date || !tempTime.time) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      })
      return
    }

    const datetime = new Date(`${tempTime.date}T${tempTime.time}`)
    const isoString = datetime.toISOString()

    if (!formData.preferredTimes.includes(isoString)) {
      setFormData(prev => ({
        ...prev,
        preferredTimes: [...prev.preferredTimes, isoString]
      }))
      setTempTime({ date: "", time: "" })
    }
  }

  const handleRemovePreferredTime = (timeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.filter(t => t !== timeToRemove)
    }))
  }

  const handleBookAppointment = async () => {
    console.log("handleBookAppointment called")
    console.log("selectedDoctor:", selectedDoctor)
    console.log("formData:", formData)

    if (!selectedDoctor) {
      console.log("Validation failed: no doctor")
      toast({
        title: "Error",
        description: "Please select a doctor",
        variant: "destructive",
      })
      return
    }

    if (!formData.symptoms || formData.symptoms.length < 10) {
      console.log("Validation failed: symptoms too short")
      toast({
        title: "Error",
        description: "Please describe your symptoms (at least 10 characters)",
        variant: "destructive",
      })
      return
    }

    if (formData.preferredTimes.length === 0) {
      console.log("Validation failed: no preferred times")
      toast({
        title: "Error",
        description: "Please add at least one preferred time slot",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      console.log("Sending API request...")

      const response = await axios.post("/api/appointments", {
        doctorId: selectedDoctor.id,
        symptoms: formData.symptoms,
        preferredTimes: formData.preferredTimes,
        urgencyLevel: formData.urgencyLevel,
      })

      console.log("API response:", response.data)

      toast({
        title: "Success",
        description: "Appointment request sent! Doctor will review and propose a time.",
      })

      setIsBookingDialogOpen(false)
      setFormData({ symptoms: "", preferredTimes: [], urgencyLevel: "medium" })
      setSelectedDoctor(null)
    } catch (error: any) {
      console.error("API error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to book appointment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto space-y-8 p-4">
      <Toaster />
      <h1 className="text-2xl font-bold">Book an Appointment</h1>

      {/* Search Section */}
      <div className="mb-6 flex items-center gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by doctor name or specialty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Ask AI ✨</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI Recommendation ✨</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Describe your symptoms</Label>
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Please describe your symptoms in detail"
                  required
                  rows={6}
                />
              </div>
              <DialogClose>
                <Button
                  type="submit"
                  className="w-full"
                  onClick={handleAIRecommendation}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Getting recommendation..."
                    : "Get Recommendation"}
                </Button>
              </DialogClose>
              <DialogClose>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Doctor List */}
      <section className="space-y-4">
        {isFetchingDoctors ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="relative transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <CardTitle>{doctor.name}</CardTitle>
                <CardDescription>Specialty: {doctor.specialty}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Join Date:</strong>{" "}
                    {format(new Date(doctor.joinDate), "MMMM dd, yyyy")}
                  </p>
                  <p>
                    <strong>Prescriptions Issued:</strong>{" "}
                    {doctor.prescriptionsIssued.toLocaleString()}
                  </p>
                  <Badge variant="outline">{doctor.specialty}</Badge>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    console.log("Book Appointment clicked for:", doctor)
                    setSelectedDoctor(doctor)
                    setIsBookingDialogOpen(true)
                  }}
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No doctors found matching your search criteria.
          </p>
        )}
      </section>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Appointment with {selectedDoctor?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            {/* Symptoms */}
            <div className="grid gap-2">
              <Label>Describe Your Symptoms *</Label>
              <Textarea
                placeholder="Please describe your symptoms in detail (min. 10 characters)..."
                value={formData.symptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.symptoms.length}/10 characters minimum
              </p>
            </div>

            {/* Urgency Level */}
            <div className="grid gap-2">
              <Label>Urgency Level</Label>
              <select
                value={formData.urgencyLevel}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  urgencyLevel: e.target.value as "low" | "medium" | "high"
                }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="low">Low - Routine checkup</option>
                <option value="medium">Medium - Some concern</option>
                <option value="high">High - Urgent attention needed</option>
              </select>
            </div>

            {/* Preferred Times */}
            <div className="grid gap-2">
              <Label>Preferred Time Slots *</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={tempTime.date}
                  onChange={(e) => {
                    console.log("Date changed:", e.target.value)
                    setTempTime(prev => ({ ...prev, date: e.target.value }))
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={tempTime.time}
                  onChange={(e) => {
                    console.log("Time changed:", e.target.value)
                    setTempTime(prev => ({ ...prev, time: e.target.value }))
                  }}
                  className="flex-1"
                />
                <Button onClick={() => {
                  console.log("Add button clicked!")
                  console.log("tempTime:", tempTime)
                  handleAddPreferredTime()
                }} variant="outline">
                  Add
                </Button>
              </div>

              {/* Display preferred times */}
              {formData.preferredTimes.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Your preferred times:</p>
                  {formData.preferredTimes.map((time) => (
                    <div
                      key={time}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span className="text-sm">
                        {new Date(time).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePreferredTime(time)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Add multiple time slots. Doctor will choose one that works.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log("Button clicked!")
                  handleBookAppointment()
                }}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Sending Request..." : "Send Appointment Request"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBookingDialogOpen(false)
                  setFormData({ symptoms: "", preferredTimes: [], urgencyLevel: "medium" })
                  setTempTime({ date: "", time: "" })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
