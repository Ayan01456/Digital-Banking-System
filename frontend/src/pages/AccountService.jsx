import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClaudeBadge from "../components/ClaudeBadge";

const API = "https://digital-banking-system-production.up.railway.app";

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function AccountService() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const token = localStorage.getItem("token");

  const [screen, setScreen] = useState("loading");
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const [activeService, setActiveService] = useState(null);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [accountNumberVisible, setAccountNumberVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Send Money state
  const [sendForm, setSendForm] = useState({ toAccountNumber: "", amount: "", description: "" });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendResult, setSendResult] = useState(null); // { type: "success"|"error", message: "" }

  // Transaction History state
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState("");

  useEffect(() => { fetchAccount(); }, []);

  const fetchAccount = async () => {
    try {
      const res = await fetch(`${API}/accounts/my-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
        setScreen("services");
      } else {
        setScreen("no-account");
      }
    } catch (err) {
      setScreen("no-account");
    }
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API}/accounts/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
        setScreen("welcome");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to account service.");
    } finally {
      setCreating(false);
    }
  };

  const maskAccountNumber = (accNum) => {
    if (!accNum) return "";
    return accNum.slice(0, -4).replace(/./g, "•") + accNum.slice(-4);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(account?.accountNumber || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleServiceClick = (service) => {
    const next = activeService === service ? null : service;
    setActiveService(next);
    setSendResult(null);
    setSendForm({ toAccountNumber: "", amount: "", description: "" });
    setTxError("");
    if (next === "history") fetchTransactions();
  };

  // ── SEND MONEY ──
  const handleSendChange = (e) => {
    setSendForm({ ...sendForm, [e.target.name]: e.target.value });
    setSendResult(null);
  };

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    setSendResult(null);

    const amount = parseFloat(sendForm.amount);
    if (!sendForm.toAccountNumber.trim()) {
      setSendResult({ type: "error", message: "Please enter the receiver's account number." });
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setSendResult({ type: "error", message: "Please enter a valid amount greater than zero." });
      return;
    }

    setSendLoading(true);
    try {
      const res = await fetch(`${API}/accounts/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toAccountNumber: sendForm.toAccountNumber.trim(),
          amount: amount,
          description: sendForm.description.trim() || "Transfer",
        }),
      });

      const text = await res.text();

      if (res.ok) {
        setSendResult({ type: "success", message: text });
        setSendForm({ toAccountNumber: "", amount: "", description: "" });
        // refresh balance
        fetchAccount();
      } else {
        // Map backend error messages to friendly ones
        if (text.toLowerCase().includes("insufficient")) {
          setSendResult({ type: "error", message: "Insufficient balance. You don't have enough funds for this transfer." });
        } else if (text.toLowerCase().includes("receiver") || text.toLowerCase().includes("not found")) {
          setSendResult({ type: "error", message: "Receiver account not found. Please check the account number." });
        } else {
          setSendResult({ type: "error", message: text || "Transfer failed. Please try again." });
        }
      }
    } catch (err) {
      setSendResult({ type: "error", message: "Could not connect to the server. Please try again." });
    } finally {
      setSendLoading(false);
    }
  };

  // ── TRANSACTION HISTORY ──
  const fetchTransactions = async () => {
    setTxLoading(true);
    setTxError("");
    try {
      const res = await fetch(`${API}/accounts/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        setTxError("Could not load transaction history.");
      }
    } catch (err) {
      setTxError("Could not connect to the server.");
    } finally {
      setTxLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // ── TOPBAR (reused) ──
  const Topbar = () => (
    <nav className="as-topbar">
      <div className="topbar-brand">
        <div className="brand-icon small">D</div>
        <span className="brand-name">Digital Banking System</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-username">{username}</span>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>← Back</button>
      </div>
    </nav>
  );

  // ── LOADING ──
  if (screen === "loading") return (
    <div className="as-wrapper">
      <Topbar />
      <div className="as-center"><div className="as-spinner" /></div>
      <ClaudeBadge />
    </div>
  );

  // ── NO ACCOUNT ──
  if (screen === "no-account") return (
    <div className="as-wrapper">
      <Topbar />
      <div className="as-center">
        <div className="as-no-account-card">
          <div className="as-no-account-icon">🏦</div>
          <h2>No Account Found</h2>
          <p>You don't have a bank account yet. Create one to get started.</p>
          {error && <div className="alert alert-error" style={{ marginTop: "16px" }}>{error}</div>}
          <button className="btn-primary as-create-btn" onClick={handleCreateAccount} disabled={creating}>
            {creating ? "Creating..." : "Get Account"}
          </button>
        </div>
      </div>
      <ClaudeBadge />
    </div>
  );

  // ── WELCOME ──
  if (screen === "welcome") return (
    <div className="as-wrapper">
      <Topbar />
      <div className="as-center">
        <div className="as-welcome-card">
          <div className="as-welcome-icon">🎉</div>
          <h2>Welcome, {username}!</h2>
          <p>Your account has been created successfully. Let's start your banking journey.</p>
          <button className="btn-primary as-create-btn" onClick={() => setScreen("services")}>
            Let's Explore →
          </button>
        </div>
      </div>
      <ClaudeBadge />
    </div>
  );

  // ── SERVICES ──
  return (
    <div className="as-wrapper">
      <Topbar />

      <div className="as-body">
        {/* Service Cards */}
        <div className="as-services-grid">
          <button
            className={`as-service-card ${activeService === "balance" ? "active" : ""}`}
            onClick={() => handleServiceClick("balance")}
          >
            <span className="as-service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </span>
            <span className="as-service-label">Check Balance</span>
          </button>

          <button
            className={`as-service-card ${activeService === "receive" ? "active" : ""}`}
            onClick={() => handleServiceClick("receive")}
          >
            <span className="as-service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="8 17 12 21 16 17"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
              </svg>
            </span>
            <span className="as-service-label">Receive Money</span>
          </button>

          <button
            className={`as-service-card ${activeService === "send" ? "active" : ""}`}
            onClick={() => handleServiceClick("send")}
          >
            <span className="as-service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 7 12 3 8 7"/>
                <line x1="12" y1="3" x2="12" y2="12"/>
                <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
              </svg>
            </span>
            <span className="as-service-label">Send Money</span>
          </button>

          <button
            className={`as-service-card ${activeService === "history" ? "active" : ""}`}
            onClick={() => handleServiceClick("history")}
          >
            <span className="as-service-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
            </span>
            <span className="as-service-label">Transactions</span>
          </button>
        </div>

        {/* ── CHECK BALANCE ── */}
        {activeService === "balance" && (
          <div className="as-panel">
            <div className="as-panel-header">
              <h3>Check Balance</h3>
              <p>Your account overview</p>
            </div>
            <div className="as-balance-rows">
              <div className="as-info-row">
                <span className="as-info-label">Account Holder</span>
                <span className="as-info-value">{username}</span>
              </div>
              <div className="as-info-row">
                <span className="as-info-label">Account Number</span>
                <span className="as-info-value as-acc-num">
                  {accountNumberVisible ? account?.accountNumber : maskAccountNumber(account?.accountNumber)}
                  <button className="as-eye-btn" onClick={() => setAccountNumberVisible(!accountNumberVisible)}>
                    {accountNumberVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </span>
              </div>
              <div className="as-info-row">
                <span className="as-info-label">Available Balance</span>
                <span className="as-info-value as-acc-num">
                  {balanceVisible
                    ? `₹ ${Number(account?.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "₹ ••••••"}
                  <button className="as-eye-btn" onClick={() => setBalanceVisible(!balanceVisible)}>
                    {balanceVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── RECEIVE MONEY ── */}
        {activeService === "receive" && (
          <div className="as-panel">
            <div className="as-panel-header">
              <h3>Receive Money</h3>
              <p>Share your account number to receive funds</p>
            </div>
            <div className="as-receive-steps">
              <div className="as-step">
                <div className="as-step-num">1</div>
                <p>Copy your account number using the button below.</p>
              </div>
              <div className="as-step">
                <div className="as-step-num">2</div>
                <p>Share it with the person who wants to send you money.</p>
              </div>
              <div className="as-step">
                <div className="as-step-num">3</div>
                <p>Ask them to paste your account number in the <strong>Send Money</strong> section on their end.</p>
              </div>
              <div className="as-step">
                <div className="as-step-num">4</div>
                <p>Once they confirm the transfer, the amount will be credited to your account.</p>
              </div>
            </div>
            <div className="as-account-box">
              <span className="as-account-box-label">Your Account Number</span>
              <div className="as-account-box-row">
                <span className="as-account-box-number">{account?.accountNumber}</span>
                <button className="as-copy-btn" onClick={handleCopy}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SEND MONEY ── */}
        {activeService === "send" && (
          <div className="as-panel">
            <div className="as-panel-header">
              <h3>Send Money</h3>
              <p>Transfer funds to another account</p>
            </div>

            {sendResult && (
              <div className={`alert ${sendResult.type === "success" ? "alert-success" : "alert-error"}`}
                style={{ marginBottom: "20px" }}>
                {sendResult.message}
              </div>
            )}

            <form onSubmit={handleSendSubmit} className="as-send-form">
              <div className="field">
                <label htmlFor="toAccountNumber">Receiver Account Number</label>
                <input
                  id="toAccountNumber"
                  name="toAccountNumber"
                  type="text"
                  placeholder="e.g. BANK1234567890"
                  value={sendForm.toAccountNumber}
                  onChange={handleSendChange}
                />
              </div>

              <div className="field">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={sendForm.amount}
                  onChange={handleSendChange}
                />
              </div>

              <div className="field">
                <label htmlFor="description">Description <span className="as-optional">(optional)</span></label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="e.g. Rent, Lunch, etc."
                  value={sendForm.description}
                  onChange={handleSendChange}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={sendLoading}
                style={{ marginTop: "8px" }}>
                {sendLoading ? "Sending..." : "Send Money"}
              </button>
            </form>
          </div>
        )}

        {/* ── TRANSACTION HISTORY ── */}
        {activeService === "history" && (
          <div className="as-panel">
            <div className="as-panel-header">
              <h3>Transaction History</h3>
              <p>Your last 10 transactions</p>
            </div>

            {txLoading && <div className="as-tx-empty">Loading...</div>}
            {txError && <div className="alert alert-error">{txError}</div>}

            {!txLoading && !txError && transactions.length === 0 && (
              <div className="as-tx-empty">No transactions found.</div>
            )}

            {!txLoading && transactions.length > 0 && (
              <div className="as-tx-window">
                {transactions.map((tx) => (
                  <div key={tx.id} className="as-tx-row">
                    <div className="as-tx-left">
                      <div className="as-tx-accounts">
                        <span className="as-tx-label">From</span>
                        <span className="as-tx-acc">{tx.senderAccountNumber}</span>
                      </div>
                      <div className="as-tx-arrow">→</div>
                      <div className="as-tx-accounts">
                        <span className="as-tx-label">To</span>
                        <span className="as-tx-acc">{tx.receiverAccountNumber}</span>
                      </div>
                    </div>
                    <div className="as-tx-right">
                      <span className="as-tx-amount">
                        ₹ {Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`as-tx-status ${tx.status === "SUCCESS" ? "success" : "failed"}`}>
                        {tx.status}
                      </span>
                      <span className="as-tx-date">{formatDate(tx.timestamp)}</span>
                      {tx.description && <span className="as-tx-desc">{tx.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ClaudeBadge />
    </div>
  );
}