import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { budgetSchema, emailReportSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import nodemailer from "nodemailer";
import { getAuthUrl, getTokens, uploadToDrive, generatePdfBuffer } from "./google-drive";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = express.Router();

  // Budget Routes
  apiRouter.post("/budget/calculate", async (req, res) => {
    try {
      const budget = budgetSchema.parse(req.body);
      const calculatedBudget = await storage.calculateBudget(budget);
      res.json(calculatedBudget);
    } catch (error) {
      if (error instanceof ZodError) {
        const readableError = fromZodError(error);
        res.status(400).json({ error: readableError.message });
      } else {
        res.status(500).json({ error: "Failed to calculate budget" });
      }
    }
  });

  apiRouter.post("/budget/save", async (req, res) => {
    try {
      const budget = budgetSchema.parse(req.body);
      const savedBudget = await storage.saveBudget(budget);
      res.json(savedBudget);
    } catch (error) {
      if (error instanceof ZodError) {
        const readableError = fromZodError(error);
        res.status(400).json({ error: readableError.message });
      } else {
        res.status(500).json({ error: "Failed to save budget" });
      }
    }
  });

  apiRouter.get("/budget/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudget(id);
      if (budget) {
        res.json(budget);
      } else {
        res.status(404).json({ error: "Budget not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve budget" });
    }
  });

  // Email Report Route
  apiRouter.post("/email/report", async (req, res) => {
    try {
      const { email, budget } = emailReportSchema.parse(req.body);

      // Create test account for development
      // In production, you would use real SMTP credentials
      const testAccount = await nodemailer.createTestAccount();

      // Create reusable transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      // Calculate totals for email content
      const totalIncome = budget.income + (budget.additionalIncome || 0);
      
      const needsTotal = budget.needs ? budget.needs.reduce((sum, item) => sum + item.amount, 0) : 0;
      const wantsTotal = budget.wants ? budget.wants.reduce((sum, item) => sum + item.amount, 0) : 0;
      const savingsTotal = budget.savings ? budget.savings.reduce((sum, item) => sum + item.amount, 0) : 0;
      
      const totalExpenses = needsTotal + wantsTotal + savingsTotal;
      const remaining = totalIncome - totalExpenses;

      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: '"My College Finance" <budget@mycollegefinance.com>',
        to: email,
        subject: "Your 50/30/20 Budget Summary",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #173F8F;">Your 50/30/20 Budget Summary</h1>
            
            <p>Thank you for using My College Finance's Budget Calculator! Here is your budget summary:</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f0f4f8; border-radius: 5px;">
              <h2 style="margin-top: 0;">Budget Overview</h2>
              <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
              <p><strong>Needs (50%):</strong> $${needsTotal.toFixed(2)} (${((needsTotal / totalIncome) * 100).toFixed(0)}%)</p>
              <p><strong>Wants (30%):</strong> $${wantsTotal.toFixed(2)} (${((wantsTotal / totalIncome) * 100).toFixed(0)}%)</p>
              <p><strong>Savings & Debt (20%):</strong> $${savingsTotal.toFixed(2)} (${((savingsTotal / totalIncome) * 100).toFixed(0)}%)</p>
              <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
              <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
            </div>
            
            <p>Visit <a href="https://mycollegefinance.com">My College Finance</a> for more financial tips and tools.</p>
            
            <p style="font-size: 12px; color: #666;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        `,
      });

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      res.json({
        success: true,
        message: "Email sent successfully",
        previewUrl: nodemailer.getTestMessageUrl(info),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const readableError = fromZodError(error);
        res.status(400).json({ error: readableError.message });
      } else {
        console.error("Email error:", error);
        res.status(500).json({ error: "Failed to send email" });
      }
    }
  });

  // Google API routes
  apiRouter.get("/google/auth", (req, res) => {
    try {
      const authUrl = getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Google Auth URL generation error:", error);
      res.status(500).json({ error: "Failed to generate Google Auth URL" });
    }
  });

  apiRouter.get("/google/oauth2callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).json({ error: "Authorization code is missing" });
      }
      
      // Exchange authorization code for tokens
      const tokens = await getTokens(code);
      
      // In a real application, you would store these tokens in a user's session
      // or in a database associated with their account
      // For this example, we'll just set a cookie
      res.cookie('google_tokens', JSON.stringify(tokens), {
        maxAge: 3600000, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Redirect to the app
      res.redirect('/');
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.status(500).json({ error: "Failed to complete Google OAuth flow" });
    }
  });

  apiRouter.post("/google/upload", async (req, res) => {
    try {
      // Get tokens from cookies
      const tokensStr = req.cookies?.google_tokens;
      
      if (!tokensStr) {
        // No tokens, user needs to authenticate
        const authUrl = getAuthUrl();
        console.log("No Google tokens found, redirecting to auth URL");
        return res.status(401).json({ 
          error: "Google Drive authentication required",
          authUrl 
        });
      }
      
      const tokens = JSON.parse(tokensStr);
      const { budget } = req.body;
      
      if (!budget) {
        return res.status(400).json({ error: "Budget data is required" });
      }
      
      // Create a formatted date for the filename
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const filename = `My_College_Finance_Budget_${formattedDate}.txt`;
      
      console.log("Generating budget report for Google Drive...");
      
      // Generate PDF buffer from budget data
      const pdfBuffer = await generatePdfBuffer(budget);
      
      console.log(`Uploading file to Google Drive: ${filename}`);
      
      // Upload to Google Drive - in a production app, we'd use PDF format
      const result = await uploadToDrive(
        filename,
        "text/plain", // In production, use "application/pdf"
        pdfBuffer,
        tokens
      );
      
      console.log("File uploaded successfully:", result.id);
      
      res.json({
        success: true,
        file: result
      });
    } catch (error) {
      console.error("Google Drive upload error:", error);
      
      // Check for specific error types
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to upload file to Google Drive";
        
      // Handle token expiration
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('Invalid Credentials')) {
        // Clear the invalid token
        res.clearCookie('google_tokens');
        
        // Get a fresh auth URL
        const authUrl = getAuthUrl();
        return res.status(401).json({ 
          error: "Google authentication expired. Please reconnect.",
          authUrl 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to upload file to Google Drive", 
        details: errorMessage 
      });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
