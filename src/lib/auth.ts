import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.ENTRA_ID,
      clientSecret: process.env.ENTRA_SECRET,
      issuer: process.env.ENTRA_ISSUER
    }),
  ],
})