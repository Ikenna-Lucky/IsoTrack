"use client";

import { useAuthStore } from "@/store/auth";
import { useBusinessProfile } from "@/hooks/use-business";
import { useDriverProfile } from "@/hooks/use-driver";

export interface CompletionItem {
  key: string;
  label: string;
  description: string;
  done: boolean;
}

export interface ProfileCompletion {
  items: CompletionItem[];
  completedCount: number;
  totalCount: number;
  percentage: number;
  isComplete: boolean;
  settingsPath: string;
  isLoading: boolean;
}

export function useBusinessProfileCompletion(): ProfileCompletion {
  const user = useAuthStore((s) => s.user);
  const { data: biz, isLoading } = useBusinessProfile();

  const items: CompletionItem[] = [
    {
      key: "phone",
      label: "Contact phone number",
      description: "So we can reach you if there's a delivery issue",
      done: !!user?.phone?.trim(),
    },
    {
      key: "address",
      label: "Business address",
      description: "Street, city, and state of your business",
      done: !!(
        (biz?.address as { street?: string; city?: string } | null)?.street?.trim() &&
        (biz?.address as { street?: string; city?: string } | null)?.city?.trim()
      ),
    },
    {
      key: "businessName",
      label: "Business name",
      description: "Your official trading name",
      done: !!biz?.businessName?.trim(),
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  return {
    items,
    completedCount,
    totalCount: items.length,
    percentage: Math.round((completedCount / items.length) * 100),
    isComplete: completedCount === items.length,
    settingsPath: "/business/settings",
    isLoading,
  };
}

export function useDriverProfileCompletion(): ProfileCompletion {
  const user = useAuthStore((s) => s.user);
  const { data: driver, isLoading } = useDriverProfile();

  const items: CompletionItem[] = [
    {
      key: "phone",
      label: "Phone number",
      description: "Required so customers and support can contact you",
      done: !!user?.phone?.trim(),
    },
    {
      key: "emergencyContact",
      label: "Emergency contact",
      description: "A person we can call if something happens to you on the road",
      done: !!user?.emergencyContact?.trim(),
    },
    {
      key: "vehicleModel",
      label: "Vehicle model",
      description: "Helps customers identify your vehicle at pickup",
      done: !!driver?.vehicleModel?.trim(),
    },
    {
      key: "vehicleColor",
      label: "Vehicle colour",
      description: "Helps customers and businesses recognise your vehicle",
      done: !!driver?.vehicleColor?.trim(),
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  return {
    items,
    completedCount,
    totalCount: items.length,
    percentage: Math.round((completedCount / items.length) * 100),
    isComplete: completedCount === items.length,
    settingsPath: "/driver/settings",
    isLoading,
  };
}

export function useCustomerProfileCompletion(): ProfileCompletion {
  const user = useAuthStore((s) => s.user);

  const items: CompletionItem[] = [
    {
      key: "phone",
      label: "Phone number",
      description: "So drivers can call you when they arrive for delivery",
      done: !!user?.phone?.trim(),
    },
    {
      key: "name",
      label: "Full name",
      description: "Your real name for delivery identification",
      done: !!user?.name?.trim() && user.name.trim().includes(" "),
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  return {
    items,
    completedCount,
    totalCount: items.length,
    percentage: Math.round((completedCount / items.length) * 100),
    isComplete: completedCount === items.length,
    settingsPath: "/customer/settings",
    isLoading: false,
  };
}
