"use client";

import { PRIVY_ENABLED } from "@/lib/privy";
import { MockGoogleSignIn } from "./MockGoogleSignIn";
import { PrivyGoogleSignIn } from "./PrivyGoogleSignIn";

export const GoogleSignIn = PRIVY_ENABLED ? PrivyGoogleSignIn : MockGoogleSignIn;
