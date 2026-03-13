"use client";

import { useState } from "react";
import { useModalStore } from "@/shared/hooks/useModalStore";

export default function DemandDepositTestPage() {
  const { alert: modalAlert } = useModalStore();
  const [accountTypeUniqueNo, setAccountTypeUniqueNo] = useState("001-1-7a336b19062347"); // 초기값으로 테스트용 방금 생성된 상품 번호
  const [testUserKey, setTestUserKey] = useState("9d60d884-543c-4ff1-abe0-b6f70251bea3"); // 신규 발급 키
  const [accountNo, setAccountNo] = useState("");
  
  const [createResult, setCreateResult] = useState<any>(null);
  const [inquireResult, setInquireResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    setLoading(true);
    setCreateResult(null);
    try {
      const res = await fetch("http://localhost:8080/api/v1/demand-deposits/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountTypeUniqueNo,
          testUserKey
        }),
      });
      const data = await res.json();
      setCreateResult(data);
      if (data?.data?.REC?.accountNo) {
         setAccountNo(data.data.REC.accountNo);
      }
    } catch (err: any) {
      setCreateResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInquireAccount = async () => {
    if (!accountNo) {
      modalAlert({ message: "조회할 계좌번호를 입력하세요." });
      return;
    }
    setLoading(true);
    setInquireResult(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/demand-deposits/accounts/${accountNo}?testUserKey=${testUserKey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setInquireResult(data);
    } catch (err: any) {
      setInquireResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const [historyResult, setHistoryResult] = useState<any>(null);

  const handleHistory = async () => {
    if (!accountNo) {
      modalAlert({ message: "조회할 계좌번호를 먼저 입력하세요." });
      return;
    }
    setLoading(true);
    setHistoryResult(null);
    try {
      // 1원 인증 등 입금 내역 확인을 위해 거래내역 조회 (GET param으로 endDate, transactionType 등은 기본값 사용)
      const res = await fetch(`http://localhost:8080/api/v1/demand-deposits/accounts/${accountNo}/transactions?testUserKey=${testUserKey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setHistoryResult(data);
    } catch (err: any) {
      setHistoryResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>수시입출금 계좌 테스트</h1>

      <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>1. 계좌 생성</h2>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>User Key (테스트용)</label>
          <input 
            value={testUserKey} 
            onChange={(e) => setTestUserKey(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
          />
          <label style={{ display: "block", marginBottom: "0.5rem" }}>상품 고유번호 (accountTypeUniqueNo)</label>
          <input 
            value={accountTypeUniqueNo} 
            onChange={(e) => setAccountTypeUniqueNo(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button 
          onClick={handleCreateAccount} 
          disabled={loading}
          style={{ padding: "0.5rem 1rem", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "처리중..." : "계좌 생성하기"}
        </button>

        {createResult && (
          <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "4px", overflow: "auto" }}>
            <h3>생성 결과:</h3>
            <pre style={{ fontSize: "0.875rem" }}>{JSON.stringify(createResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>2. 계좌 조회</h2>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>조회할 계좌번호 (accountNo)</label>
          <input 
            value={accountNo} 
            onChange={(e) => setAccountNo(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button 
          onClick={handleInquireAccount} 
          disabled={loading}
          style={{ padding: "0.5rem 1rem", backgroundColor: "#000", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "처리중..." : "계좌 조회하기"}
        </button>

        {inquireResult && (
          <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "4px", overflow: "auto" }}>
            <h3>조회 결과:</h3>
            <pre style={{ fontSize: "0.875rem" }}>{JSON.stringify(inquireResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px", marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>3. 계좌 거래내역 조회 (1원 인증 등)</h2>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
            * 2. 계좌 조회 기능에서 사용한 `accountNo` 값과 동일한 계좌를 조회합니다.
          </p>
        </div>
        <button 
          onClick={handleHistory} 
          disabled={loading}
          style={{ padding: "0.5rem 1rem", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "처리중..." : "거래내역 조회하기"}
        </button>

        {historyResult && (
          <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "4px", overflow: "auto", maxHeight: "400px" }}>
            <h3>내역 조회 결과:</h3>
            <pre style={{ fontSize: "0.875rem" }}>{JSON.stringify(historyResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
