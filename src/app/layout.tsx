import { Toaster } from "@/app/components/ui/sonner"
import "./assets/css/globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <head/>
        <body>
            <Providers>{ children }</Providers>
            <Toaster/>
        </body>
        </html>
    )
}