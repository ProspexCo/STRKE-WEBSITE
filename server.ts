import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const resend = new Resend(process.env.RESEND_API_KEY || "");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook needs raw body for signature verification
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!sig || !webhookSecret) {
        throw new Error("Missing signature or webhook secret");
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email;
      const programTitle = session.metadata?.programTitle;
      const programLink = session.metadata?.programLink;

      if (customerEmail && programLink) {
        try {
          await resend.emails.send({
            from: "Nick Eunson <onboarding@resend.dev>", // Replace with your verified domain
            to: customerEmail,
            subject: `Your Program: ${programTitle}`,
            html: `
              <h1>Thanks for your purchase!</h1>
              <p>You've successfully purchased the <strong>${programTitle}</strong>.</p>
              <p>You can access your program here:</p>
              <a href="${programLink}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 9999px; font-weight: bold;">Access Program</a>
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

    res.json({ received: true });
  });

  app.use(express.json());

  // API Route for Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    console.log("Creating checkout session for:", req.body.programTitle);
    try {
      const { programId, programTitle, price, programLink } = req.body;

      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("Stripe secret key missing");
        return res.status(500).json({ error: "Stripe secret key not configured" });
      }

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
              unit_amount: Math.round(price * 100), // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
        metadata: {
          programId,
          programTitle,
          programLink,
        },
      });

      console.log("Checkout session created:", session.id);
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
