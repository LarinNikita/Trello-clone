import { createBoard } from "@/actions/create-board";
import { useAction } from "@/hooks/use-action";

export const Form = () => {
    const { execute, fieldErrors } = useAction(createBoard, {
        onSuccess: (data) => {
            console.log(data, "SUCCESS");
        },
        onError: (error) => {
            console.error(error);
        },
    });

    const onSubmit = (formData: FormData) => {
        const title = formData.get("title") as string;

        execute({ title });
    }

    return (
        <form action={onSubmit}>

        </form>
    );
};