"use client";

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

interface HeroImage {
    imgUrl: string;
    alt: string;
}

const heroImages: HeroImage[] = [
    {
        imgUrl: "/images/hero-1.svg",
        alt: "smartwatch",
    },
    {
        imgUrl: "/images/hero-2.svg",
        alt: "bag",
    },
    {
        imgUrl: "/images/hero-3.svg",
        alt: "lamp",
    },
    {
        imgUrl: "/images/hero-4.svg",
        alt: "air fryer",
    },
    {
        imgUrl: "/images/hero-5.svg",
        alt: "chair",
    },
];

export const HeroCarousel = () => {
    return (
        <div className="hero-carousel">
            <Carousel
                showThumbs={false}
                autoPlay
                infiniteLoop
                interval={3000}
                showArrows={false}
                showStatus={false}
            >
                {heroImages.map((image, index) => (
                    <div key={index}>
                        <Image
                            src={image.imgUrl}
                            alt={image.alt}
                            height={484}
                            width={484}
                            className="object-contain"
                        />
                    </div>
                ))}
            </Carousel>
        </div>
    );
};
