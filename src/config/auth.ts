import "dotenv/config";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { mongoDb } from "./mongo.js";

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb),

  baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,

trustedOrigins: [
  "http://localhost:3000",
  "http://localhost:5000",
],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
},
account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ["google"],
    allowDifferentEmails: false,
  },
},
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  plugins: [
    jwt({
      jwt: {
       definePayload: ({ user }) => ({
  sub: user.id,
  email: user.email,
  role: user.role,
  isBlocked: user.isBlocked,
}),
      },
    }),
  ],
});
