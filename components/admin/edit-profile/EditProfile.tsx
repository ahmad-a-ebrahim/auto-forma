"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getSession, useSession } from "next-auth/react";

const schema = z
  .object({
    name: z.string().min(1, "Required"),
    email: z.string().min(1, "Required").email(),
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
    passwordConfirmation: z.string().optional(),
    image: z
      .any()
      .refine((file) => !file || file?.length === 1, "Required")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword) {
      if (!data.oldPassword) {
        ctx.addIssue({
          path: ["oldPassword"],
          code: "custom",
          message: "Old password is required",
        });
      }
      if (data.newPassword.length < 8) {
        ctx.addIssue({
          path: ["newPassword"],
          code: "custom",
          message: "New password must be at least 8 characters",
        });
      }
      if (data.newPassword !== data.passwordConfirmation) {
        ctx.addIssue({
          path: ["passwordConfirmation"],
          code: "custom",
          message: "Passwords do not match",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

export default function EditProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const session = useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      oldPassword: "",
      newPassword: "",
      passwordConfirmation: "",
      image: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    if (values.oldPassword) formData.append("oldPassword", values.oldPassword);
    if (values.newPassword) formData.append("newPassword", values.newPassword);
    if (values.image && values.image[0]) {
      formData.append("image", values.image[0]);
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data?.error || "Something went wrong",
        });
      } else {
        await getSession();
        toast({
          variant: "success",
          title: "Success",
          description: "Profile updated",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    form.reset({
      name: session.data?.user?.name || "",
      email: session.data?.user?.email || "",
      oldPassword: "",
      newPassword: "",
      passwordConfirmation: "",
      image: undefined,
    });
  }, [form, session]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-4 border rounded-md w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Old Password */}
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Old Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter old password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Confirmation */}
          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}
