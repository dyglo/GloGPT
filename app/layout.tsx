import '../styles/globals.css'

export const metadata = {
  title: 'GloGPT',
  description: 'Your AI Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}