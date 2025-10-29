import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FinancialForm.css";
import { calculateSIPValue, formatINR, monthsBetween } from "../../components/helper";
import { Section } from "../../components/Section";
import { InputRow } from "../../components/InputRow";
import { YesNo } from "../../components/YesNo";

const FinancialForm = () => {
    const navigate = useNavigate();

    // Base Template
    const initialData = {
        incomes: [{ source: "", amount: "" }],
        expenses: [{ type: "", amount: "" }],
        loans: [
            {
                name: "",
                amount: "",
                interest: "",
                tenureMonths: "",
                monthlyEMI: "",
                totalPaidEMI: "",
                totalEMIRemaining: ""
            },
        ],
        goals: [{ description: "", timeframe: "", targetAmount: "" }],
        investments: [{ type: "", amount: "", returnRate: "" }],
        sips: [{ name: "", monthly: "", startDate: "", expectedReturn: "" }],
        hasHealthInsurance: null,
        hasLifeInsurance: null,
        ownsHouse: null,
        monthlyRent: "",
        hasHealthIssues: null,
        healthIssues: [{ description: "", estimatedCost: "" }],
    };

    // State
    const [formData, setFormData] = useState(initialData);
    const [sipSummaries, setSipSummaries] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helpers
    const handleAdd = (key, template) =>
        setFormData((p) => ({ ...p, [key]: [...p[key], template] }));

    const handleDelete = (key, index) =>
        setFormData((p) => ({
            ...p,
            [key]: p[key].filter((_, i) => i !== index),
        }));

    const handleChange = (key, index, field, value) =>
        setFormData((p) => {
            const updated = [...p[key]];
            updated[index][field] = value;
            return { ...p, [key]: updated };
        });

    useEffect(() => {
        try {
            const savedData = localStorage.getItem("financialFormData");
            if (savedData) {
                const parsed = JSON.parse(savedData);

                if (JSON.stringify(parsed) !== JSON.stringify(formData)) {
                    setFormData(parsed);
                }
            }
        } catch (err) {
            console.error("Error loading saved data:", err);
        }
    }, []);

    // Save changes (but not repeatedly if identical)
    useEffect(() => {
        localStorage.setItem("financialFormData", JSON.stringify(formData));
    }, [formData]);

    // 📈 Recalculate SIP stats
    useEffect(() => {
        const summaries = formData.sips.map((sip) => {
            const months = monthsBetween(sip.startDate);
            const totalInvested = (Number(sip.monthly) || 0) * months;
            const estValue = calculateSIPValue(
                sip.monthly,
                months,
                sip.expectedReturn
            );
            return {
                name: sip.name || "-",
                months,
                totalInvested,
                estimatedValue: estValue,
            };
        });
        setSipSummaries(summaries);
    }, [formData.sips]);

    const getFinancialAdvice = async (payload) => {
        const res = await fetch("/.netlify/functions/getAdvice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("AI API Error");
        const data = await res.json();
        return data.advice;
    };
    
    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const advice = await getFinancialAdvice(formData);
            if (advice.trim()) navigate("/result", { state: { advice } });
            else alert("⚠ No advice returned from API!");
        } catch (err) {
            console.error(err);
            alert("⚠ Error fetching advice!");
        } finally {
            setLoading(false);
        }
    };

    // Reset
    const handleReset = () => {
        if (window.confirm("Reset form & clear saved data?")) {
            localStorage.removeItem("financialFormData");
            setFormData(initialData);
        }
    };

    // otals
    const totalInvestedAll = sipSummaries.reduce((s, x) => s + x.totalInvested, 0);
    const totalEstimatedAll = sipSummaries.reduce(
        (s, x) => s + x.estimatedValue,
        0
    );

    // UI
    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <p>🧠 Generating your personalized financial advice...</p>
                </div>
            )}

            <form className="financial-form" onSubmit={handleSubmit}>
                <h1>🧠 Smart Financial Advisor Form</h1>

                <Section title="Income" onAdd={() => handleAdd("incomes", { source: "", amount: "" })}>
                    {formData.incomes.map((i, idx) => (
                        <InputRow
                            key={idx}
                            fields={[
                                { placeholder: "Source", value: i.source, onChange: (v) => handleChange("incomes", idx, "source", v) },
                                { placeholder: "Amount (₹)", type: "number", value: i.amount, onChange: (v) => handleChange("incomes", idx, "amount", v) },
                            ]}
                            onDelete={() => handleDelete("incomes", idx)}
                        />
                    ))}
                </Section>

                <Section title="Expenses" onAdd={() => handleAdd("expenses", { type: "", amount: "" })}>
                    {formData.expenses.map((e, idx) => (
                        <InputRow
                            key={idx}
                            fields={[
                                { placeholder: "Type", value: e.type, onChange: (v) => handleChange("expenses", idx, "type", v) },
                                { placeholder: "Amount (₹)", type: "number", value: e.amount, onChange: (v) => handleChange("expenses", idx, "amount", v) },
                            ]}
                            onDelete={() => handleDelete("expenses", idx)}
                        />
                    ))}
                </Section>

                <Section
                    title="Loans"
                    onAdd={() =>
                        handleAdd("loans", {
                            name: "",
                            amount: "",
                            interest: "",
                            tenureMonths: "",
                            monthlyEMI: "",
                            totalPaidEMI: "",
                            totalEMIRemaining: "",
                        })
                    }
                >
                    {formData.loans.map((l, idx) => {
                        // Auto-calc remaining EMI
                        const remaining =
                            Number(l.tenureMonths || 0) - Number(l.totalPaidEMI || 0);

                        return (
                            <div key={idx} className="loan-item">
                                <InputRow
                                    fields={[
                                        {
                                            placeholder: "Loan Name",
                                            value: l.name,
                                            onChange: (v) => handleChange("loans", idx, "name", v),
                                        },
                                        {
                                            placeholder: "Total Amount (₹)",
                                            type: "number",
                                            value: l.amount,
                                            onChange: (v) => handleChange("loans", idx, "amount", v),
                                        },
                                        {
                                            placeholder: "Interest Rate (%)",
                                            type: "number",
                                            value: l.interest,
                                            onChange: (v) => handleChange("loans", idx, "interest", v),
                                        },
                                        {
                                            placeholder: "Tenure (Months)",
                                            type: "number",
                                            value: l.tenureMonths,
                                            onChange: (v) => handleChange("loans", idx, "tenureMonths", v),
                                        },
                                    ]}
                                    onDelete={() => handleDelete("loans", idx)}
                                />

                                <InputRow
                                    fields={[
                                        {
                                            placeholder: "Monthly EMI (₹)",
                                            type: "number",
                                            value: l.monthlyEMI,
                                            onChange: (v) => handleChange("loans", idx, "monthlyEMI", v),
                                        },
                                        {
                                            placeholder: "Total EMI Paid",
                                            type: "number",
                                            value: l.totalPaidEMI,
                                            onChange: (v) => handleChange("loans", idx, "totalPaidEMI", v),
                                        }
                                    ]}
                                />

                                {/* 🧮 Auto Calculation Summary */}
                                <div className="loan-summary">
                                    <p>
                                        <strong>Total EMI Left:</strong> {remaining > 0 ? remaining : 0}
                                    </p>
                                    {l.monthlyEMI && remaining > 0 && (
                                        <p>
                                            <strong>Approx Remaining Balance:</strong>{" "}
                                            {formatINR(remaining * Number(l.monthlyEMI || 0))}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </Section>

                <Section title="Goals" onAdd={() => handleAdd("goals", { description: "", timeframe: "", targetAmount: "" })}>
                    {formData.goals.map((g, idx) => (
                        <InputRow
                            key={idx}
                            fields={[
                                { placeholder: "Goal Description", value: g.description, onChange: (v) => handleChange("goals", idx, "description", v) },
                                { placeholder: "Timeframe (Year)", value: g.timeframe, onChange: (v) => handleChange("goals", idx, "timeframe", v) },
                                { placeholder: "Target Amount (₹)", type: "number", value: g.targetAmount, onChange: (v) => handleChange("goals", idx, "targetAmount", v) },
                            ]}
                            onDelete={() => handleDelete("goals", idx)}
                        />
                    ))}
                </Section>

                <Section title="Investments" onAdd={() => handleAdd("investments", { type: "", amount: "", returnRate: "" })}>
                    {formData.investments.map((inv, idx) => (
                        <InputRow
                            key={idx}
                            fields={[
                                { placeholder: "Type (e.g. MF/Stock)", value: inv.type, onChange: (v) => handleChange("investments", idx, "type", v) },
                                { placeholder: "Amount (₹)", type: "number", value: inv.amount, onChange: (v) => handleChange("investments", idx, "amount", v) },
                                { placeholder: "Expected Return %", type: "number", value: inv.returnRate, onChange: (v) => handleChange("investments", idx, "returnRate", v) },
                            ]}
                            onDelete={() => handleDelete("investments", idx)}
                        />
                    ))}
                </Section>

                <Section title="SIP Portfolio" onAdd={() => handleAdd("sips", { name: "", monthly: "", startDate: "", expectedReturn: "" })}>
                    {formData.sips.map((sip, idx) => (
                        <div key={idx} className="sip-item">
                            <InputRow
                                fields={[
                                    { placeholder: "SIP Name", value: sip.name, onChange: (v) => handleChange("sips", idx, "name", v) },
                                    { placeholder: "Monthly SIP (₹)", type: "number", value: sip.monthly, onChange: (v) => handleChange("sips", idx, "monthly", v) },
                                    { placeholder: "Start Month & Year", type: "month", value: sip.startDate, onChange: (v) => handleChange("sips", idx, "startDate", v) },
                                    { placeholder: "Expected Return %", type: "number", value: sip.expectedReturn, onChange: (v) => handleChange("sips", idx, "expectedReturn", v) },
                                ]}
                                onDelete={() => handleDelete("sips", idx)}
                            />
                            {sipSummaries[idx] && (
                                <div className="sip-summary">
                                    <div><strong>Months:</strong> {sipSummaries[idx].months}</div>
                                    <div><strong>Invested:</strong> {formatINR(sipSummaries[idx].totalInvested)}</div>
                                    <div><strong>Est. Value:</strong> {formatINR(Math.round(sipSummaries[idx].estimatedValue))}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </Section>

                <div className="section totals">
                    <h2>SIP Totals</h2>
                    <p><strong>Total Invested:</strong> {formatINR(totalInvestedAll)}</p>
                    <p><strong>Estimated Value:</strong> {formatINR(Math.round(totalEstimatedAll))}</p>
                </div>

                <div className="section">
                    <h2>Insurance</h2>
                    <label>Do you have health insurance?</label>
                    <YesNo value={formData.hasHealthInsurance} onChange={(v) => setFormData((p) => ({ ...p, hasHealthInsurance: v }))} />
                    <label>Do you have life insurance?</label>
                    <YesNo value={formData.hasLifeInsurance} onChange={(v) => setFormData((p) => ({ ...p, hasLifeInsurance: v }))} />
                </div>

                <div className="section">
                    <h2>Housing</h2>
                    <label>Do you own a house?</label>
                    <YesNo value={formData.ownsHouse} onChange={(v) => setFormData((p) => ({ ...p, ownsHouse: v }))} />
                    {formData.ownsHouse === false && (
                        <input
                            className="rent-input"
                            type="number"
                            placeholder="Monthly Rent (₹)"
                            value={formData.monthlyRent ?? " "}
                            onChange={(e) => setFormData((p) => ({ ...p, monthlyRent: e.target.value }))}
                        />
                    )}
                </div>

                <div className="section">
                    <h2>Family Health Issues</h2>
                    <label>Any major health issues?</label>
                    <YesNo value={formData.hasHealthIssues} onChange={(v) => setFormData((p) => ({ ...p, hasHealthIssues: v }))} />
                    {formData.hasHealthIssues &&
                        formData.healthIssues.map((h, idx) => (
                            <InputRow
                                key={idx}
                                fields={[
                                    { placeholder: "Issue Description", value: h.description, onChange: (v) => handleChange("healthIssues", idx, "description", v) },
                                    { placeholder: "Estimated Cost (₹)", type: "number", value: h.estimatedCost, onChange: (v) => handleChange("healthIssues", idx, "estimatedCost", v) },
                                ]}
                                onDelete={() => handleDelete("healthIssues", idx)}
                            />
                        ))}
                    {formData.hasHealthIssues && (
                        <button type="button" className="add-btn" onClick={() => handleAdd("healthIssues", { description: "", estimatedCost: "" })}>
                            + Add Health Issue
                        </button>
                    )}
                </div>

                <div className="btn-group">
                    <button type="submit" className="submit-btn">📤 Submit for Advice</button>
                    <button type="button" className="reset-btn" onClick={handleReset}>♻ Reset Form</button>
                </div>
            </form>
        </>
    );
};

export default FinancialForm;
