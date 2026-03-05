import { useState, useCallback, type FormEvent } from "react";
import { Shield, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DemoConfig } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Phone numbers must start with +1 and have 11 digits total */
const PHONE_PATTERN = /^\+1\d{10}$/;

const SPEED_OPTIONS = [
  { value: "normal", label: "Normal (live presentation)" },
  { value: "fast", label: "Fast (demo / testing)" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone.replace(/[\s()-]/g, ""));
}

function normalizePhone(raw: string): string {
  return raw.replace(/[\s()-]/g, "");
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DemoSetupProps {
  onStart: (config: DemoConfig, speed: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DemoSetup({ onStart }: DemoSetupProps) {
  const [managerName, setManagerName] = useState("Nick");
  const [managerPhone, setManagerPhone] = useState("");
  const [guardName, setGuardName] = useState("Manny");
  const [guardPhone, setGuardPhone] = useState("");
  const [speed, setSpeed] = useState<"normal" | "fast">("fast");

  const managerPhoneValid = isValidPhone(managerPhone);
  const guardPhoneValid = isValidPhone(guardPhone);
  const formValid =
    managerName.trim().length > 0 &&
    guardName.trim().length > 0 &&
    managerPhoneValid &&
    guardPhoneValid;

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!formValid) return;

      const config: DemoConfig = {
        managerPhone: normalizePhone(managerPhone),
        guardPhone: normalizePhone(guardPhone),
        managerName: managerName.trim(),
        guardName: guardName.trim(),
      };

      const speedMs = speed === "normal" ? 60 : 300;
      onStart(config, speedMs);
    },
    [
      formValid,
      managerPhone,
      guardPhone,
      managerName,
      guardName,
      speed,
      onStart,
    ],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Branding header */}
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                PEGASUS
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered Security Operations Manager
            </p>
          </CardHeader>

          <Separator />

          {/* Form fields */}
          <CardContent className="space-y-6 pt-6">
            <p className="text-sm font-medium text-foreground">
              Set up tonight's demo
            </p>

            {/* Manager section */}
            <fieldset className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="manager-name">Manager Name</Label>
                <Input
                  id="manager-name"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="e.g. Nick"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="manager-phone">Manager Phone</Label>
                <Input
                  id="manager-phone"
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  autoComplete="tel"
                />
                {managerPhone.length > 0 && !managerPhoneValid && (
                  <p className="text-xs text-destructive">
                    Enter a valid US number starting with +1
                  </p>
                )}
              </div>
            </fieldset>

            {/* Guard section */}
            <fieldset className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="guard-name">Guard Name</Label>
                <Input
                  id="guard-name"
                  value={guardName}
                  onChange={(e) => setGuardName(e.target.value)}
                  placeholder="e.g. Manny"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guard-phone">Guard Phone</Label>
                <Input
                  id="guard-phone"
                  type="tel"
                  value={guardPhone}
                  onChange={(e) => setGuardPhone(e.target.value)}
                  placeholder="+1 555 987 6543"
                  autoComplete="tel"
                />
                {guardPhone.length > 0 && !guardPhoneValid && (
                  <p className="text-xs text-destructive">
                    Enter a valid US number starting with +1
                  </p>
                )}
              </div>
            </fieldset>

            {/* Speed selector */}
            <div className="space-y-1.5">
              <Label htmlFor="sim-speed">Simulation Speed</Label>
              <Select
                value={speed}
                onValueChange={(v) => setSpeed(v as "normal" | "fast")}
              >
                <SelectTrigger id="sim-speed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          {/* Footer: submit + help text */}
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={!formValid}
              className="w-full"
            >
              Start Tonight's Simulation
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Pegasus will text both phones during the demo. Manager receives
              approval requests. Guard receives dispatch orders.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
