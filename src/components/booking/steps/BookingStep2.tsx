"use client";

import { Booking, Service } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
// import { TimePicker } from "@/components/ui/time-picker"; // Mock

interface BookingStepProps {
    service: Service;
    bookingData: Partial<Booking>;
    onNext: (data: Partial<Booking>) => void;
    onBack: () => void;
}

export function BookingStep2({ service, bookingData, onNext, onBack }: BookingStepProps) {
    const [date, setDate] = useState<Date | null>(bookingData.event_date ? new Date(bookingData.event_date) : null);
    const [time, setTime] = useState(bookingData.event_time || "12:00");

    const handleNext = () => {
        if (date && time) {
            onNext({
                event_date: date.toISOString(),
                event_time: time
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Select Date & Time</h3>
                <p className="text-sm text-slate-500">Choose when you want this event to take place.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <Label className="mb-2 block">Event Date</Label>
                    <div className="border rounded-md p-4 flex justify-center bg-white">
                        <DatePicker
                            selected={date}
                            onChange={(d: Date | null) => setDate(d)}
                            inline
                            minDate={new Date()}
                            calendarClassName="!shadow-none !border-0"
                        />
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <Label className="mb-2 block">Event Time</Label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full text-lg p-3 h-12"
                        />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-700">
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        Availability is checked in real-time.
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={handleNext} disabled={!date || !time} className="bg-brand-600 hover:bg-brand-700">
                    Continue <i className="fa-solid fa-arrow-right ml-2"></i>
                </Button>
            </div>
        </div>
    );
}
