import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import { Resend } from "resend";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set");
}
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const resend = new Resend(process.env.RESEND_API_KEY || "");

async function startServer() {
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
          "https://strke-website-production-564c.up.railway.app",
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

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Stripe webhook must come BEFORE express.json() because it needs the raw body
  app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string | undefined;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      try {
        if (!sig || !webhookSecret) {
          return res
            .status(400)
            .send("Missing stripe-signature header or STRIPE_WEBHOOK_SECRET");
        }

        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const customerEmail = session.customer_details?.email;
          const programTitle = session.metadata?.programTitle;
          const programLink = session.metadata?.programLink;

          if (customerEmail && programLink) {
            try {
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
            } catch (emailError) {
              console.error("Error sending email:", emailError);
            }
          }
        }

        return res.json({ received: true });
      } catch (err: any) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
  );

  // JSON parser for normal API routes
  app.use(express.json());

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { programId, programTitle, price, programLink } = req.body ?? {};

      console.log("Creating checkout session for:", programTitle);

      if (!process.env.STRIPE_SECRET_KEY) {
        return res
          .status(500)
          .json({ error: "Stripe secret key not configured" });
      }

      if (
        !programId ||
        !programTitle ||
        typeof price !== "number" ||
        !programLink
      ) {
        return res.status(400).json({ error: "Missing or invalid fields" });
      }

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

      return res.json({
        id: session.id,
        url: session.url,
      });
    } catch (error: any) {
      console.error("Stripe error:", error);
      return res.status(500).json({
        error: error?.message || "Failed to create checkout session",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});