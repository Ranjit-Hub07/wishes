import { Playfair_Display, Hanken_Grotesk, Space_Grotesk } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata = {
  title: "BirthdayWish | For My Dearest Friend",
  description: "A premium, luminous digital birthday experience filled with memories, a special letter, and a timeline of our journey.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`dark ${playfairDisplay.variable} ${hankenGrotesk.variable} ${spaceGrotesk.variable} h-full antialiased`}
      style={{ scrollBehavior: "smooth" }}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-surface selection:bg-primary selection:text-on-primary overflow-x-hidden flex flex-col">
        {children}
      </body>
    </html>
  );
}
