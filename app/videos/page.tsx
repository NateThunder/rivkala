import type { Metadata } from "next";
import { Bodoni_Moda, Courier_Prime } from "next/font/google";
import VideoRoomPage from "./video-room-page";

const bodoniModa = Bodoni_Moda({
  variable: "--font-tv-serif",
  subsets: ["latin"],
  weight: "variable",
});

const courierPrime = Courier_Prime({
  variable: "--font-tv-typewriter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "TV Room | Rivkala",
  description: "Watch Rivkala's official video transmissions from the TV Room.",
};

export default function VideosPage() {
  return (
    <VideoRoomPage className={`${bodoniModa.variable} ${courierPrime.variable}`} />
  );
}
