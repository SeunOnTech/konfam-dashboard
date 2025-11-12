// lib/demo-data.ts
// Mock data for demo and development

import type { Threat, BankData, SentimentData } from "./types"

export const mockThreats: Threat[] = [
  {
    id: "1",
    severity: "HIGH",
    post: {
      content: "T Bank don freeze my account! I no fit withdraw money 😭 This is serious o",
      author: "@worried_customer",
      timestamp: "2 mins ago",
      engagement: { likes: 234, retweets: 89, replies: 45 },
    },
    detectedAt: new Date(Date.now() - 2 * 60000),
    keywords: ["freeze", "account", "withdraw"],
    panicFactor: 0.78,
    threatLevel: 0.65,
  },
  {
    id: "2",
    severity: "HIGH",
    post: {
      content: "Why are ATMs down across Lagos? T Bank needs to explain themselves!",
      author: "@irate_user_ng",
      timestamp: "5 mins ago",
      engagement: { likes: 567, retweets: 234, replies: 123 },
    },
    detectedAt: new Date(Date.now() - 5 * 60000),
    keywords: ["ATM", "down", "explain"],
    panicFactor: 0.65,
    threatLevel: 0.58,
  },
  {
    id: "3",
    severity: "MEDIUM",
    post: {
      content: "Transfer delays this morning... is T Bank okay? 🤔",
      author: "@concerned_trader",
      timestamp: "12 mins ago",
      engagement: { likes: 89, retweets: 34, replies: 12 },
    },
    detectedAt: new Date(Date.now() - 12 * 60000),
    keywords: ["transfer", "delays", "okay"],
    panicFactor: 0.42,
    threatLevel: 0.35,
  },
  {
    id: "4",
    severity: "MEDIUM",
    post: {
      content: "Just noticed my balance looks different. Anyone else experiencing this?",
      author: "@suspicious_acc",
      timestamp: "8 mins ago",
      engagement: { likes: 156, retweets: 67, replies: 89 },
    },
    detectedAt: new Date(Date.now() - 8 * 60000),
    keywords: ["balance", "different", "experiencing"],
    panicFactor: 0.55,
    threatLevel: 0.45,
  },
  {
    id: "5",
    severity: "LOW",
    post: {
      content: "T Bank mobile app bit slow today sha",
      author: "@casual_user",
      timestamp: "15 mins ago",
      engagement: { likes: 12, retweets: 3, replies: 2 },
    },
    detectedAt: new Date(Date.now() - 15 * 60000),
    keywords: ["app", "slow"],
    panicFactor: 0.25,
    threatLevel: 0.15,
  },
]

export const mockBankData: BankData = {
  systemStatus: "OPERATIONAL",
  atmUptime: 98.5,
  activeTransactions: 15420,
  accountsActive: 2458000,
  transactionStream: [
    { time: "10:45:23", amount: "₦5,000 - ₦50,000", type: "Transfer", status: "SUCCESS" },
    { time: "10:45:18", amount: "₦100,000+", type: "Withdrawal", status: "SUCCESS" },
    { time: "10:45:12", amount: "₦10,000 - ₦100,000", type: "Payment", status: "SUCCESS" },
    { time: "10:45:07", amount: "₦5,000 - ₦50,000", type: "Transfer", status: "SUCCESS" },
    { time: "10:44:58", amount: "₦100,000+", type: "Deposit", status: "SUCCESS" },
    { time: "10:44:52", amount: "₦50,000 - ₦100,000", type: "Transfer", status: "SUCCESS" },
    { time: "10:44:45", amount: "₦10,000 - ₦100,000", type: "Payment", status: "SUCCESS" },
    { time: "10:44:38", amount: "₦5,000 - ₦50,000", type: "Transfer", status: "SUCCESS" },
  ],
  lastUpdated: new Date(),
}

export const mockSentimentData: SentimentData[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000),
  score: Math.max(20, Math.min(90, 50 + Math.sin(i / 4) * 30 + Math.random() * 10)),
  tweetCount: Math.floor(100 + Math.random() * 500),
  panicLevel: Math.max(0, Math.min(100, 40 + Math.sin(i / 3) * 35 + Math.random() * 15)),
}))
