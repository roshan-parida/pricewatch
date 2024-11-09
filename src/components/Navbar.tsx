import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
    return (
        <header className="w-full fixed z-10 top-0 left-0 bg-white shadow-md">
            <nav className="nav">
                <Link
                    href="/"
                    className="flex items-center gap-2"
                    aria-label="Go to homepage"
                >
                    <Image
                        src="/pricewatch.svg"
                        alt="PriceWatch Logo"
                        width={27}
                        height={27}
                        className="transition-all duration-300 ease-in-out"
                    />

                    <p className="nav-logo text-xl font-semibold transition-colors duration-300 ease-in-out hover:text-primary">
                        Price<span className="text-primary">Watch</span>
                    </p>
                </Link>
            </nav>
        </header>
    );
};
