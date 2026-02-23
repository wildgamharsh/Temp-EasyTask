"use client";

import * as React from "react";
import { Check, ChevronDown, Smartphone } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";

type PhoneInputProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> &
    Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
        onChange?: (value: RPNInput.Value) => void;
    };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
    React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
        ({ className, onChange, ...props }, ref) => {
            const [open, setOpen] = React.useState(false);

            return (
                <RPNInput.default
                    ref={ref}
                    className={cn("flex", className)}
                    flagComponent={FlagComponent}
                    countrySelectComponent={CountrySelect}
                    inputComponent={InputComponent}
                    international={true}
                    withCountryCallingCode={true}
                    onChange={(value) => onChange?.((value as RPNInput.Value) || ("" as RPNInput.Value))}
                    {...props}
                />
            );
        }
    );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, ...props }, ref) => (
        <div className="relative flex items-center w-full">
            <Input
                className={cn(
                    "rounded-l-none rounded-r-3xl pr-12 h-14 bg-slate-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base",
                    className
                )}
                {...props}
                ref={ref}
            />
            <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
    )
);
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
    disabled?: boolean;
    value: RPNInput.Country;
    onChange: (value: RPNInput.Country) => void;
    options: CountrySelectOption[];
};

const CountrySelect = ({
    disabled,
    value,
    onChange,
    options,
}: CountrySelectProps) => {
    const [open, setOpen] = React.useState(false);
    const handleSelect = React.useCallback(
        (country: RPNInput.Country) => {
            onChange(country);
            setOpen(false);
        },
        [onChange]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                        "flex gap-1 rounded-l-3xl rounded-r-none h-14 border-0 bg-slate-50 border-r border-slate-200 pl-4 pr-3 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
                    )}
                    disabled={disabled}
                >
                    <FlagComponent country={value} countryName={value} />
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 text-slate-400 opacity-50",
                            open ? "rotate-180" : ""
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 rounded-2xl" align="start">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <ScrollArea className="h-72">
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {options
                                    .filter((x) => x.value)
                                    .map((option) => (
                                        <CommandItem
                                            className="gap-2"
                                            key={option.value}
                                            value={option.label}
                                            onSelect={() => handleSelect(option.value)}
                                        >
                                            <FlagComponent
                                                country={option.value}
                                                countryName={option.label}
                                            />
                                            <span className="flex-1 text-sm truncate">
                                                {option.label}
                                            </span>
                                            {option.value && (
                                                <span className="text-foreground/50 text-sm shrink-0">
                                                    {`+${RPNInput.getCountryCallingCode(option.value)}`}
                                                </span>
                                            )}
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    option.value === value
                                                        ? "opacity-100 text-brand-600"
                                                        : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
    const Flag = flags[country];

    return (
        <span className="flex h-5 w-7 overflow-hidden rounded-sm shadow-sm shrink-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover">
            {Flag && <Flag title={countryName} />}
        </span>
    );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
