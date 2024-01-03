import { useAction } from "@/hooks/use-action";
import { createBoard } from "@/actions/create-board";
import { FormInput } from "@/components/form/form-input";
import { FormSubmit } from "@/components/form/form-submit";

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
            <FormInput
                label="Board Title"
                id="title"
                errors={fieldErrors}
            />
            <FormSubmit>
                Save
            </FormSubmit>
        </form>
    );
};