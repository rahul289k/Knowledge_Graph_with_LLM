import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getCurrentThemeColors() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);

  const toGet = ["primary", "secondary", "background", "foreground", "primary-foreground", 
    "secondary-foreground", "muted", "muted-foreground", "accent", 
    "accent-foreground", "border", "input", "ring"];
  const colors = {};
  toGet.forEach(color => {
    colors[color] = hslToHex(styles.getPropertyValue(`--${color}`));
  });

  return colors;
}

function hslToHex(hslString) {
  const [h, s, l] = hslString.split(" ").map((value, index) => 
    index === 0 ? parseFloat(value) : parseFloat(value) / 100
  );

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (value) => Math.round((value + m) * 255).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generateUUID() {
  return uuidv4();
}
