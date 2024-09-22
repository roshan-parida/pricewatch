import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

const navIcons = [
    { icon: "mi:search", alt: "search" },
    { icon: "mi:heart", alt: "heart" },
    { icon: "mi:user", alt: "user" },
];

export const Navbar = () => {
    return (
        <header className="w-full">
            <nav className="nav">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/pricewatch.svg"
                        alt="logo"
                        width={27}
                        height={27}
                    />

                    <p className="nav-logo">
                        Price<span className="text-primary">Watch</span>
                    </p>
                </Link>

                <div className="flex items-center gap-5">
                    {navIcons.map((icon) => (
                        <Icon
                            key={icon.alt}
                            icon={icon.icon}
                            width={28}
                            height={28}
                            className="object-contain"
                        />
                    ))}
                </div>
            </nav>
        </header>
    );
};
