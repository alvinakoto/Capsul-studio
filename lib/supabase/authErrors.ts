/**
 * Traduction des messages d'erreur de Supabase Auth (GoTrue), toujours en
 * anglais et non paramétrables côté dashboard. On les intercepte ici avant
 * affichage — fallback sur le message brut (préfixé) si on ne le reconnaît pas,
 * pour ne jamais masquer une erreur utile au débogage.
 */
export function translateAuthError(message: string | undefined | null): string {
  if (!message) return 'Une erreur est survenue.'

  const cooldown = message.match(/only request this after (\d+) seconds?/i)
  if (cooldown) {
    return `Pour des raisons de sécurité, réessayez dans ${cooldown[1]} secondes.`
  }

  const minLength = message.match(/password should be at least (\d+) characters?/i)
  if (minLength) {
    return `Le mot de passe doit contenir au moins ${minLength[1]} caractères.`
  }

  const table: [RegExp, string][] = [
    [/user already registered/i, 'Un compte existe déjà avec cet email.'],
    [/email not confirmed/i, 'Ce compte n\'a pas encore été confirmé. Vérifiez votre boîte mail.'],
    [/invalid login credentials/i, 'Email ou mot de passe incorrect.'],
    [/unable to validate email address.*invalid format/i, 'Adresse email invalide.'],
    [/signup requires a valid password/i, 'Mot de passe requis.'],
    [/email rate limit exceeded/i, 'Trop d\'emails envoyés, réessayez dans quelques minutes.'],
    [/token has expired or is invalid/i, 'Ce lien a expiré ou n\'est plus valide. Demandez-en un nouveau.'],
    [/email link is invalid or has expired/i, 'Ce lien a expiré ou n\'est plus valide. Demandez-en un nouveau.'],
    [/new password should be different/i, 'Le nouveau mot de passe doit être différent de l\'ancien.'],
    [/(sending|smtp|email).*(fail|error)/i, 'Erreur d\'envoi d\'email. Réessayez dans quelques minutes, ou contactez l\'admin si le problème persiste.'],
  ]

  for (const [pattern, translated] of table) {
    if (pattern.test(message)) return translated
  }

  // Message non reconnu : on le garde visible (utile pour le support) plutôt
  // que de masquer une erreur inattendue derrière un texte générique.
  return `Une erreur est survenue (${message}).`
}
