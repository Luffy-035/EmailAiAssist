import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Full auth config — spreads Edge-safe config and adds Node.js-only DB callbacks
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  callbacks: {
    // Persist access/refresh tokens into the JWT on sign-in
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at * 1000;
      }
      return token;
    },

    // Expose tokens on the session object
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.sub;
      return session;
    },

    // Save/upsert user to MongoDB on every sign-in
    async signIn({ user, account }) {
      try {
        await connectDB();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            email: user.email,
            name: user.name,
            googleAccessToken: account.access_token,
            googleRefreshToken: account.refresh_token,
          },
          { upsert: true, new: true }
        );
        return true;
      } catch (error) {
        console.error("Error saving user to DB:", error);
        return false;
      }
    },
  },
});
