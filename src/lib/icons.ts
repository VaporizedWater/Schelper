/*
    Routes images from ./public to a common global variable to be used everywhere else.
    Good for swapping out images using one place instead of having to swap it in many (saves dev time).
*/

// SVG Icons
import alertTrianglePath from "public/AlertTriangle.svg";
import facultyPath from "public/Faculty.svg";
import fileIconPath from "public/file.svg";
import calendarWhiteIconPath from "public/calendar-white.svg";
import calendarIconPath from "public/calendar.svg";
import globeIconPath from "public/globe.svg";
import logoTextIconPath from "public/logotype.svg";
import windowIconPath from "public/window.svg";

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


// Exported Global Variables
export const LogoIcon = calendarWhiteIconPath;
export const AlertTriangleIcon = alertTrianglePath;
export const FacultyIcon = facultyPath;
export const FileIcon = fileIconPath;
export const CalendarIcon = calendarIconPath;
export const GlobeIcon = globeIconPath;
export const LogoTextIcon = logoTextIconPath;
export const WindowIcon = windowIconPath;
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
