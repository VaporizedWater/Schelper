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
import leftTrianglePath from "public/left_triangle.png";
import rightTrianglePath from "public/right_triangle.png";
import logoPSUPath from "public/logo.png";
import tagPath from "public/tag.png";
import horizontalTextPSULogoPath from "public/psu_logo_horizontal_text.png";

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
export const LeftTriangle = leftTrianglePath;
export const RightTriangle = rightTrianglePath;
export const PSU_Logo = logoPSUPath;
export const TagsImage = tagPath;
export const HorizontalTextPSULogo = horizontalTextPSULogoPath;

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
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 24 24" fill={fc} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ color: sc }} >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line >
            <line x1="12" y1="17" x2="12.01" y2="17" ></line>
        </svg >
    );
};

export const FacultyIcon = ({ width, height, fill_color, stroke_width, stroke_color, className }: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    const sw = stroke_width ? stroke_width : "2";
    const fc = fill_color ? fill_color : "none";
    const sc = stroke_color ? stroke_color : "currentColor";

    return (
        <svg className={className || "svg-icon"} style={{ width: "1em", height: "1em", verticalAlign: "middle", fill: "currentColor", overflow: "hidden" }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={w} height={h} fill={fc} stroke={sc} strokeWidth={sw}>
            <path d="M956.671995 1006.527988 947.519995 1023.999988l-23.552 0L92.672005 1023.999988 65.856005 1023.999988l0.512-26.624c1.024-50.239999 6.272-118.335999 23.872-185.087998 18.24-68.735999 49.599999-136.191998 103.103999-182.463998L201.024004 623.359993l9.92 0.064 116.927999-1.152L327.872002 676.479992l-107.007999-0.896c-40.064 38.208-64.703999 93.183999-79.679999 149.823998-13.568 51.007999-19.2 103.167999-21.376 146.367998l784.447991-0.128c1.344-49.343999-13.056-107.647999-30.784-162.303998-17.856-55.167999-43.327999-102.143999-73.983999-134.591998l-122.239999 0L677.247998 622.271993l139.711998 0 10.752 3.52c40.896 38.208 74.175999 100.479999 95.871999 167.551998C946.303995 863.55199 963.263995 946.047989 956.671995 1006.527988L956.671995 1006.527988zM520 936.639989l-69.887999-52.351999L495.36 702.719992l-17.088-28.032 1.344-28.672c32.64-1.792 42.24-1.792 74.879999 0l1.344 28.672L538.688 702.719992l51.199999 181.503998L520 936.639989 520 936.639989zM722.239998 410.239995c-17.92 61.823999-42.368 108.095999-75.135999 142.399998C611.839999 589.631993 567.551999 611.775993 512.064 623.423993l-4.48 0.896-4.48-0.704C452.992001 615.231993 408.768001 593.983993 371.968002 556.607993 338.176002 522.367994 311.232002 474.751994 292.416003 411.327995 276.672003 402.815995 264.832003 388.607995 256.832003 369.599996 248.064003 348.671996 243.968003 321.343996 244.480003 288.959997l0.192-12.48 10.496-7.04c3.52-2.432 7.104-4.544 10.624-6.464C249.856003 165.695998 254.016003 82.879999 313.088002 27.712 360.064002-6.4 442.560001 16.896 518.144 5.632c215.615997-32.256 214.143997 76.671999 235.647997 261.311997 1.28 0.768 2.496 1.536 3.776 2.432l10.496 7.04 0.192 12.48c0.512 31.744-3.328 58.559999-11.776 79.359999C748.799997 387.199995 737.407997 401.471995 722.239998 410.239995L722.239998 410.239995zM696.383998 313.087996 693.119998 302.079996l-7.04 0.448-4.032-21.056c-3.136-16.448-7.872-101.567999-14.144-115.519999C649.279998 173.759998 628.351999 159.359998 609.407999 148.543998l-9.6 29.76L584.447999 176.319998l2.048-18.112L570.175999 184.063998 555.711999 181.183998l14.272-38.4C493.696 195.455998 362.240002 192.767998 344.896002 169.215998 342.208002 172.543998 341.696002 177.279998 340.224002 181.439998 336.640002 195.647998 332.608002 284.031997 329.088002 298.111997L328.128002 303.295996 327.744002 303.231996C326.976002 306.111996 326.272002 308.607996 325.504002 310.783996 318.976002 306.495996 305.728002 309.887996 293.824003 311.679996 294.976003 327.359996 297.600003 340.607996 302.016002 350.911996c4.352 10.496 10.368 17.28 17.92 19.584l12.928 3.968 3.52 12.928C353.024002 448.191995 376.960002 492.415994 406.976001 522.879994c27.968 28.352 61.567999 44.991999 99.711999 52.095999 43.391999-9.792 77.823999-27.328 105.023999-55.743999 28.8-30.144 50.239999-73.087999 66.303999-132.415998l3.328-12.352 12.224-4.288c7.424-2.56 13.312-9.472 17.6-19.968 4.16-10.24 6.784-23.168 7.872-38.464C711.871998 311.871996 704.639998 312.063996 696.383998 313.087996L696.383998 313.087996z" />
        </svg>
    );
};
