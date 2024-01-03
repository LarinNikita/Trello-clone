import { db } from "@/lib/db";

export async function deleteBoard(id: string) {
    await db.board.delete({
        where: {
            id
        }
    })
}