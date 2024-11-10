import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Navbar } from "@/components/Navbar";

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
    title: "PriceWatch",
    description:
        "Track product prices effortlessly and save money on your online shopping",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${roboto.className}`}>
                <main className="container mx-auto px-4">
                    <Navbar />
                    {children}
                </main>
            </body>
        </html>
    );
}
