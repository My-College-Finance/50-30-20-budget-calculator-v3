import { useCallback } from "react";
import { useBudgetContext } from "@/context/budget-context";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function useGeneratePdf() {
  const { budget, isCalculated } = useBudgetContext();

  const generatePdf = useCallback(async () => {
    if (!isCalculated || !budget) {
      throw new Error("No budget available to generate PDF");
    }

    // First, capture the budget summary section
    const summaryElement = document.getElementById("budgetSummary");
    if (!summaryElement) {
      throw new Error("Budget summary element not found");
    }

    // Get element dimensions and aspect ratio
    const rect = summaryElement.getBoundingClientRect();
    const aspectRatio = rect.width / rect.height;
    
    const canvas = await html2canvas(summaryElement, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF with more space
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Calculate page width and margins
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20; // mm from edge
    const contentWidth = pageWidth - (2 * margin);
    
    // Add logo and title with proper spacing
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(23, 63, 143); // #173F8F brand blue
    pdf.text("My College Finance", pageWidth/2, margin, { align: "center" });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(23, 63, 143);
    pdf.text("50/30/20 Budget Report", pageWidth/2, margin + 10, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Educate • Motivate • Elevate", pageWidth/2, margin + 15, { align: "center" });

    // Add date
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth/2, margin + 20, { align: "center" });

    // Add the canvas as an image with proper scaling
    const imageData = canvas.toDataURL("image/png");
    
    // Calculate optimal image height based on aspect ratio
    const imageHeight = contentWidth / aspectRatio;
    
    // Add the image with proper dimensions
    pdf.addImage(
      imageData, 
      "PNG", 
      margin, // x position
      margin + 25, // y position below headers
      contentWidth, // width
      imageHeight // height maintained by aspect ratio
    );

    // Add budget details below the image
    const { calculations } = budget;
    const {
      totalIncome,
      needsTotal,
      wantsTotal,
      savingsTotal,
      totalExpenses,
      remaining,
      needsPercentage,
      wantsPercentage,
      savingsPercentage
    } = calculations;

    // Calculate position for budget details (after the image)
    let detailsYStart = margin + 25 + imageHeight + 15;

    // Check if we need to add a page for the details
    if (detailsYStart > pageHeight - 100) { // If less than 100mm left on page
      pdf.addPage();
      detailsYStart = margin; // Reset Y position on new page
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(23, 63, 143);
    pdf.text("Budget Details", pageWidth/2, detailsYStart, { align: "center" });

    // Budget details table with improved spacing
    const detailsLeftCol = margin;
    const detailsRightCol = pageWidth/2;
    const lineHeight = 10;
    let currentY = detailsYStart + 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);

    // Draw details with consistent spacing
    pdf.text("Income:", detailsLeftCol, currentY);
    pdf.text(formatCurrency(totalIncome), detailsRightCol, currentY);
    currentY += lineHeight;

    pdf.text("Needs:", detailsLeftCol, currentY);
    pdf.text(`${formatCurrency(needsTotal)} (${formatPercentage(needsPercentage)})`, detailsRightCol, currentY);
    currentY += lineHeight;

    pdf.text("Wants:", detailsLeftCol, currentY);
    pdf.text(`${formatCurrency(wantsTotal)} (${formatPercentage(wantsPercentage)})`, detailsRightCol, currentY);
    currentY += lineHeight;

    pdf.text("Savings & Debt:", detailsLeftCol, currentY);
    pdf.text(`${formatCurrency(savingsTotal)} (${formatPercentage(savingsPercentage)})`, detailsRightCol, currentY);
    currentY += lineHeight;

    pdf.text("Total Expenses:", detailsLeftCol, currentY);
    pdf.text(formatCurrency(totalExpenses), detailsRightCol, currentY);
    currentY += lineHeight;

    pdf.setFont("helvetica", "bold");
    pdf.text("Remaining:", detailsLeftCol, currentY);
    pdf.text(formatCurrency(remaining), detailsRightCol, currentY);

    // Add a new page for recommendations to ensure clean layout
    pdf.addPage();
    
    // Reset position for recommendations section on new page
    let newPageY = 30;
    currentY = newPageY;
    
    // Add a title for the recommendations
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(23, 63, 143);
    pdf.text("Recommendations", pageWidth/2, currentY, { align: "center" });
    
    // Add a subtitle
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Based on your 50/30/20 budget analysis", pageWidth/2, currentY + 8, { align: "center" });
    
    // Add more space before recommendations
    currentY += lineHeight + 15;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);

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

    // Use currentY for proper positioning, keep track of the bottom position
    let bottomPosition = currentY;
    
    // Increase spacing between recommendations for better readability
    recommendations.forEach((rec, index) => {
      const yPos = currentY + (index * 12); // Increased from 8 to 12
      pdf.text(rec, margin, yPos);
      bottomPosition = yPos; // Keep track of the last line position
    });
    
    // Add more space before footer
    bottomPosition += 40; // Increased from 25 to 40
    
    // Check if bottomPosition is too close to page bottom and add a new page if needed
    if (bottomPosition > pageHeight - 40) { // Increased from 20 to 40
      pdf.addPage(); // Add a new page if we're too close to the edge
      bottomPosition = margin; // Reset position on new page
    }
    
    // Add footer at the bottom of the page with adequate spacing
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text("Generated by My College Finance Budget Calculator | mycollegefinance.com", 
             pageWidth/2, 
             pageHeight - 10, 
             { align: "center" });

    // Save the PDF
    pdf.save("my_college_finance_budget.pdf");

    return true;
  }, [budget, isCalculated]);

  return { generatePdf };
}
