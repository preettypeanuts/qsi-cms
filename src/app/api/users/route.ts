import { createUser, createUserSchema, getUsers } from "@/lib/users";

export async function GET() {
  const users = await getUsers();

  return Response.json({ data: users });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = createUserSchema.safeParse(payload);

  if (!result.success) {
    return Response.json(
      { error: "Invalid user payload.", issues: result.error.issues },
      { status: 400 },
    );
  }

  try {
    const user = await createUser(result.data);

    return Response.json({ data: user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create user.";

    return Response.json({ error: message }, { status: 500 });
  }
}
