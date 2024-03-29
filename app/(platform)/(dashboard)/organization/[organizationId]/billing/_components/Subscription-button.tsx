'use client';

import { toast } from "sonner";

import { stripeRedirect } from "@/actions/stripe-redirect";
import { useAction } from "@/hooks/use-action";
import { useProModal } from "@/hooks/use-pro-modal";

import { Button } from "@/components/ui/button";

interface SubscriptionbuttonProps {
    isPro: boolean;
};

export const Subscriptionbutton = ({
    isPro
}: SubscriptionbuttonProps) => {
    const proModal = useProModal();

    const { execute, isLoading } = useAction(stripeRedirect, {
        onSuccess: (data) => {
            window.location.href = data;
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const onClick = () => {
        if (isPro) {
            execute({});
        } else {
            proModal.onOpen();
        }
    }

    return (
        <Button
            variant="primary"
            disabled={isLoading}
            onClick={onClick}
        >
            {isPro ? "Manage subcription" : "Upgrade to pro"}
        </Button>
    );
};