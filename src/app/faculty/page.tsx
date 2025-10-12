"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MdDelete, MdAdd, MdSearch, MdFilterList, MdApartment, MdFileUpload, MdArrowRightAlt, MdExpandMore, MdExpandLess, MdLock, MdViewAgenda, MdViewModule } from "react-icons/md";
import { useToast } from "@/components/Toast/Toast";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import * as xlsx from "xlsx";
import type { WorkBook, WorkSheet } from "xlsx";
import { DaySlots, FacultyType } from "@/lib/types"; // uses your shared type
import Link from "next/link";
import { useConfirm } from "@/components/Confirm/Confirm";

type DepartmentMember = Pick<FacultyType, "email" | "name">;
type DayKey = keyof DaySlots;
const days: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function FacultyPage() {
    const { toast } = useToast();
    const { confirm: confirmDialog } = useConfirm();
    const {
        isLoading,
        currentDepartment,
        departmentFaculty,
        refreshDepartmentFaculty,
        replaceDepartmentFaculty,
        removeDepartmentFaculty,
        updateFacultyAddedUnavailabilityFor,
        deleteFacultyAddedUnavailabilityFor
    } = useCalendarContext();
    const [isBusy, setIsBusy] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [filterDomain, setFilterDomain] = useState("all");
    const [openEmail, setOpenEmail] = useState<string | null>(null);

    // Import handling
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState("");
    const [parsedPreview, setParsedPreview] = useState<DepartmentMember[] | null>(null);

    // Layout toggle: 'one' = 1/card per row, 'three' = 3/cards per row (current)
    const [cardsLayout, setCardsLayout] = useState<"one" | "three">("three");

    // Compute grid classes from the toggle
    const cardsGridClass = useMemo(() => {
        return cardsLayout === "one"
            ? "grid grid-cols-1 gap-6"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6";
    }, [cardsLayout]);

    const innerCardClass = useMemo(() => {
        return cardsLayout === "one"
            ? "grid grid-cols-1 sm:grid-cols-5 gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 gap-4";
    }, [cardsLayout]);

    const departmentId = currentDepartment?._id ?? null;

    // ---- Context-backed helpers ----
    async function removeFaculty(email: string) {
        if (!departmentId) return;
        const ok = await confirmDialog({
            title: `Remove faculty ${email}?`,
            description: "This removes them from this department only (directory profile remains).",
            confirmText: "Remove",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;
        setIsBusy(true);
        try {
            const success = await removeDepartmentFaculty(email);
            if (!success) {
                toast({ description: "Failed to remove faculty", variant: "error" });
                return;
            }
            toast({ description: "Removed faculty", variant: "success" });
        } finally {
            setIsBusy(false);
        }
    }

    // ---- Load on department change ----
    useEffect(() => {
        if (!departmentId) {
            setIsBusy(false);
            return;
        }
        setIsBusy(true);
        refreshDepartmentFaculty()
            .then(() => {
                /* no-op */
            })
            .catch(() => toast({ description: "Failed to load faculty", variant: "error" }))
            .finally(() => setIsBusy(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId]);

    // ---- Filtering ----
    const domains = useMemo(() => {
        const set = new Set<string>();
        (departmentFaculty ?? []).forEach(({ email }) => {
            const at = email.indexOf("@");
            if (at > -1) set.add(email.slice(at + 1));
        });
        return ["all", ...Array.from(set).sort()];
    }, [departmentFaculty]);

    const filtered = useMemo(() => {
        return (departmentFaculty ?? []).filter(({ email, name }) => {
            const q = searchTerm.toLowerCase();
            const matchesSearch =
                email.toLowerCase().includes(q) || (name || "").toLowerCase().includes(q);
            const matchesDomain =
                filterDomain === "all" || email.toLowerCase().endsWith("@" + filterDomain.toLowerCase());
            return matchesSearch && matchesDomain;
        });
    }, [departmentFaculty, searchTerm, filterDomain]);

    // ---- Add one ----
    const handleAdd = async () => {
        const email = newEmail.trim();
        const name = newName.trim();
        if (!email || !email.includes("@")) {
            toast({ description: "Enter a valid email", variant: "error" });
            return;
        }
        // optimistic merge with current context list
        const existing = (departmentFaculty ?? []).find((f) => f.email.toLowerCase() === email.toLowerCase());
        const next: DepartmentMember[] = existing
            ? (departmentFaculty ?? []).map((f) =>
                f.email.toLowerCase() === email.toLowerCase() ? { email: f.email, name: name || f.name || "" } : { email: f.email, name: f.name || "" }
            )
            : [...(departmentFaculty ?? []).map((f) => ({ email: f.email, name: f.name || "" })), { email, name }];

        setIsBusy(true);
        try {
            const ok = await replaceDepartmentFaculty(next);
            if (!ok) {
                toast({ description: "Failed to save list", variant: "error" });
                return;
            }
            toast({ description: "Faculty list saved", variant: "success" });
        } finally {
            setIsBusy(false);
        }
        setNewEmail("");
        setNewName("");
    };

    // ---- Upload / Parse ----
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setParsedPreview(null);
        setIsBusy(true);

        try {
            const data = await file.arrayBuffer();
            const wb: WorkBook = xlsx.read(data, { type: "array" });
            const sheetName = wb.SheetNames[0];
            const ws: WorkSheet = wb.Sheets[sheetName];

            // prefer AOA for robust header detection
            const rows: (string | number | null | undefined)[][] = xlsx.utils.sheet_to_json(ws, { header: 1 });
            if (!rows || rows.length === 0) {
                toast({ description: "No rows found in file", variant: "error" });
                return;
            }

            // Find header row containing at least an email column
            const { headerIndex, emailIdx, nameIdx } = detectHeader(rows);
            if (headerIndex === -1 || emailIdx === -1) {
                toast({ description: "Could not detect an Email column", variant: "error" });
                return;
            }

            const parsed: DepartmentMember[] = [];
            for (let r = headerIndex + 1; r < rows.length; r++) {
                const row = rows[r];
                if (!row || row.length === 0) continue;
                const rawEmail = row[emailIdx];
                const rawName = nameIdx >= 0 ? row[nameIdx] : "";

                const email = (rawEmail ?? "").toString().trim();
                const name = (rawName ?? "").toString().trim();

                if (!email || !email.includes("@")) continue;
                parsed.push({ email, name });
            }

            const normalized = normalize(parsed);
            if (normalized.length === 0) {
                toast({ description: "No valid rows found (need at least an email)", variant: "error" });
                return;
            }

            setParsedPreview(normalized);
            toast({ description: `Parsed ${normalized.length} faculty`, variant: "success" });
        } catch (err) {
            console.error(err);
            toast({ description: "Failed to parse file", variant: "error" });
        } finally {
            setIsBusy(false);
        }
    };

    // merge append
    const handleAppendParsed = async () => {
        if (!parsedPreview) return;
        const currentAsInfo: DepartmentMember[] = (departmentFaculty ?? []).map((f) => ({ email: f.email, name: f.name ?? "" }));
        const map = new Map<string, DepartmentMember>(
            currentAsInfo.map((f) => [f.email.toLowerCase(), f] as const)
        );
        for (const f of parsedPreview) {
            const existing = map.get(f.email.toLowerCase());
            if (!existing) {
                map.set(f.email.toLowerCase(), f);
            } else if (f.name && f.name !== existing.name) {
                map.set(f.email.toLowerCase(), { email: existing.email, name: f.name });
            }
        }
        setIsBusy(true);
        try {
            const ok = await replaceDepartmentFaculty(Array.from(map.values()));
            if (!ok) toast({ description: "Failed to save list", variant: "error" });
            else toast({ description: "Faculty list saved", variant: "success" });
        } finally {
            setIsBusy(false);
        }
        setParsedPreview(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // replace all
    const handleReplaceAllParsed = async () => {
        if (!parsedPreview) return;
        setIsBusy(true);
        try {
            const ok = await replaceDepartmentFaculty(parsedPreview);
            if (!ok) toast({ description: "Failed to save list", variant: "error" });
            else toast({ description: "Faculty list saved", variant: "success" });
        } finally {
            setIsBusy(false);
        }
        setParsedPreview(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    function resetUploadUI() {
        setParsedPreview(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // ---- Helpers ----
    function sortFaculty(list: DepartmentMember[]) {
        return [...list].sort((a, b) => {
            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            if (an && bn && an !== bn) return an < bn ? -1 : 1;
            return a.email.toLowerCase() < b.email.toLowerCase() ? -1 : 1;
        });
    }

    function normalize(list: DepartmentMember[]) {
        const seen = new Map<string, DepartmentMember>();
        for (const f of list) {
            const email = f.email.trim();
            const name = (f.name || "").trim();
            if (!email || !email.includes("@")) continue;
            const key = email.toLowerCase();
            if (!seen.has(key)) {
                seen.set(key, { email, name });
            } else {
                // prefer non-empty name
                const cur = seen.get(key)!;
                if (!cur.name && name) seen.set(key, { email, name });
            }
        }
        return sortFaculty(Array.from(seen.values()));
    }

    function detectHeader(rows: (string | number | null | undefined)[][]) {
        const emailKeys = [
            "email",
            "e-mail",
            "mail",
            "faculty email",
            "instructor email",
            "professor email",
            "user email",
            "email address",
            "psu email",
        ];
        const nameKeys = ["name", "full name", "faculty name", "instructor name", "professor name"];

        const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row) continue;
            let emailIdx = -1;
            let nameIdx = -1;

            for (let c = 0; c < row.length; c++) {
                const cell = norm(row[c]);
                if (emailIdx === -1 && emailKeys.includes(cell)) emailIdx = c;
                if (nameIdx === -1 && nameKeys.includes(cell)) nameIdx = c;
            }

            if (emailIdx !== -1) {
                return { headerIndex: i, emailIdx, nameIdx };
            }
        }

        return { headerIndex: -1, emailIdx: -1, nameIdx: -1 };
    }

    // If you already compute a filtered list elsewhere, reuse it.
    // Otherwise, this gives you a simple name/email search filter.
    const visibleFaculty = (departmentFaculty ?? []).filter((f) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            (f.name || "").toLowerCase().includes(q) ||
            (f.email || "").toLowerCase().includes(q)
        );
    });

    const shown = visibleFaculty.length;
    const total = (departmentFaculty ?? []).length;
    const countLabel = shown === total ? `${total} total` : `Showing ${shown} of ${total}`;

    // ----- Unavailability editor helpers -----
    const [newSlotTimes, setNewSlotTimes] = useState<Record<string, Record<DayKey, { start: string; end: string }>>>({});

    useEffect(() => {
        // seed draft state when list changes
        const seed: Record<string, Record<DayKey, { start: string; end: string }>> = {};
        (departmentFaculty ?? []).forEach((r) => {
            seed[r.email] = {
                Mon: { start: "", end: "" },
                Tue: { start: "", end: "" },
                Wed: { start: "", end: "" },
                Thu: { start: "", end: "" },
                Fri: { start: "", end: "" },
            };
        });
        setNewSlotTimes(seed);
    }, [departmentFaculty]);

    const handleNewSlotChange = (email: string, day: DayKey, field: "start" | "end", value: string) => {
        setNewSlotTimes((prev) => ({
            ...prev,
            [email]: { ...prev[email], [day]: { ...prev[email]?.[day], [field]: value } },
        }));
    };

    const handleAddTimeSlot = async (email: string, day: DayKey) => {
        const row = (departmentFaculty ?? []).find((r) => r.email === email);
        if (!row) return;
        const { start, end } = newSlotTimes[email]?.[day] || { start: "", end: "" };
        if (!start || !end) return;
        setIsBusy(true);
        try {
            const next = {
                ...row.addedUnavailability,
                [day]: [...(row.addedUnavailability?.[day] ?? []), { start, end }],
            } as DaySlots;
            const ok = await updateFacultyAddedUnavailabilityFor(email, next);
            if (!ok) toast({ description: "Failed to add time slot", variant: "error" });
            else {
                // clear draft
                setNewSlotTimes((prev) => ({
                    ...prev,
                    [email]: { ...prev[email], [day]: { start: "", end: "" } },
                }));
            }
        } finally {
            setIsBusy(false);
        }
    };

    const handleRemoveTimeSlot = async (email: string, day: DayKey, start: string, end: string) => {
        const ok = await confirmDialog({
            title: "Remove time slot?",
            description: `Remove ${start} – ${end} on ${day}?`,
            confirmText: "Remove",
            cancelText: "Cancel",
            variant: "warning",
        });
        if (!ok) return;
        const row = (departmentFaculty ?? []).find((r) => r.email === email);
        if (!row) {toast({description: "No email found", variant: "error"}); return;}
        setIsBusy(true);
        try {
            const nextForDay = (row.addedUnavailability?.[day] ?? []).filter((s) => s.start !== start || s.end !== end);
            const next = { ...row.addedUnavailability, [day]: nextForDay } as DaySlots;
            console.log("Email: ", email, " Next:", next);
            const ok2 = await deleteFacultyAddedUnavailabilityFor(email, next);
            if (!ok2) toast({ description: "Failed to remove time slot", variant: "error" });
            else { toast({ description: "Removed time slot successfully.", variant: "success" }) }
        } finally {
            setIsBusy(false);
        }
    };

    // ---- UI ----
    if (isLoading) {
        // Still determining department; show a loading placeholder, not the “no department” message
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Loading department…</span>
                </div>
            </div>
        );
    }
    
    if (!currentDepartment) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-yellow-900 dark:text-yellow-200">
                        <p className="font-medium">No department selected</p>
                        <p className="text-sm opacity-80">Please create and select a department before managing faculty.</p>
                    </div>
                    <Link
                        href="/departments"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-yellow-100 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-50 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                    >
                        Open Departments <MdArrowRightAlt />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white dark:bg-zinc-800 min-h-screen text-black dark:text-gray-200">
            <div className="max-w-7xl mx-auto">
                {/* Header + pills + actions */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">Department Faculty</h1>
                        <span
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium 
               bg-blue-50 text-blue-700 border border-blue-200
               dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 select-none"
                            title="Current Department"
                        >
                            <MdApartment className="opacity-80" size={16} />
                            Department: {currentDepartment.name}
                        </span>

                        {/* Layout toggle */}
                        <div className="px-2 inline-flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Layout</span>
                            <div role="group" aria-label="Card layout" className="inline-flex overflow-hidden rounded-md border border-gray-300 dark:border-zinc-600">
                                <button
                                    type="button"
                                    onClick={() => setCardsLayout("one")}
                                    aria-pressed={cardsLayout === "one"}
                                    title="1 per row"
                                    className={[
                                        "px-2.5 py-1.5 text-sm flex items-center gap-1 transition-colors",
                                        cardsLayout === "one"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                    ].join(" ")}
                                >
                                    <MdViewAgenda size={18} />
                                    <span className="hidden sm:inline">1</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCardsLayout("three")}
                                    aria-pressed={cardsLayout === "three"}
                                    title="3 per row"
                                    className={[
                                        "px-2.5 py-1.5 text-sm flex items-center gap-1 transition-colors border-l border-gray-300 dark:border-zinc-600",
                                        cardsLayout === "three"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                    ].join(" ")}
                                >
                                    <MdViewModule size={18} />
                                    <span className="hidden sm:inline">3</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="faculty-file"
                            className="flex items-center cursor-pointer bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-md px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                            title="Upload faculty file"
                        >
                            <MdFileUpload className="text-blue-600 dark:text-blue-300 mr-2" size={20} />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                                {fileName ? "Change File" : "Upload Faculty"}
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="faculty-file"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={isBusy}
                            />
                        </label>
                        {fileName && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[160px]">
                                {fileName}
                            </span>
                        )}
                    </div>
                </div>

                {/* Add bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
                    {/* Search + domain filter */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdSearch className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filterDomain}
                                onChange={(e) => setFilterDomain(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {domains.map((d) => (
                                    <option key={d} value={d}>
                                        {d === "all" ? "All domains" : d}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdFilterList className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <span className="ml-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {countLabel}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Name (optional)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="px-3 py-2 w-full md:w-56 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isBusy}
                        />
                        <input
                            type="email"
                            placeholder="Email *"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="px-3 py-2 w-full md:w-64 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isBusy}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={isBusy}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MdAdd /> Add
                        </button>
                    </div>
                </div>

                {/* Parsed preview (if any) */}
                {parsedPreview && (
                    <div className="mb-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 overflow-hidden">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b border-blue-200/70 dark:border-blue-800/70">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                    Parsed {parsedPreview.length} faculty
                                </span>
                                <span className="text-sm text-blue-900/70 dark:text-blue-200/80">
                                    Review & confirm before saving
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAppendParsed}
                                    disabled={isBusy}
                                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                                >
                                    Append &amp; Dedupe
                                </button>
                                <button
                                    onClick={handleReplaceAllParsed}
                                    disabled={isBusy}
                                    className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                                >
                                    Replace All
                                </button>
                                <button
                                    onClick={resetUploadUI}
                                    className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Grid of preview pills */}
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[55vh] overflow-auto pr-1">
                                {parsedPreview.map((f) => {
                                    const initials = (f.name || f.email)
                                        .split(" ")
                                        .map((p) => p[0])
                                        .filter(Boolean)
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase();
                                    const domain = f.email.split("@")[1] ?? "";

                                    return (
                                        <div
                                            key={f.email}
                                            className="group flex items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-zinc-800/50 hover:bg-blue-50/70 dark:hover:bg-blue-900/10 transition-colors px-3 py-2.5"
                                        >
                                            {/* Left: avatar/initials */}
                                            <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                                <span className="text-blue-800 dark:text-blue-200 text-sm font-semibold">
                                                    {initials || "@"}
                                                </span>
                                            </div>

                                            {/* Middle: name + email */}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate text-gray-900 dark:text-gray-100">
                                                    {f.name || "—"}
                                                </p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                                                    {f.email}
                                                </p>
                                            </div>

                                            {/* Right: slim divider + domain */}
                                            <div className="hidden sm:flex items-center gap-3 pl-3">
                                                <span className="h-8 w-px bg-blue-200 dark:bg-blue-800" />
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {domain}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {isBusy ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className={cardsGridClass}>
                        {filtered.map(({ email, name, classUnavailability, addedUnavailability }) => {
                            const initials = (name || email)
                                .split(" ")
                                .map((p) => p[0])
                                .filter(Boolean)
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();
                            const domain = email.split("@")[1] ?? "";
                            const isOpen = openEmail === email;
                            return (
                                <div
                                    key={email}
                                    className="bg-gray-50 dark:bg-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="p-5 flex items-start justify-between">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3 shrink-0">
                                                <span className="text-blue-800 dark:text-blue-200 text-sm font-semibold">
                                                    {initials}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{name || email}</p>
                                                <a
                                                    href={`mailto:${email}`}
                                                    className="text-xs text-blue-600 dark:text-blue-300 hover:underline truncate block"
                                                >
                                                    {email}
                                                </a>
                                                {domain && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{domain}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setOpenEmail(isOpen ? null : email)}
                                                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600 transition"
                                                aria-label="Toggle unavailability"
                                                title="Toggle unavailability"
                                            >
                                                {isOpen ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
                                            </button>
                                            <button
                                                onClick={() => removeFaculty(email)}
                                                className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                aria-label={`Remove ${email}`}
                                                title="Remove from department"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="px-5 pb-4">
                                            <div className={innerCardClass}>
                                                {days.map((day) => {
                                                    const classSlots = classUnavailability?.[day] ?? [];
                                                    const addedSlots = addedUnavailability?.[day] ?? [];
                                                    return (
                                                        <div
                                                            key={day}
                                                            className="rounded-md border border-gray-200 dark:border-zinc-600 p-3 flex flex-col h-full"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium text-sm">{day}</h4>
                                                                <span className="text-xs opacity-70">
                                                                    {addedSlots.length} added • {classSlots.length} class
                                                                </span>
                                                            </div>

                                                            {/* Class (auto) – read-only */}
                                                            <div className="mb-2">
                                                                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                    <MdLock size={14} /> Class (auto)
                                                                </div>
                                                                {classSlots.length > 0 ? (
                                                                    <ul className="mt-1 space-y-1 text-sm">
                                                                        {classSlots.map((s, i) => (
                                                                            <li key={i}>{String(s.start)} – {String(s.end)}</li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                        No class slots
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Added (manual) – editable */}
                                                            <div className="mt-2 flex flex-col flex-1">
                                                                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                                    Added (manual)
                                                                </div>
                                                                {addedSlots.length > 0 ? (
                                                                    <ul className="mt-1 space-y-1 text-sm">
                                                                        {addedSlots.map((slot, idx) => (
                                                                            <li
                                                                                key={idx}
                                                                                className="flex items-center justify-between"
                                                                            >
                                                                                <span>{String(slot.start)} – {String(slot.end)}</span>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleRemoveTimeSlot(
                                                                                            email,
                                                                                            day,
                                                                                            String(slot.start),
                                                                                            String(slot.end)
                                                                                        )
                                                                                    }
                                                                                    className="p-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                                                    title="Remove this manual slot"
                                                                                >
                                                                                    <MdDelete size={16} />
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                        No manual slots
                                                                    </p>
                                                                )}

                                                                <div className="pt-3 grid grid-cols-2 gap-2 mt-auto">
                                                                    <input
                                                                        type="time"
                                                                        value={newSlotTimes[email]?.[day]?.start || ""}
                                                                        onChange={(e) =>
                                                                            handleNewSlotChange(email, day, "start", e.target.value)
                                                                        }
                                                                        className="px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-sm"
                                                                    />
                                                                    <input
                                                                        type="time"
                                                                        value={newSlotTimes[email]?.[day]?.end || ""}
                                                                        onChange={(e) =>
                                                                            handleNewSlotChange(email, day, "end", e.target.value)
                                                                        }
                                                                        className="px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-sm"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleAddTimeSlot(email, day)}
                                                                        disabled={
                                                                            isBusy ||
                                                                            !newSlotTimes[email]?.[day]?.start ||
                                                                            !newSlotTimes[email]?.[day]?.end
                                                                        }
                                                                        className="w-full col-span-2 px-3 py-1.5 bg-green-600 dark:bg-green-600 text-white rounded-md hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            No faculty yet. Upload a file or add entries to get started.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
