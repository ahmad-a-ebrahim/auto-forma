import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
