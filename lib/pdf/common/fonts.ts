import { Font } from '@react-pdf/renderer'
import path from 'path'

let registered = false

/**
 * Enregistre la famille Montserrat avec ses 5 graisses utiles.
 * Lit les TTF depuis /public/fonts via le système de fichiers Node.
 * À appeler une seule fois côté serveur, avant de générer un PDF.
 */
export function registerFonts() {
  if (registered) return

  const fontsDir = path.join(process.cwd(), 'public', 'fonts')

  Font.register({
  family: 'Montserrat',
  fonts: [
    { src: path.join(fontsDir, 'Montserrat-Light.ttf'),       fontWeight: 300 },
    { src: path.join(fontsDir, 'Montserrat-LightItalic.ttf'), fontWeight: 300, fontStyle: 'italic' },
    { src: path.join(fontsDir, 'Montserrat-Regular.ttf'),      fontWeight: 400 },
    { src: path.join(fontsDir, 'Montserrat-Italic.ttf'),       fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(fontsDir, 'Montserrat-Medium.ttf'),       fontWeight: 500 },
    { src: path.join(fontsDir, 'Montserrat-Bold.ttf'),         fontWeight: 700 },
    { src: path.join(fontsDir, 'Montserrat-Black.ttf'),        fontWeight: 900 },
  ],
})

  // Évite l'auto-hyphenation parasite dans les paragraphes
  Font.registerHyphenationCallback((word) => [word])

  registered = true
}