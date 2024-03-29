'use server';

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { createdAuditLog } from "@/lib/create-audit-log";

import { InputType, ReturnType } from "./types";
import { CopyList } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return {
            error: "Unauthorized",
        };
    }

    const { id, boardId } = data;
    let list;

    try {
        // находим лист, который хотим скопировать
        const listToCopy = await db.list.findUnique({
            where: {
                id,
                boardId,
                board: {
                    orgId,
                },
            },
            include: {
                cards: true,
            }
        });

        // Проверка на существование листа
        if (!listToCopy) {
            return { error: "List not found" }
        }

        // Находим последний лист, для того чтобы доавить скопированый после него
        const lastList = await db.list.findFirst({
            where: {
                boardId
            },
            orderBy: {
                order: "desc"
            },
            select: {
                order: true
            }
        });

        const newOrder = lastList ? lastList.order + 1 : 1;

        // Создаем новый лист с скопирпованными данными
        list = await db.list.create({
            data: {
                boardId: listToCopy.boardId,
                title: `${listToCopy.title} - Copy`, //добавляем в название "копия"
                order: newOrder, //ставим послидним
                cards: {
                    // добавляем все "карты"
                    createMany: {
                        data: listToCopy.cards.map((card) => ({
                            title: card.title,
                            description: card.description,
                            order: card.order,
                        })),
                    },
                },
            },
            include: {
                cards: true,
            },
        });

        await createdAuditLog({
            entityTitle: list.title,
            entityId: list.id,
            entityType: ENTITY_TYPE.LIST,
            action: ACTION.CREATE
        });
    } catch (error) {
        return {
            error: "Failed to copy"
        }
    };

    revalidatePath(`/board/${boardId}`);
    return { data: list };
};

export const copyList = createSafeAction(CopyList, handler);