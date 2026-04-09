import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { Resend } from "resend";
import cors from "cors";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const railwayDomain = "https://strke-website-production-564c.up.railway.app";

if (!stripeSecretKey) {
  console.warn("Warning: STRIPE_SECRET_KEY is not set.");
}

const stripe = new Stripe(stripeSecretKey || "");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        "http://localhost:5173",
        "https://strke-website.vercel.app",
        railwayDomain,
      ];

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "stripe-signature"],
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// Optional root route so Railway doesn't show a 502 for /
app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "STRKE-WEBSITE backend",
  });
});

// Stripe webhook MUST be before express.json()
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || typeof signature !== "string") {
      return res.status(400).send("Missing stripe-signature header");
    }

    if (!webhookSecret) {
      return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerEmail = session.customer_details?.email;
        const programTitle = session.metadata?.programTitle;
        const programLink = session.metadata?.programLink;

        if (customerEmail && programLink && resend) {
          await resend.emails.send({
            from: "Nick Eunson <onboarding@resend.dev>",
            to: customerEmail,
            subject: `Your Program: ${programTitle || "Purchase"}`,
            html: `
              <h1>Thanks for your purchase!</h1>
              <p>You've successfully purchased the <strong>${programTitle || "program"}</strong>.</p>
              <p>You can access your program here:</p>
              <a href="${programLink}" style="display:inline-block;padding:12px 24px;background-color:#f97316;color:white;text-decoration:none;border-radius:9999px;font-weight:bold;">Access Program</a>
              <p>If you have any questions, just reply to this email.</p>
              <p>- Nick Eunson</p>
            `,
          });

          console.log(`Email sent to ${customerEmail} for ${programTitle}`);
        } else if (!resend) {
          console.warn("RESEND_API_KEY is not set; skipping email send.");
        }
      }

      return res.json({ received: true });
    } catch (err: any) {
      console.error("Webhook handling error:", err);
      return res.status(500).send("Webhook handler failed");
    }
  }
);

// Normal JSON body parser AFTER webhook route
app.use(express.json());

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    if (!stripeSecretKey) {
      return res.status(500).json({
        error: "Stripe secret key not configured",
      });
    }

    const { programId, programTitle, price, programLink } = req.body ?? {};

    if (
      !programId ||
      !programTitle ||
      typeof price !== "number" ||
      !programLink
    ) {
      return res.status(400).json({
        error: "Missing or invalid checkout fields",
      });
    }

    console.log("Creating checkout session for:", programTitle);

    const origin =
      typeof req.headers.origin === "string" && req.headers.origin.length > 0
        ? req.headers.origin
        : "https://strke-website.vercel.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: programTitle,
              description: `12-Week ${programTitle}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        programId: String(programId),
        programTitle: String(programTitle),
        programLink: String(programLink),
      },
    });

    console.log("Checkout session created:", session.id);

    return res.status(200).json({
      id: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error("Checkout session error:", err);
    return res.status(500).json({
      error: err?.message || "Failed to create checkout session",
    });
  }
});

// Fallback 404 for unknown API routes
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});