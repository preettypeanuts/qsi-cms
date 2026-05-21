import { deleteUser } from "@/lib/users";

type UserRouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: UserRouteContext) {
  const { userId } = await params;
  const isDeleted = await deleteUser(userId);

  if (!isDeleted) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  return Response.json({ data: { id: userId } });
}
