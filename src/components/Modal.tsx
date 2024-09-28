"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";

export const Modal = () => {
    let [isOpen, setIsOpen] = useState(false);

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
                                            src="/pricewatch.svg"
                                            alt="logo"
                                            width={28}
                                            height={28}
                                        />
                                    </div>

                                    <Icon
                                        icon="solar:close-circle-outline"
                                        className="size-8 cursor-pointer"
                                        onClick={closeModel}
                                    />
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
};
