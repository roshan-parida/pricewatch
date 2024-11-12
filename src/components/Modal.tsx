"use client";

import { FormEvent, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { addUserEmailToProduct } from "@/lib/actions";
import Image from "next/image";

interface Props {
    productId: string;
}

export const Modal = ({ productId }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEmailError("");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);
        await addUserEmailToProduct(productId, email);
        setIsSubmitting(false);
        setEmail("");
        closeModel();
    };

    const openModel = () => setIsOpen(true);
    const closeModel = () => setIsOpen(false);

    return (
        <>
            <button type="button" className="btn" onClick={openModel}>
                Track
            </button>

            <Dialog
                open={isOpen}
                as="div"
                className="dialog-container"
                onClose={closeModel}
            >
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel transition className="dialog-content">
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center">
                                    <div className="p-3 border border-gray-200 rounded-10">
                                        <Image
                                            src="/pricewatch.png"
                                            alt="logo"
                                            width={28}
                                            height={28}
                                        />
                                    </div>
                                    <Icon
                                        icon="solar:close-circle-outline"
                                        className="size-8 cursor-pointer"
                                        onClick={closeModel}
                                        aria-label="Close modal"
                                    />
                                </div>

                                <h4 className="dialog-head_text">
                                    Stay updated with product pricing alerts
                                    right in your inbox!
                                </h4>

                                <p className="text-sm text-gray-600 mt-2">
                                    Never miss a bargain again with timely
                                    alerts!
                                </p>
                            </div>

                            <form
                                className="flex flex-col mt-5"
                                onSubmit={handleSubmit}
                            >
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </label>
                                <div className="dialog-input_container">
                                    <Icon
                                        icon="solar:letter-outline"
                                        className="w-18 h-18"
                                    />
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        className="dialog-input"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                {emailError && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {emailError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="dialog-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Track"}
                                </button>
                            </form>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
};
