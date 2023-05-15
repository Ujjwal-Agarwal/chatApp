import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { fetchRedis } from "@/helpers/redis";

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }
  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }

  return { clientId, clientSecret };
}

// authOptions has types in NextAuthOptions object
// NextAuthOptions is part of next-auth so types passed are predefined/expected types
// We can not use random types here. Only options defined in NextAuthOptions are allowed
export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // const dbUser = (await db.get(`user:${token.id}`)) as User | null;
      // fetchRedis bypasses caching
      const dbUserString = (await fetchRedis(
        "get",
        `user:${token.id}`
      )) as string | null;

      if (!dbUserString) {
        token.id = user!.id;
        return token;
      }

      const dbUser = JSON.parse(dbUserString) as User

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    redirect() {
      return "/dash";
    },
  },
};

// Adapter "adapts" the data input into data for the db
// For the session, the strategy would be 'jwt' which is json web tokens, it means that sessions would not be handled on the DB
// We also declare a signIn page which will be a custom page we will use for login
