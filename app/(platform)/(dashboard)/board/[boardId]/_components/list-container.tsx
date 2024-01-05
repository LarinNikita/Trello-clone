'use client';

import { ListWithCards } from "@/types";

import { ListForm } from "./list-form";

interface ListContainerProps {
    bordId: string;
    data: ListWithCards[];
}

export const ListContainer = ({
    bordId,
    data
}: ListContainerProps) => {
    return (
        <ol>
            <ListForm />
            <div className="flex-shrink-0 w-1" />
        </ol>
    );
};