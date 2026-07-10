import React, { useEffect, useState } from "react";
import { FiLock, FiRefreshCw, FiUnlock } from "react-icons/fi";
import { api } from "../api";
import { Card, LoadingState, PageHeader, SectionHeader } from "../components/ui";

export default function BusinessDay() {
  const [businessDay, setBusinessDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadBusinessDay();
  }, []);

  async function loadBusinessDay() {
    try {
      setBusinessDay(await api.getTodayBusinessDay());
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function run(action) {
    try {
      setBusy(true);
      await action();
      await loadBusinessDay();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading business day" />
      </div>
    );
  }

  const status = businessDay?.status ?? "NOT OPENED";

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operations"
        title="Business Day"
        description="Open, close, or reopen today's trading day."
      />

      <Card>
        <SectionHeader
          title="Today"
          description={businessDay?.business_date ?? new Date().toISOString().slice(0, 10)}
          actions={
            <button className="btn btn-outline" onClick={loadBusinessDay} type="button">
              <FiRefreshCw /> Refresh
            </button>
          }
        />
        <div className="card-body stack">
          <div className="activity-item">
            <div>
              <strong>Status</strong>
              <span>{status}</span>
            </div>
            <span className={`badge ${status === "OPEN" ? "badge-success" : "badge-danger"}`}>
              {status}
            </span>
          </div>
          <div className="quick-actions">
            <button
              className="btn btn-primary"
              disabled={busy || status === "OPEN"}
              onClick={() => run(api.openTodayBusinessDay)}
              type="button"
            >
              <FiUnlock /> Open Day
            </button>
            <button
              className="btn btn-outline-danger"
              disabled={busy || status !== "OPEN"}
              onClick={() => run(() => api.closeTodayBusinessDay())}
              type="button"
            >
              <FiLock /> Close Day
            </button>
            <button
              className="btn btn-outline"
              disabled={busy || status !== "CLOSED"}
              onClick={() => run(() => api.reopenTodayBusinessDay())}
              type="button"
            >
              <FiUnlock /> Reopen Day
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
