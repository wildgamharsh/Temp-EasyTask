"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Plus, MapPin, DollarSign, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function PreferencesPage() {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pricingModel, setPricingModel] = useState<"pricing" | "quote">("pricing");
    const [originalPricingModel, setOriginalPricingModel] = useState<"pricing" | "quote">("pricing");
    const [locations, setLocations] = useState<string[]>([]);
    const [originalLocations, setOriginalLocations] = useState<string[]>([]);
    const [newLocation, setNewLocation] = useState("");
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: settings } = await supabase
                    .from('storefront_settings')
                    .select('pricing_display')
                    .eq('organizer_id', user.id)
                    .single();

                if (settings) {
                    const model = settings.pricing_display === false ? "quote" : "pricing";
                    setPricingModel(model);
                    setOriginalPricingModel(model);
                }

                const { data: organizer } = await supabase
                    .from('organizers')
                    .select('locations_covered')
                    .eq('id', user.id)
                    .single();

                if (organizer) {
                    const locs = organizer.locations_covered || [];
                    setLocations(locs);
                    setOriginalLocations(locs);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadSettings();
    }, []);

    useEffect(() => {
        const pricingChanged = pricingModel !== originalPricingModel;
        const locationsChanged = JSON.stringify(locations) !== JSON.stringify(originalLocations);
        setHasChanges(pricingChanged || locationsChanged);
    }, [pricingModel, originalPricingModel, locations, originalLocations]);

    const handlePricingModelChange = (model: "pricing" | "quote") => {
        setPricingModel(model);
    };

    const saveChanges = async () => {
        setIsSaving(true);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("You must be logged in");
                return;
            }

            const pricingDisplay = pricingModel === "pricing";

            // First try to update, if no rows affected then insert
            const { data: existing } = await supabase
                .from('storefront_settings')
                .select('id')
                .eq('organizer_id', user.id)
                .single();

            let error;
            if (existing) {
                // Update existing
                const result = await supabase
                    .from('storefront_settings')
                    .update({ pricing_display: pricingDisplay })
                    .eq('organizer_id', user.id);
                error = result.error;
            } else {
                // Insert new
                const result = await supabase
                    .from('storefront_settings')
                    .insert({ 
                        organizer_id: user.id, 
                        pricing_display: pricingDisplay 
                    });
                error = result.error;
            }

            if (error) {
                console.error("Error saving pricing model:", error);
                throw error;
            }

            // Save locations to organizers table
            const { error: organizerError } = await supabase
                .from('organizers')
                .update({ locations_covered: locations })
                .eq('id', user.id);

            if (organizerError) {
                console.error("Error saving locations:", organizerError);
                throw organizerError;
            }
            
            setOriginalPricingModel(pricingModel);
            setOriginalLocations(locations);
            toast.success("Preferences saved successfully");
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("Failed to save preferences");
            setPricingModel(originalPricingModel);
            setLocations(originalLocations);
        } finally {
            setIsSaving(false);
        }
    };

    const addLocation = () => {
        if (newLocation.trim() && !locations.includes(newLocation.trim())) {
            setLocations([...locations, newLocation.trim()]);
            setNewLocation("");
        }
    };

    const removeLocation = (location: string) => {
        setLocations(locations.filter((l) => l !== location));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure your business settings and preferences
                    </p>
                </div>
                {hasChanges && (
                    <Button onClick={saveChanges} disabled={isSaving} className="gap-2">
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                )}
            </div>

            {/* Locations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Locations
                    </CardTitle>
                    <CardDescription>
                        Add the locations you service. These will be shown to customers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a location..."
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addLocation()}
                        />
                        <Button onClick={addLocation} type="button">
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {locations.map((location) => (
                            <div
                                key={location}
                                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm"
                            >
                                <span>{location}</span>
                                <button
                                    onClick={() => removeLocation(location)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {locations.length === 0 && (
                        <p className="text-sm text-muted-foreground">No locations added yet.</p>
                    )}
                </CardContent>
            </Card>

            {/* Pricing Model */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pricing Model
                    </CardTitle>
                    <CardDescription>
                        Choose how customers will see pricing on your services. This setting controls whether prices are displayed on your storefront.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="space-y-1">
                            <Label className="text-base font-medium">Pricing</Label>
                            <p className="text-sm text-muted-foreground">
                                Show fixed prices for services
                            </p>
                        </div>
                        <Switch
                            checked={pricingModel === "pricing"}
                            onCheckedChange={() => handlePricingModelChange("pricing")}
                            disabled={isSaving}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="space-y-1">
                            <Label className="text-base font-medium">Quote</Label>
                            <p className="text-sm text-muted-foreground">
                                Customers request a quote (price hidden)
                            </p>
                        </div>
                        <Switch
                            checked={pricingModel === "quote"}
                            onCheckedChange={() => handlePricingModelChange("quote")}
                            disabled={isSaving}
                        />
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                            <span className="font-medium">Current mode:</span>{" "}
                            {pricingModel === "pricing" ? "Pricing" : "Quote"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
