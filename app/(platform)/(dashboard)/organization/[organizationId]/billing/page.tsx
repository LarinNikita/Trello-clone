import { checkSubscription } from "@/lib/subcription";

import { Info } from "../_components/info";
import { Separator } from "@/components/ui/separator";
import { Subscriptionbutton } from "./_components/Subscription-button";

const BillingPage = async () => {
    const isPro = await checkSubscription();

    return (
        <div className="w-full">
            <Info isPro={isPro} />
            <Separator className="my-2" />
            <Subscriptionbutton
                isPro={isPro}
            />
        </div>
    );
}

export default BillingPage;