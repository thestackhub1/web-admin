// Client-side only — no server secrets or database access here

import React from "react";

export type IconName = "logo" | "logo-text" | "google" | "spinner";

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
    size?: number | string;
    className?: string;
}
const LogoIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <defs>
            <linearGradient
                id="stackBlue"
                x1="0"
                y1="0"
                x2="40"
                y2="40"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
            <linearGradient
                id="stackEmerald"
                x1="0"
                y1="0"
                x2="40"
                y2="40"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>
            <linearGradient
                id="stackAmber"
                x1="0"
                y1="0"
                x2="40"
                y2="40"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
            <linearGradient
                id="stackPurple"
                x1="0"
                y1="0"
                x2="40"
                y2="40"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>
        </defs>
        <g>
            <path d="M20 3L6 11L20 19L34 11L20 3Z" fill="url(#stackBlue)" />
            <path
                d="M6 15L20 23L34 15"
                stroke="url(#stackEmerald)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6 23L20 31L34 23"
                stroke="url(#stackAmber)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M20 37V31"
                stroke="url(#stackPurple)"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </g>
    </svg>
);

export function Icon({ name, size = 24, className, ...props }: IconProps) {
    const sizeStyle = { width: size, height: size };

    if (name === "logo") {
        return <LogoIcon className={className} style={sizeStyle} {...props} />;
    }

    return null;
}
