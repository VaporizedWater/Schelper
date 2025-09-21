"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MdDelete, MdAdd, MdSearch, MdFilterList, MdApartment, MdFileUpload, MdArrowRightAlt } from "react-icons/md";
import { useToast } from "@/components/Toast/Toast";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import * as xlsx from "xlsx";
import type { WorkBook, WorkSheet } from "xlsx";
import { FacultyInfo } from "@/lib/types"; // uses your shared type
import { deleteDepartmentFaculty, insertFaculty, loadFaculty } from "@/lib/DatabaseUtils";
import Link from "next/link";

export default function FacultyPage() {
    const { toast } = useToast();
    const { currentDepartment } = useCalendarContext();

    const [faculty, setFaculty] = useState<FacultyInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [filterDomain, setFilterDomain] = useState("all");

    // Import handling
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState("");
    const [parsedPreview, setParsedPreview] = useState<FacultyInfo[] | null>(null);

    const departmentId = currentDepartment?._id ?? null;

    // ---- API helpers ----
    async function fetchFaculty() {
        if (!departmentId) return;
        setIsLoading(true);
        try {
            const result = await loadFaculty(departmentId);

            if (!result) {
                toast({ description: "Failed to load faculty", variant: "error" });
                return;
            } else {
                toast({ description: "Loaded faculty", variant: "success" });
            }

            setFaculty(sortFaculty(result));
        } catch (e) {
            console.error(e);
            toast({ description: "Failed to load faculty", variant: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    async function replaceFaculty(next: FacultyInfo[]) {
        if (!departmentId) return;
        setIsLoading(true);
        try {
            const result = await insertFaculty(next, departmentId);

            if (!result) {
                toast({ description: "Failed to save list", variant: "error" });
                return;
            } else {
                toast({ description: "Faculty list saved", variant: "success" });
            }

            setFaculty(sortFaculty(next));
        } catch (e) {
            console.error(e);
            toast({ description: "Failed to save", variant: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    async function removeFaculty(email: string) {
        if (!departmentId) return;
        setIsLoading(true);
        try {
            const result = await deleteDepartmentFaculty(email, departmentId);

            if (!result) {
                toast({ description: "Failed to remove faculty", variant: "error" });
                return;
            } else {
                toast({ description: "Removed faculty", variant: "success" });
            }

            setFaculty((cur) => cur.filter((f) => f.email !== email));
        } catch (e) {
            console.error(e);
            toast({ description: "Failed to remove", variant: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    // ---- Load on department change ----
    useEffect(() => {
        if (!departmentId) {
            setFaculty([]);
            setIsLoading(false);
            return;
        }
        fetchFaculty();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId]);

    // ---- Filtering ----
    const domains = useMemo(() => {
        const set = new Set<string>();
        faculty.forEach(({ email }) => {
            const at = email.indexOf("@");
            if (at > -1) set.add(email.slice(at + 1));
        });
        return ["all", ...Array.from(set).sort()];
    }, [faculty]);

    const filtered = useMemo(() => {
        return faculty.filter(({ email, name }) => {
            const q = searchTerm.toLowerCase();
            const matchesSearch =
                email.toLowerCase().includes(q) || (name || "").toLowerCase().includes(q);
            const matchesDomain =
                filterDomain === "all" || email.toLowerCase().endsWith("@" + filterDomain.toLowerCase());
            return matchesSearch && matchesDomain;
        });
    }, [faculty, searchTerm, filterDomain]);

    // ---- Add one ----
    const handleAdd = async () => {
        const email = newEmail.trim();
        const name = newName.trim();
        if (!email || !email.includes("@")) {
            toast({ description: "Enter a valid email", variant: "error" });
            return;
        }
        // merge/dedupe by email (case-insensitive)
        const map = new Map(faculty.map((f) => [f.email.toLowerCase(), f]));
        const existing = map.get(email.toLowerCase());
        if (existing) {
            // Update name if provided and different
            if (name && name !== existing.name) {
                map.set(email.toLowerCase(), { email: existing.email, name });
            } else {
                toast({ description: "Faculty already exists", variant: "info" });
                return;
            }
        } else {
            map.set(email.toLowerCase(), { email, name });
        }
        await replaceFaculty(Array.from(map.values()));
        setNewEmail("");
        setNewName("");
    };

    // ---- Upload / Parse ----
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setParsedPreview(null);
        setIsLoading(true);

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

            const parsed: FacultyInfo[] = [];
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
            setIsLoading(false);
        }
    };

    // merge append
    const handleAppendParsed = async () => {
        if (!parsedPreview) return;
        const map = new Map(faculty.map((f) => [f.email.toLowerCase(), f]));
        for (const f of parsedPreview) {
            const existing = map.get(f.email.toLowerCase());
            if (!existing) {
                map.set(f.email.toLowerCase(), f);
            } else if (f.name && f.name !== existing.name) {
                map.set(f.email.toLowerCase(), { email: existing.email, name: f.name });
            }
        }
        await replaceFaculty(Array.from(map.values()));
        setParsedPreview(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // replace all
    const handleReplaceAllParsed = async () => {
        if (!parsedPreview) return;
        await replaceFaculty(parsedPreview);
        setParsedPreview(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ---- Helpers ----
    function sortFaculty(list: FacultyInfo[]) {
        return [...list].sort((a, b) => {
            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            if (an && bn && an !== bn) return an < bn ? -1 : 1;
            return a.email.toLowerCase() < b.email.toLowerCase() ? -1 : 1;
        });
    }

    function normalize(list: FacultyInfo[]) {
        const seen = new Map<string, FacultyInfo>();
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
    const visibleFaculty = faculty.filter((f) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            (f.name || "").toLowerCase().includes(q) ||
            (f.email || "").toLowerCase().includes(q)
        );
    });

    const shown = visibleFaculty.length;
    const total = faculty.length;
    const countLabel = shown === total ? `${total} total` : `Showing ${shown} of ${total}`;

    // ---- UI ----
    if (!currentDepartment) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-yellow-900 dark:text-yellow-200">
                        <p className="font-medium">No department selected</p>
                        <p className="text-sm opacity-80">Please create and select a department before managing cohorts.</p>
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
                                disabled={isLoading}
                            />
                        </label>
                        {fileName && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[160px]">{fileName}</span>
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
                            disabled={isLoading}
                        />
                        <input
                            type="email"
                            placeholder="Email *"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="px-3 py-2 w-full md:w-64 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={isLoading}
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
                                    disabled={isLoading}
                                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                                >
                                    Append &amp; Dedupe
                                </button>
                                <button
                                    onClick={handleReplaceAllParsed}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                                >
                                    Replace All
                                </button>
                                <button
                                    onClick={() => {
                                        setParsedPreview(null);
                                        setFileName("");
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
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
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filtered.map(({ email, name }) => {
                            const initials = (name || email)
                                .split(" ")
                                .map((p) => p[0])
                                .filter(Boolean)
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();
                            const domain = email.split("@")[1] ?? "";
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
                                        <button
                                            onClick={() => removeFaculty(email)}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            aria-label={`Remove ${email}`}
                                            title="Remove"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    </div>
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
