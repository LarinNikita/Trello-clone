import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { ListContainer } from "./_components/list-container";

interface BoardIdPageProps {
    params: {
        bordId: string;
    };
};

const BoardPageId = async ({
    params
}: BoardIdPageProps) => {
    const { orgId } = auth();

    if (!orgId) {
        redirect("/select-org");
    }

    const lists = await db.list.findMany({
        where: {
            boardId: params.bordId,
            board: {
                orgId,
            },
        },
        include: {
            cards: {
                orderBy: {
                    order: "asc"
                },
            },
        },
        orderBy: {
            order: "asc",
        },
    });

    return (
        <div className="p-4 h-full overflow-x-auto">
            <ListContainer
                bordId={params.bordId}
                data={lists}
            />
        </div>
    );
}

export default BoardPageId;