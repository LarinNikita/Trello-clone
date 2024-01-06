'use client';

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { ListWithCards } from "@/types";
import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order";

import { ListForm } from "./list-form";
import { ListItem } from "./list-item";

interface ListContainerProps {
    data: ListWithCards[];
    boardId: string;
};

// 1. Функция reorder принимает массив list, начальный индекс startIndex и конечный индекс endIndex.
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    // 2. Внутри функции создаётся копия list с использованием Array.from(list).Это делается для того, чтобы мы не изменяли переданный массив напрямую.
    const result = Array.from(list);
    // 3. Затем из копии массива удаляется элемент с индексом startIndex с помощью result.splice(startIndex, 1), и этот элемент сохраняется в переменную removed.
    const [removed] = result.splice(startIndex, 1);
    // 4. Далее элемент, который мы удалили(removed), вставляется обратно в массив на позицию endIndex с помощью result.splice(endIndex, 0, removed).
    result.splice(endIndex, 0, removed);

    // 5. В конце возвращается изменённый массив.
    return result;
};

export const ListContainer = ({
    data,
    boardId,
}: ListContainerProps) => {
    const [orderedData, setOrderedData] = useState(data);

    const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
        onSuccess: () => {
            toast.success("List reordered");
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess: () => {
            toast.success("Card reordered");
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    useEffect(() => {
        setOrderedData(data);
    }, [data]);

    const onDragEnd = (result: any) => {
        // 1. Мы извлекаем destination, source и type из объекта result.
        const { destination, source, type } = result;

        // 2. Проверяем, был ли установлен destination (целевое место) - если нет, то ничего не делаем.
        if (!destination) {
            return;
        }

        // Если перетаскиваем в то же положение, то ничего не меняем
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Перетаскиваем список
        // 3. Если тип(type) равен "list", мы вызываем функцию reorder, передавая ей orderedData(предположительно массив) вместе с source.index(начальный индекс) и destination.index(конечный индекс).
        // 4. Результат reorder предположительно модифицируется, чтобы каждому элементу присваивался соответствующий порядковый номер, и этот результат сохраняется в items.
        if (type === "list") {
            const items = reorder(
                orderedData,
                source.index,
                destination.index,
            ).map((item, index) => ({ ...item, order: index }));

            // 5. Новый массив items устанавливается в orderedData.
            setOrderedData(items);
            executeUpdateListOrder({
                items,
                boardId
            });
        }

        // Перетаскиваем эдементы в списках
        if (type === "card") {
            // 1. Создаётся копия массива orderedData с помощью оператора spread (...), и эта копия сохраняется в переменной newOrderedData. Это делается, чтобы мы не изменяли исходный массив напрямую.
            let newOrderedData = [...orderedData];

            // Источник и целевое место в списке
            // 2. Затем мы пытаемся найти источник (sourceList) и целевое место (destList) в массиве newOrderedData, используя метод find. Мы ищем элементы, у которых id соответствует source.droppableId и destination.droppableId соответственно.
            const sourceList = newOrderedData.find(list => list.id === source.droppableId);
            const destList = newOrderedData.find(list => list.id === destination.droppableId);

            // Если источника или целевого места нет, то ничего не делаем
            if (!sourceList || !destList) {
                return;
            }

            // 4. Дальше идут две проверки, где мы удостоверяемся, что в источнике(sourceList) и целевом месте(destList) существуют списки карточек(cards).Если они не существуют, мы присваиваем этим переменным пустые массивы.

            // Проверяем существование элемента в источнике списка
            if (!sourceList.cards) {
                sourceList.cards = [];
            }

            // Проверяем существование элемента в целевом месте списка
            if (!destList.cards) {
                destList.cards = [];
            }

            // Сценарий, когда элемент перетаскивается внутри одного и того же списка, и в результате происходит переупорядочивание карточек в этом списке и отправка обновленных данных на сервер.
            if (source.droppableId === destination.droppableId) {
                // 1. Внутри условия мы вызываем функцию reorder, передавая ей sourceList.cards (предположительно массив карточек из источника), source.index (начальный индекс) и destination.index (конечный индекс). Это, скорее всего, переупорядочивает карточки внутри источника в соответствии с изменением позиции.
                const reorderedCards = reorder(
                    sourceList.cards,
                    source.index,
                    destination.index
                );

                // 2. После этого мы используем метод forEach для перебора reorderedCards (переупорядоченные карточки) и устанавливаем каждой карточке свойство order, которое соответствует ее индексу в массиве.
                reorderedCards.forEach((card, idx) => {
                    card.order = idx;
                });

                // 3. Затем мы обновляем sourceList.cards новым переупорядоченным массивом reorderedCards.
                sourceList.cards = reorderedCards;

                // 4. Далее мы вызываем setOrderedData с newOrderedData. Предположительно, это обновляет состояние данных в приложении, включая изменения внесенные в sourceList.cards.
                setOrderedData(newOrderedData);
                executeUpdateCardOrder({
                    boardId: boardId,
                    items: reorderedCards
                });

                // Сценарий, когда элемент перетаскивается в другой список, и в результате происходит переупорядочивание карточек в обоих списках и отправка обновленных данных на сервер.
            } else {
                // Убираем элемент и списка (изначального)
                const [movedCard] = sourceList.cards.splice(source.index, 1);

                // Назначаем новый listId перемещаемогу элементу
                movedCard.listId = destination.droppableId;

                // Добавдяем элемент в другой список
                destList.cards.splice(destination.index, 0, movedCard);

                // Переупорядычиваем элементы в списке (изначальном)
                sourceList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                // Обновляем порядок элементов в целевом месте списка
                destList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                setOrderedData(newOrderedData);
                executeUpdateCardOrder({
                    boardId: boardId,
                    items: destList.cards
                });
            }
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
                droppableId="lists"
                type="list"
                direction="horizontal"
            >
                {(provided) => (
                    <ol
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex gap-x-3 h-full"
                    >
                        {orderedData.map((list, index) => {
                            return (
                                <ListItem
                                    key={list.id}
                                    index={index}
                                    data={list}
                                />
                            )
                        })}
                        {provided.placeholder}
                        <ListForm />
                        <div className="flex-shrink-0 w-1" />
                    </ol>
                )}
            </Droppable>
        </DragDropContext>
    );
};