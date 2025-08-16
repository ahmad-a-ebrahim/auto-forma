import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { auth } from "@/auth";
import { uploadProfileImage } from "@/lib/uploadProfileImage";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const oldPassword = formData.get("oldPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();

    // Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Partial<typeof users.$inferInsert> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Handle image upload
    if (file) {
      const imageUrl = await uploadProfileImage(session.user.id, file);

      updateData.image = imageUrl;
    }

    // Handle password update
    if (oldPassword && newPassword) {
      const isValid = await compare(oldPassword, user.password!);
      if (!isValid) {
        return Response.json(
          { error: "Old password is incorrect" },
          { status: 400 }
        );
      }
      updateData.password = await hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    await db.update(users).set(updateData).where(eq(users.id, user.id));

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("User update error:", error);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
