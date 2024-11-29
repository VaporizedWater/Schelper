/*
    Routes images from ./public to a common global variable to be used everywhere else.
    Good for swapping out images using one place instead of having to swap it in many (saves dev time).
*/

// Images
import logo from "public/goober.svg"
import classIconPath from "public/globe.svg"
import tagIconPath from "public/globe.svg"

// Global variables
export default logo;
export const classIcon = classIconPath;
export const tagIcon = tagIconPath;