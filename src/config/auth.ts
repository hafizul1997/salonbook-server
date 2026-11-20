import "dotenv/config";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { mongoDb } from "./mongo.js";

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb),

  baseURL: process.env.BETTER_AUTH_URL,

  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
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
