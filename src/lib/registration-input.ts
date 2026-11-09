import { z } from "zod";

export const registrationInput = (invitation = false) =>
  z
    .object({
      name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
      email: z.string().trim().email("Enter a valid email address"),
      password: z
        .string()
        .min(8, "At least 8 characters required")
        .max(72)
        .regex(/[A-Z]/, "Include at least one uppercase letter")
        .regex(/[0-9]/, "Include at least one number")
        .refine(
          (value) => new TextEncoder().encode(value).length <= 72,
          "Use no more than 72 UTF-8 bytes",
        ),
      role: z.enum(["business", "customer", "driver"]),
      token: z.string().trim().optional(),
      phone: z
        .string()
        .regex(/^\+?[1-9]\d{6,14}$/, "Enter a valid number, e.g. +2348012345678")
        .optional()
        .or(z.literal("")),
      businessName: z.string().trim().max(100).optional(),
      vehicleType: z.enum(["bike", "car", "van", "truck"]).optional(),
      vehiclePlate: z.string().trim().max(20).optional(),
    })
    .superRefine((data, ctx) => {
      if ((data.role === "driver") !== invitation)
        ctx.addIssue({
          code: "custom",
          path: ["role"],
          message: "Drivers must join through a business invitation",
        });
      if (data.role === "business" && (data.businessName?.length ?? 0) < 2)
        ctx.addIssue({
          code: "custom",
          path: ["businessName"],
          message: "Business name must be at least 2 characters",
        });
      if (invitation) {
        if (!/^[A-Za-z0-9_-]{43}$/.test(data.token ?? ""))
          ctx.addIssue({
            code: "custom",
            path: ["token"],
            message: "Enter the invitation token your business shared with you",
          });
        if (!data.vehicleType)
          ctx.addIssue({
            code: "custom",
            path: ["vehicleType"],
            message: "Vehicle type is required",
          });
        if ((data.vehiclePlate?.length ?? 0) < 3)
          ctx.addIssue({
            code: "custom",
            path: ["vehiclePlate"],
            message: "Enter a valid plate number",
          });
      }
    });

export type RegistrationValues = z.infer<ReturnType<typeof registrationInput>>;
