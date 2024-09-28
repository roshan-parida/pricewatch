import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";

const navIcons = [
    { icon: "bx:search", alt: "search" },
    { icon: "bx:heart", alt: "heart" },
    { icon: "bx:user", alt: "user" },
];

export const Navbar = () => {
    return (
        <header className="w-full fixed z-10">
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
                    {navIcons.map((icon, index) => (
                        <Icon
                            key={index}
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
