"use client";

import { useEffect } from "react";

export function ClientBody({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Add smooth scroll behavior and any client-side initialization
        document.documentElement.classList.add("scroll-smooth");
    }, []);

    return (
        <body className="font-roboto antialiased bg-navy-dark text-white">
            {children}
        </body>
    );
}
