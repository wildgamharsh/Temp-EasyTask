import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, Clock, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export interface CustomerProfileData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    avatarUrl?: string;
    createdAt: string;
    totalBookings: number;
    lastBookingDate?: Date;
}

interface CustomerProfileProps {
    profile: CustomerProfileData;
    onMessage: () => void;
}

export function CustomerProfile({ profile, onMessage }: CustomerProfileProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Profile</CardTitle>
                <Button size="sm" onClick={onMessage}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4 py-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatarUrl} />
                        <AvatarFallback className="text-2xl">{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h3 className="text-xl font-bold">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">Customer since {format(new Date(profile.createdAt), 'MMMM yyyy')}</p>
                    </div>
                </div>

                <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    {profile.location && (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.location}</span>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Total Bookings</span>
                            <span className="font-bold text-lg">{profile.totalBookings}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Last Booking</span>
                            <span className="font-medium">
                                {profile.lastBookingDate ? format(profile.lastBookingDate, 'MMM d, yyyy') : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
