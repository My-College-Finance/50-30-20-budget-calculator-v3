import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { Readable } from 'stream';

// Configure OAuth 2.0 client with proper scopes
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/api/google/oauth2callback`
);

// Log OAuth configuration for debugging (without showing secrets)
console.log("Google OAuth configured with redirect URI:", 
  `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/api/google/oauth2callback`
);

// Generate URL for user to authorize the app
export const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file'
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
};

// Exchange authorization code for tokens
export const getTokens = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Set credentials for authenticated requests
export const setCredentials = (tokens: any) => {
  oauth2Client.setCredentials(tokens);
};

// Upload buffer to Google Drive
export const uploadToDrive = async (
  fileName: string, 
  mimeType: string,
  content: Buffer | string, 
  tokens: any
) => {
  // Set credentials for this request
  setCredentials(tokens);
  
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  // Convert buffer or string to readable stream
  const buffer = typeof content === 'string' ? Buffer.from(content) : content;
  const fileStream = new Readable();
  fileStream.push(buffer);
  fileStream.push(null);
  
  // Create file metadata
  const fileMetadata = {
    name: fileName,
    mimeType: mimeType
  };
  
  // Create media object
  const media = {
    mimeType: mimeType,
    body: fileStream
  };
  
  try {
    // Upload file to Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

// Generate a PDF buffer from data
export const generatePdfBuffer = async (budgetData: any): Promise<Buffer> => {
  // In a real application, we'd use a proper PDF generation library
  // For now, we'll create a more detailed text representation
  
  const { 
    income, 
    additionalIncome,
    calculations
  } = budgetData;
  
  if (!calculations) {
    throw new Error('Budget data is missing calculations');
  }
  
  const {
    totalIncome,
    needsTotal,
    wantsTotal,
    savingsTotal,
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    remaining,
    totalExpenses
  } = calculations;
  
  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Create recommendations
  let recommendations = [];
  
  if (needsPercentage > 50) {
    recommendations.push("• Consider ways to reduce your essential expenses");
  }
  
  if (wantsPercentage > 30) {
    recommendations.push("• Look for areas to trim your discretionary spending");
  }
  
  if (savingsPercentage < 20) {
    recommendations.push("• Try to increase your savings rate to build financial security");
  }
  
  if (remaining > 0) {
    recommendations.push(`• Allocate your surplus of ${formatCurrency(remaining)} to savings or debt repayment`);
  } else if (remaining < 0) {
    recommendations.push(`• Find ways to address your deficit of ${formatCurrency(Math.abs(remaining))}`);
  }
  
  recommendations.push("• Build an emergency fund equal to 3-6 months of expenses");
  recommendations.push("• Continue to track your spending and adjust your budget as needed");
  
  // Create a better text representation
  const text = `
==========================================
       MY COLLEGE FINANCE BUDGET REPORT
          50/30/20 Budget Calculator
                 v2.0.1 (Beta)
==========================================
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

==================== SUMMARY ===================

INCOME:                 ${formatCurrency(totalIncome)}

BUDGET BREAKDOWN:
---------------------------------------
NEEDS (50%):           ${formatCurrency(needsTotal)} (${needsPercentage.toFixed(1)}%)
WANTS (30%):           ${formatCurrency(wantsTotal)} (${wantsPercentage.toFixed(1)}%)
SAVINGS (20%):         ${formatCurrency(savingsTotal)} (${savingsPercentage.toFixed(1)}%)
---------------------------------------
TOTAL EXPENSES:        ${formatCurrency(totalExpenses)}
REMAINING:             ${formatCurrency(remaining)}


=============== RECOMMENDATIONS ===============

${recommendations.join("\n")}


==============================================
Generated by MY COLLEGE FINANCE Budget Calculator
Educate • Motivate • Elevate
© 2024 My College Finance, LLC. All rights reserved.
https://www.mycollegefinance.com
==============================================
  `;
  
  return Buffer.from(text);
};