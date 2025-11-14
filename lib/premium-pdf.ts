import { jsPDF } from "jspdf"
import Chart from "chart.js/auto"
import { mockThreats, mockSentimentData } from "@/lib/demo-data"

// Fix TS implicit types
function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 6
) {
  const words = text.split(" ")
  let line = ""

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " "
    const width = doc.getTextWidth(testLine)
    if (width > maxWidth) {
      doc.text(line, x, y)
      line = words[n] + " "
      y += lineHeight
    } else {
      line = testLine
    }
  }

  doc.text(line, x, y)
  return y + lineHeight
}

// =======================
// PREMIUM PDF GENERATOR
// =======================
export async function generatePremiumPDF(range: "today" | "week") {
  const doc = new jsPDF("p", "mm", "a4")

  // ------------------------------------------
  // PAGE 1 — COVER
  // ------------------------------------------
  doc.setFillColor("#0F62FE")
  doc.rect(0, 0, 210, 297, "F")

  doc.setTextColor("white")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(32)
  doc.text("KONFAM", 20, 40)

  doc.setFontSize(22)
  doc.text("Analytics Intelligence Report", 20, 60)

  doc.setFontSize(12)
  doc.text(
    range === "today" ? "Daily Monitoring Summary" : "Weekly Intelligence Briefing",
    20,
    74
  )

  doc.setFontSize(11)
  doc.text("Generated: " + new Date().toLocaleString(), 20, 90)

  doc.addPage()

  // ------------------------------------------
  // PAGE 2 — EXEC SUMMARY
  // ------------------------------------------
  let y = 20

  doc.setFontSize(20)
  doc.setTextColor("#111")
  doc.text("Executive Summary", 14, y)
  y += 12

  const summary =
    "Public sentiment showed volatility during the monitored period, influenced by misinformation bursts targeting customer service, network reliability, and financial security topics. The Konfam threat engine detected multiple high and medium-severity events requiring proactive communication response. Despite elevated noise-levels, brand stability remains recoverable with timely and factual intervention."

  doc.setFontSize(11)
  y = drawWrappedText(doc, summary, 14, y, 180)

  // ------------------------------------------
  // RISK GAUGE (Chart.js v4)
  // ------------------------------------------
  const riskScore = Math.floor(40 + Math.random() * 50) // 40–90 demo

  const gaugeCanvas = document.createElement("canvas")
  gaugeCanvas.width = 400
  gaugeCanvas.height = 200
  const gaugeCtx = gaugeCanvas.getContext("2d")!

  new Chart(gaugeCtx, {
    type: "doughnut",
    data: {
      labels: ["Risk", "Remaining"],
      datasets: [
        {
          data: [riskScore, 100 - riskScore],
          backgroundColor: ["#D7263D", "#E5E7EB"],
          circumference: 180,
          rotation: -90,
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "70%", // Chart.js v4 supports this
      plugins: { legend: { display: false } },
      responsive: false,
    },
  })

  await new Promise((r) => setTimeout(r, 300))
  const gaugeImg = gaugeCanvas.toDataURL("image/png")

  doc.addImage(gaugeImg, "PNG", 20, y, 160, 60)
  y += 70

  doc.setFontSize(14)
  doc.text("Overall Risk Score: " + riskScore + "/100", 20, y)

  doc.addPage()

  // ------------------------------------------
  // PAGE 3 — SENTIMENT TREND
  // ------------------------------------------
  y = 20

  doc.setFontSize(18)
  doc.text("Sentiment Trend", 14, y)
  y += 10

  const sentimentCanvas = document.createElement("canvas")
  sentimentCanvas.width = 1000
  sentimentCanvas.height = 400
  const sctx = sentimentCanvas.getContext("2d")!

  new Chart(sctx, {
    type: "line",
    data: {
      labels: mockSentimentData.map((d) => d.label), // FIX TYPE ISSUE
      datasets: [
        {
          label: "Sentiment Score",
          data: mockSentimentData.map((d) => d.value),
          borderColor: "#0F62FE",
          borderWidth: 3,
          tension: 0.35,
        },
      ],
    },
    options: { responsive: false },
  })

  await new Promise((r) => setTimeout(r, 300))
  const sentimentImg = sentimentCanvas.toDataURL("image/png")

  doc.addImage(sentimentImg, "PNG", 10, y, 190, 80)

  doc.addPage()

  // ------------------------------------------
  // PAGE 4 — THREAT SEVERITY + TOP THREATS
  // ------------------------------------------
  y = 20

  doc.setFontSize(18)
  doc.text("Threat Severity Overview", 14, y)
  y += 10

  const severityCanvas = document.createElement("canvas")
  severityCanvas.width = 800
  severityCanvas.height = 300
  const stx = severityCanvas.getContext("2d")!

  const severityCounts = {
    CRITICAL: mockThreats.filter((t) => t.severity === "CRITICAL").length,
    HIGH: mockThreats.filter((t) => t.severity === "HIGH").length,
    MEDIUM: mockThreats.filter((t) => t.severity === "MEDIUM").length,
    LOW: mockThreats.filter((t) => t.severity === "LOW").length,
  }

  new Chart(stx, {
    type: "bar",
    data: {
      labels: ["Critical", "High", "Medium", "Low"],
      datasets: [
        {
          label: "Count",
          data: Object.values(severityCounts),
          backgroundColor: ["#D7263D", "#EA580C", "#F4B400", "#17A398"],
        },
      ],
    },
    options: { responsive: false },
  })

  await new Promise((r) => setTimeout(r, 300))
  const severityImg = severityCanvas.toDataURL("image/png")

  doc.addImage(severityImg, "PNG", 10, y, 190, 70)
  y += 85

  doc.setFontSize(16)
  doc.text("Top Threats", 14, y)
  y += 10

  doc.setFontSize(10)
  mockThreats.slice(0, 5).forEach((t) => {
    doc.text(`• Post: ${t.text}`, 14, y) // FIX TYPE: .text instead of .content
    doc.text(`Severity: ${t.severity}`, 160, y)
    y += 8
  })

  doc.save("konfam-premium-report.pdf")
}
