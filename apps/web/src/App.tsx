import { useState, useEffect, useCallback } from "react";
import type { SaleStatus, SaleStatusResponse } from "@flash-sale/shared";
import { cn } from "./lib/utils.js";

type PurchaseState = "idle" | "loading" | "success" | "already_purchased" | "sold_out" | "error";

const STATUS_LABEL: Record<SaleStatus, string> = {
  active: "Live Now",
  upcoming: "Coming Soon",
  ended: "Sale Ended",
};

const FEEDBACK: Record<Exclude<PurchaseState, "idle">, string> = {
  loading: "Processing your order...",
  success: "Purchase confirmed! Your order is being processed.",
  already_purchased: "You have already purchased this item.",
  sold_out: "Sorry, this item is sold out.",
  error: "Something went wrong. Please try again.",
};

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export default function App() {
  const [saleData, setSaleData] = useState<SaleStatusResponse | null>(null);
  const [userId, setUserId] = useState("");
  const [purchaseState, setPurchaseState] = useState<PurchaseState>("idle");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sale/status`);
      if (res.ok) setSaleData(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handlePurchase = async () => {
    if (!userId.trim() || purchaseState === "loading") return;
    setPurchaseState("loading");
    try {
      const res = await fetch(`${API_BASE}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      if (res.status === 201) {
        setPurchaseState("success");
        fetchStatus();
      } else if (res.status === 409) {
        setPurchaseState("already_purchased");
      } else if (res.status === 410) {
        setPurchaseState("sold_out");
        fetchStatus();
      } else {
        setPurchaseState("error");
      }
    } catch {
      setPurchaseState("error");
    }
  };

  const status = saleData?.status ?? "upcoming";
  const isActive = status === "active";
  const canSubmit =
    isActive &&
    userId.trim().length > 0 &&
    purchaseState !== "loading" &&
    purchaseState !== "success";

  let stockDisplay;
  if (saleData) {
    stockDisplay = (
      <>
        <p className="text-5xl font-black text-slate-200 leading-none">{saleData.stockRemaining}</p>
        <p className="text-sm text-white/50 mt-1 mb-6">items remaining</p>
      </>
    );
  } else {
    stockDisplay = <p className="text-sm text-white/50 mt-2 mb-6">Loading...</p>;
  }

  let upcomingNote = null;
  if (status === "upcoming" && saleData) {
    upcomingNote = (
      <p className="text-sm text-white/60 mb-6">
        Starts at {new Date(saleData.startTime).toLocaleString()}
      </p>
    );
  }

  let endedNote = null;
  if (status === "ended") {
    endedNote = (
      <p className="text-sm text-white/60 mb-6">
        This flash sale has ended. Thank you for participating!
      </p>
    );
  }

  let purchaseForm = null;
  if (isActive) {
    purchaseForm = (
      <>
        <input
          className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/[0.08] text-white text-base outline-none mb-3 placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          type="text"
          placeholder="Enter your user ID"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            if (purchaseState !== "idle") setPurchaseState("idle");
          }}
          onKeyDown={(e) => e.key === "Enter" && handlePurchase()}
          maxLength={255}
          disabled={purchaseState === "loading"}
        />
        <button
          className={cn(
            "w-full py-3.5 rounded-xl text-base font-bold transition-opacity",
            canSubmit
              ? "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white cursor-pointer hover:opacity-90"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
          onClick={handlePurchase}
          disabled={!canSubmit}
        >
          {purchaseState === "loading" ? "Processing..." : "Buy Now"}
        </button>
      </>
    );
  }

  let feedbackBanner = null;
  if (purchaseState !== "idle") {
    feedbackBanner = (
      <div
        className={cn(
          "mt-4 px-4 py-3.5 rounded-xl text-sm font-medium border",
          purchaseState === "success" && "bg-green-400/15 border-green-400/40 text-green-400",
          purchaseState === "loading" && "bg-white/5 border-white/10 text-white/50",
          purchaseState === "sold_out" && "bg-red-500/15 border-red-500/40 text-red-400",
          purchaseState === "already_purchased" &&
            "bg-amber-400/15 border-amber-400/40 text-amber-400",
          purchaseState === "error" && "bg-red-500/15 border-red-500/40 text-red-400"
        )}
      >
        {FEEDBACK[purchaseState]}
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4 font-sans text-white">
      <div className="glass-card w-full max-w-md rounded-3xl p-10 shadow-2xl">
        <span
          className={cn(
            "inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border",
            status === "active" && "bg-green-400/20 text-green-400 border-green-400",
            status === "upcoming" && "bg-amber-400/20 text-amber-400 border-amber-400",
            status === "ended" && "bg-red-500/20 text-red-500 border-red-500"
          )}
        >
          {STATUS_LABEL[status]}
        </span>

        <h1 className="text-[1.75rem] font-extrabold mt-4 mb-1 -tracking-tight">Flash Sale</h1>

        {stockDisplay}
        {upcomingNote}
        {endedNote}
        {purchaseForm}
        {feedbackBanner}
      </div>
    </div>
  );
}
