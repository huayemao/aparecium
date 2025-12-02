import Alert from '../components/alert'
import Footer from '../components/footer'
import Meta from '../components/meta'
import '../styles/index.css'

export const metadata = {
  title: 'Aparecium',
  description: 'Your project description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Meta />
      </head>
      <body>
        <div className="min-h-screen">
          <Alert preview={false} />
          <main>{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  )
}
