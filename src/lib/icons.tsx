/*
    Routes images from ./public to a common global variable to be used everywhere else.
    Good for swapping out images using one place instead of having to swap it in many (saves dev time).
*/


// import alertTrianglePath from "public/AlertTriangle.svg";
// import fileIconPath from "public/file.svg";
// import calendarWhiteIconPath from "public/calendar-white.svg";
// import calendarIconPath from "public/calendar.svg";
// import globeIconPath from "public/globe.svg";
// import logoTextIconPath from "public/logotype.svg";
// import windowIconPath from "public/window.svg";

// Images
import calendar1Path from "public/calendar1.png";
import leftTrianglePath from "public/left_triangle.png";
import rightTrianglePath from "public/right_triangle.png";
import logoPSUPath from "public/logo.png";
import tagPath from "public/tag.png";
import horizontalTextPSULogoPath from "public/psu_logo_horizontal_text.png";
import facultyPath from "public/Faculty.svg";
import fileIconPath from "public/file.svg";

// Home Page Carousel
import clockTowerPath from "public/HomePageCarousel/ClockTower.jpg";
import lionShrinePath from "public/HomePageCarousel/LionShrine.jpg";
import nightCampusPath from "public/HomePageCarousel/NightCampus.jpg";
import dayCampusPath from "public/HomePageCarousel/DayCampus.jpg";
import { SVGProps } from "./types";


// Exported Global Variables
export const ClockTower = clockTowerPath;
export const LionShrine = lionShrinePath;
export const NightCampus = nightCampusPath;
export const DayCampus = dayCampusPath;
export const Calendar1 = calendar1Path;
export const LeftTriangle = leftTrianglePath;
export const RightTriangle = rightTrianglePath;
export const PSU_Logo = logoPSUPath;
export const TagsImage = tagPath;
export const HorizontalTextPSULogo = horizontalTextPSULogoPath;
export const FacultyIcon = facultyPath;


// export const LogoIcon = calendarWhiteIconPath;
// export const FileIcon = fileIconPath;
// export const CalendarIcon = calendarIconPath;
// export const GlobeIcon = globeIconPath;
// export const LogoTextIcon = logoTextIconPath;
// export const WindowIcon = windowIconPath;


// SVG Icons
export const AlertTriangleIcon = ({ width, height, fill_color, stroke_width, stroke_color, className }: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    const sw = stroke_width ? stroke_width : "2";
    const fc = fill_color ? fill_color : "none";
    const sc = stroke_color ? stroke_color : "RGB(255,255,255)";

    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 24 24" fill={fc} stroke="currentColor" stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" style={{ color: sc }} >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line >
            <line x1="12" y1="17" x2="12.01" y2="17" ></line>
        </svg >
    );
};

export const LogoIcon = ({ width, height, fill_color, stroke_width, stroke_color, className }: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    // const sw = stroke_width ? stroke_width : "2";
    // const fc = fill_color ? fill_color : "none";
    // const sc = stroke_color ? stroke_color : "RGB(255,255,255)";

    return (
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width={w} height={h} viewBox="0 0 1080 1080" xmlSpace="preserve">
            <g transform="matrix(1 0 0 1 540 540)" id="818f8aa6-e5fa-4c10-8eb4-045630dbe120"  >
                <rect stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="#FFFFFF" fillRule="nonzero" opacity={1} visibility={"hidden"} vectorEffect={"non-scaling-stroke"} x="-540" y="-540" rx="0" ry="0" width="1080" height="1080" />
            </g>
            <g transform="matrix(1 0 0 1 540 540)" id="0e2e2685-60e2-462a-bb70-ac45ab9dbef6"  >
            </g>
            <g transform="matrix(1 0 0 1 540 540)"  >
                <g vectorEffect={"non-scaling-stroke"}   >
                    <g transform="matrix(1.31 0 0 1.31 206.25 206.25)"  >
                        <path stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} transform=" translate(-463.78, -463.78)" d="M 612 463.781 C 612 393.439 562.982 334.582 497.25 319.40200000000004 C 486.487 316.92 475.299 315.56200000000007 463.781 315.56200000000007 C 460.563 315.56200000000007 457.384 315.7010000000001 454.219 315.90200000000004 C 382.39 320.482 324.494 376.19300000000004 316.529 447.047 C 315.912 452.54100000000005 315.563 458.12 315.563 463.781 C 315.563 474.443 316.715 484.833 318.852 494.859 C 333.139 561.792 392.584 612 463.781 612 C 545.641 612 612 545.641 612 463.781 z M 463.781 561.797 C 409.648 561.797 365.765 517.914 365.765 463.781 C 365.765 409.648 409.64799999999997 365.765 463.781 365.765 C 517.914 365.765 561.797 409.64799999999997 561.797 463.781 C 561.797 517.914 517.914 561.797 463.781 561.797 z" />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 175 175)"  >
                        <polygon stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} points="43.03,-43.03 9.56,-43.03 9.56,9.56 -43.03,9.56 -43.03,43.03 43.03,43.03 43.03,9.56 43.03,9.56 " />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 -246.87 -326.56)"  >
                        <path stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} transform=" translate(-117.14, -56.18)" d="M 109.969 0 C 100.741 0 93.23499999999999 7.507 93.23499999999999 16.734 L 93.23499999999999 54.984 L 93.23499999999999 95.625 C 93.23499999999999 104.853 100.74099999999999 112.35900000000001 109.969 112.35900000000001 L 124.31299999999999 112.35900000000001 C 133.541 112.35900000000001 141.047 104.852 141.047 95.625 L 141.047 54.984 L 141.047 16.734 C 141.047 7.507 133.541 0 124.312 0 L 109.969 0 z" />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 96.88 -326.56)"  >
                        <path stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} transform=" translate(-380.11, -56.18)" d="M 372.938 0 C 363.71 0 356.204 7.507 356.204 16.734 L 356.204 54.984 L 356.204 95.625 C 356.204 104.853 363.711 112.35900000000001 372.938 112.35900000000001 L 387.282 112.35900000000001 C 396.51 112.35900000000001 404.01599999999996 104.852 404.01599999999996 95.625 L 404.01599999999996 54.984 L 404.01599999999996 16.734 C 404.016 7.507 396.509 0 387.281 0 L 372.938 0 z" />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 -75 -40.63)"  >
                        <path stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} transform=" translate(-248.63, -274.92)" d="M 38.25 494.859 L 274.922 494.859 C 272.589 483.25899999999996 271.35 471.27299999999997 271.35 459 C 271.35 454.979 271.52700000000004 451.001 271.785 447.047 L 71.719 447.047 C 55.873999999999995 447.047 43.03099999999999 434.204 43.03099999999999 418.35900000000004 L 43.03099999999999 188.85900000000004 L 454.219 188.85900000000004 L 454.219 277.56600000000003 C 457.384 277.403 460.573 277.31300000000005 463.781 277.31300000000005 C 475.218 277.31300000000005 486.391 278.422 497.25 280.45400000000006 L 497.25 93.234 C 497.25 72.11 480.124 54.983999999999995 459 54.983999999999995 L 427.922 54.983999999999995 L 427.922 95.625 C 427.922 118.035 409.692 136.266 387.281 136.266 L 372.937 136.266 C 350.527 136.266 332.296 118.035 332.296 95.625 L 332.296 54.984 L 164.953 54.984 L 164.953 95.625 C 164.953 118.035 146.722 136.266 124.31200000000001 136.266 L 109.96800000000002 136.266 C 87.55800000000002 136.266 69.32700000000003 118.035 69.32700000000003 95.625 L 69.32700000000003 54.984 L 38.25 54.984 C 17.126 54.984 0 72.111 0 93.234 L 0 456.609 C 0 477.733 17.126 494.859 38.25 494.859 z" />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 -223.82 -59.38)"  >
                        <circle stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} cx="0" cy="0" r="37.954" />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 -75 -59.38)"  >
                        <circle stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} cx="0" cy="0" r="37.954" />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 73.83 -59.38)"  >
                        <circle stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} cx="0" cy="0" r="37.954" />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 -75 90.62)"  >
                        <circle stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} cx="0" cy="0" r="37.953" />
                    </g>
                    <g transform="matrix(1.31 0 0 1.31 -223.82 90.62)"  >
                        <circle stroke="none" strokeWidth={1} strokeDasharray={"none"} strokeLinecap="butt" strokeDashoffset={0} strokeLinejoin="miter" strokeMiterlimit={4} fill="rgb(248,250,250)" fillRule="nonzero" opacity={1} vectorEffect={"non-scaling-stroke"} cx="0" cy="0" r="37.953" />
                    </g>
                </g>
            </g>
        </svg>
    );
};

// Not complete below:
export const FileIcon = ({ width, height, fill_color, stroke_width, stroke_color, className }: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    const sw = stroke_width ? stroke_width : "2";
    const fc = fill_color ? fill_color : "none";
    const sc = stroke_color ? stroke_color : "RGB(255,255,255)";

    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 24 24" fill={fc} stroke="currentColor" stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" style={{ color: sc }} >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line >
            <line x1="12" y1="17" x2="12.01" y2="17" ></line>
        </svg >
    );
};

export const CalendarIcon = ({ width, height, fill_color, stroke_width, stroke_color, className }: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    const sw = stroke_width ? stroke_width : "2";
    const fc = fill_color ? fill_color : "none";
    const sc = stroke_color ? stroke_color : "RGB(255,255,255)";

    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 24 24" fill={fc} stroke="currentColor" stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" style={{ color: sc }} >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line >
            <line x1="12" y1="17" x2="12.01" y2="17" ></line>
        </svg >
    );
};

export const GlobeIcon = ({ width, height, fill_color, stroke_width, stroke_color, className }: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    const sw = stroke_width ? stroke_width : "2";
    const fc = fill_color ? fill_color : "none";
    const sc = stroke_color ? stroke_color : "RGB(255,255,255)";

    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 24 24" fill={fc} stroke="currentColor" stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" style={{ color: sc }} >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line >
            <line x1="12" y1="17" x2="12.01" y2="17" ></line>
        </svg >
    );
};

export const LogoTextIcon = ({ width, height, fill_color, stroke_width, stroke_color, className }: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    const sw = stroke_width ? stroke_width : "2";
    const fc = fill_color ? fill_color : "none";
    const sc = stroke_color ? stroke_color : "RGB(255,255,255)";

    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 24 24" fill={fc} stroke="currentColor" stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" style={{ color: sc }} >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line >
            <line x1="12" y1="17" x2="12.01" y2="17" ></line>
        </svg >
    );
};

export const WindowIcon = ({ width, height, fill_color, stroke_width, stroke_color, className }: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    const sw = stroke_width ? stroke_width : "2";
    const fc = fill_color ? fill_color : "none";
    const sc = stroke_color ? stroke_color : "RGB(255,255,255)";

    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 24 24" fill={fc} stroke="currentColor" stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" style={{ color: sc }} >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line >
            <line x1="12" y1="17" x2="12.01" y2="17" ></line>
        </svg >
    );
};