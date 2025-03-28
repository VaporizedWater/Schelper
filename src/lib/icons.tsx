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
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 24 24" fill={fc} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ color: sc }} >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line >
            <line x1="12" y1="17" x2="12.01" y2="17" ></line>
        </svg >
    );
};

export const FacultyIcon = ({width, height, fill_color, stroke_width, stroke_color, className}: SVGProps) => {
    const w = width ? width : "24";
    const h = height ? height : "24";
    const sw = stroke_width ? stroke_width : "2";
    const fc = fill_color ? fill_color : "none";
    const sc = stroke_color ? stroke_color : "currentColor";
  
    return (
      <svg className={className || "svg-icon"} style={{width: "1em", height: "1em", verticalAlign: "middle", fill: "currentColor", overflow: "hidden"}} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={w} height={h} fill={fc} stroke={sc} strokeWidth={sw}>
        <path d="M956.671995 1006.527988 947.519995 1023.999988l-23.552 0L92.672005 1023.999988 65.856005 1023.999988l0.512-26.624c1.024-50.239999 6.272-118.335999 23.872-185.087998 18.24-68.735999 49.599999-136.191998 103.103999-182.463998L201.024004 623.359993l9.92 0.064 116.927999-1.152L327.872002 676.479992l-107.007999-0.896c-40.064 38.208-64.703999 93.183999-79.679999 149.823998-13.568 51.007999-19.2 103.167999-21.376 146.367998l784.447991-0.128c1.344-49.343999-13.056-107.647999-30.784-162.303998-17.856-55.167999-43.327999-102.143999-73.983999-134.591998l-122.239999 0L677.247998 622.271993l139.711998 0 10.752 3.52c40.896 38.208 74.175999 100.479999 95.871999 167.551998C946.303995 863.55199 963.263995 946.047989 956.671995 1006.527988L956.671995 1006.527988zM520 936.639989l-69.887999-52.351999L495.36 702.719992l-17.088-28.032 1.344-28.672c32.64-1.792 42.24-1.792 74.879999 0l1.344 28.672L538.688 702.719992l51.199999 181.503998L520 936.639989 520 936.639989zM722.239998 410.239995c-17.92 61.823999-42.368 108.095999-75.135999 142.399998C611.839999 589.631993 567.551999 611.775993 512.064 623.423993l-4.48 0.896-4.48-0.704C452.992001 615.231993 408.768001 593.983993 371.968002 556.607993 338.176002 522.367994 311.232002 474.751994 292.416003 411.327995 276.672003 402.815995 264.832003 388.607995 256.832003 369.599996 248.064003 348.671996 243.968003 321.343996 244.480003 288.959997l0.192-12.48 10.496-7.04c3.52-2.432 7.104-4.544 10.624-6.464C249.856003 165.695998 254.016003 82.879999 313.088002 27.712 360.064002-6.4 442.560001 16.896 518.144 5.632c215.615997-32.256 214.143997 76.671999 235.647997 261.311997 1.28 0.768 2.496 1.536 3.776 2.432l10.496 7.04 0.192 12.48c0.512 31.744-3.328 58.559999-11.776 79.359999C748.799997 387.199995 737.407997 401.471995 722.239998 410.239995L722.239998 410.239995zM696.383998 313.087996 693.119998 302.079996l-7.04 0.448-4.032-21.056c-3.136-16.448-7.872-101.567999-14.144-115.519999C649.279998 173.759998 628.351999 159.359998 609.407999 148.543998l-9.6 29.76L584.447999 176.319998l2.048-18.112L570.175999 184.063998 555.711999 181.183998l14.272-38.4C493.696 195.455998 362.240002 192.767998 344.896002 169.215998 342.208002 172.543998 341.696002 177.279998 340.224002 181.439998 336.640002 195.647998 332.608002 284.031997 329.088002 298.111997L328.128002 303.295996 327.744002 303.231996C326.976002 306.111996 326.272002 308.607996 325.504002 310.783996 318.976002 306.495996 305.728002 309.887996 293.824003 311.679996 294.976003 327.359996 297.600003 340.607996 302.016002 350.911996c4.352 10.496 10.368 17.28 17.92 19.584l12.928 3.968 3.52 12.928C353.024002 448.191995 376.960002 492.415994 406.976001 522.879994c27.968 28.352 61.567999 44.991999 99.711999 52.095999 43.391999-9.792 77.823999-27.328 105.023999-55.743999 28.8-30.144 50.239999-73.087999 66.303999-132.415998l3.328-12.352 12.224-4.288c7.424-2.56 13.312-9.472 17.6-19.968 4.16-10.24 6.784-23.168 7.872-38.464C711.871998 311.871996 704.639998 312.063996 696.383998 313.087996L696.383998 313.087996z" />
      </svg>
    );
  };

export const LogoIcon = ({ width, height }: SVGProps) => {
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