import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "./theme-provider"
import { DemoControls } from "./demo-controls"
import { DashboardProvider } from "@/context/dashboard-context" // ✅ new import

/* ------------------------------------------------------------
 * Fonts
 * ------------------------------------------------------------ */
const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Light.woff2", weight: "300" },
    { path: "../public/fonts/Satoshi-Regular.woff2", weight: "400" },
    { path: "../public/fonts/Satoshi-Medium.woff2", weight: "500" },
    { path: "../public/fonts/Satoshi-Bold.woff2", weight: "700" },
    { path: "../public/fonts/Satoshi-Black.woff2", weight: "900" },
  ],
  variable: "--font-satoshi",
})

const _geistMono = Geist_Mono({ subsets: ["latin"] })

/* ------------------------------------------------------------
 * Metadata
 * ------------------------------------------------------------ */
export const metadata: Metadata = {
  title: "Konfam Dashboard",
  description: "Crisis Management & Threat Detection System",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

/* ------------------------------------------------------------
 * Root Layout
 * ------------------------------------------------------------ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ fontFamily: satoshi.style.fontFamily }}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          {/* All dashboard data + WebSocket context is now global */}
          <DashboardProvider>
            {children}
            <DemoControls />
          </DashboardProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

// import type React from "react"
// import type { Metadata } from "next"
// import { Geist_Mono } from "next/font/google"
// import localFont from "next/font/local"
// import { Analytics } from "@vercel/analytics/next"
// import "./globals.css"
// import { ThemeProvider } from "./theme-provider"
// import { DemoControls } from "./demo-controls"

// const satoshi = localFont({
//   src: [
//     {
//       path: "../public/fonts/Satoshi-Light.woff2",
//       weight: "300",
//     },
//     {
//       path: "../public/fonts/Satoshi-Regular.woff2",
//       weight: "400",
//     },
//     {
//       path: "../public/fonts/Satoshi-Medium.woff2",
//       weight: "500",
//     },
//     {
//       path: "../public/fonts/Satoshi-Bold.woff2",
//       weight: "700",
//     },
//     {
//       path: "../public/fonts/Satoshi-Black.woff2",
//       weight: "900",
//     },
//   ],
//   variable: "--font-satoshi",
// })

// const _geistMono = Geist_Mono({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "Konfam Dashboard",
//   description: "Crisis Management & Threat Detection System",
//   icons: {
//     icon: [
//       {
//         url: "/icon-light-32x32.png",
//         media: "(prefers-color-scheme: light)",
//       },
//       {
//         url: "/icon-dark-32x32.png",
//         media: "(prefers-color-scheme: dark)",
//       },
//       {
//         url: "/icon.svg",
//         type: "image/svg+xml",
//       },
//     ],
//     apple: "/apple-icon.png",
//   },
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning style={{ fontFamily: satoshi.style.fontFamily }}>
//       <body className={`font-sans antialiased`}>
//         <ThemeProvider>
//           {children}
//           <DemoControls />
//         </ThemeProvider>
//         <Analytics />
//       </body>
//     </html>
//   )
// }