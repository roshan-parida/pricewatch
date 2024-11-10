import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
    title: string;
    iconSrc: string;
    value: string;
    borderColor: string;
    iconColor: string;
}

export const PriceInfoCard = ({
    title,
    iconSrc,
    value,
    borderColor,
    iconColor,
}: Props) => {
    return (
        <div
            className={`price-info_card fade-in border ${borderColor} p-4 rounded-lg shadow-md`}
        >
            <p className="text-base text-gray-700 font-semibold">{title}</p>

            <div className="flex gap-2 items-center mt-2">
                <Icon icon={iconSrc} className={`w-6 h-6 ${iconColor}`} />
                <p className="text-2xl font-bold text-secondary">{value}</p>
            </div>
        </div>
    );
};
