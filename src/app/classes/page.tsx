"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as xlsx from "xlsx";
import { MdArrowRightAlt, MdDelete, MdFileUpload, MdSearch } from "react-icons/md";
import { useToast } from "@/components/Toast/Toast";
import type { ClassInfo } from "@/lib/types";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { deleteDepartmentCourse, insertDepartmentCourses, loadDepartmentClasses } from "@/lib/DatabaseUtils";
import Link from "next/link";
import { useConfirm } from "@/components/Confirm/Confirm";

export default function DepartmentClassesPage() {
  const { toast } = useToast();
  const { confirm: confirmDialog } = useConfirm();
  const { currentDepartment, isLoading } = useCalendarContext();

  const [isBusy, setIsBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [pendingUpload, setPendingUpload] = useState<ClassInfo[] | null>(null);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<keyof ClassInfo>("course_subject");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const hasDepartment = !!currentDepartment?._id;

  const subjects = useMemo(() => {
    const s = new Set<string>();
    (classes ?? []).forEach(c => c.course_subject && s.add(c.course_subject));
    if (pendingUpload) pendingUpload.forEach(c => c.course_subject && s.add(c.course_subject));
    return ["all", ...Array.from(s).sort()];
  }, [classes, pendingUpload]);

  const filtered = useMemo(() => {
    const base = pendingUpload ?? classes;
    const needle = search.trim().toLowerCase();
    let rows = base.filter(c => {
      const matchesSearch =
        !needle ||
        c.title.toLowerCase().includes(needle) ||
        c.catalog_num.toLowerCase().includes(needle) ||
        c.course_subject.toLowerCase().includes(needle) ||
        c.course_num.toLowerCase().includes(needle);
      const matchesSubject = subjectFilter === "all" || c.course_subject === subjectFilter;
      return matchesSearch && matchesSubject;
    });
    rows = rows.sort((a, b) => {
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [classes, pendingUpload, search, subjectFilter, sortKey, sortDir]);

  function toggleSort(key: keyof ClassInfo) {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function loadDepartmentCourses() {
    if (!hasDepartment) return;
    if (!currentDepartment || !currentDepartment._id) return;

    setIsBusy(true);

    try {
      const result = await loadDepartmentClasses(currentDepartment._id)
      setClasses(result);
    } catch (e) {
      console.error(e);
      toast({ description: "Failed to load department classes.", variant: "error" });
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteCourse(id: string, courseSubject: string, courseNum: string) {
    if (!hasDepartment) return;
    const ok = await confirmDialog({
      title: `Remove course ${courseSubject} ${courseNum}?`,
      description: "Are you sure you want to remove this course from the department?",
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;
    if (!currentDepartment || !currentDepartment._id) return;

    setIsBusy(true);
    try {
      const result = await deleteDepartmentCourse(id, currentDepartment._id)

      if (!result) {
        toast({ description: "Failed to remove course", variant: "error" });
        return;
      } else {
        toast({ description: "Course removed.", variant: "success" });
      }

      await loadDepartmentCourses();
    } catch (e) {
      console.error(e);
      toast({ description: "Failed to remove course.", variant: "error" });
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    if (hasDepartment) loadDepartmentCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDepartment?._id]);

  function normalizeHeader(h: unknown) {
    return String(h ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  // Flexible parser -> outputs ClassInfo[]
  function flexParse(raw: (string | number | null | undefined)[][]): ClassInfo[] {
    if (!raw.length) return [];

    // find first non-empty row = header
    const headerRowIdx = raw.findIndex(r => r && r.some(c => String(c ?? "").trim() !== ""));
    if (headerRowIdx < 0) return [];

    const header = (raw[headerRowIdx] ?? []).map(normalizeHeader);

    const ALIASES: Record<string, string[]> = {
      catalog_num: ["catalog #", "catalog#", "catalog", "catalog no", "catalog number", "catalog_num", "cat #", "cat no"],
      subject: ["subject", "course", "dept", "department", "prefix", "subject code"],
      course_num: ["num", "number", "course number", "course #", "course no", "course id", "catalog num"],
      title: ["title", "course title", "name"],
    };

    function findIdx(keys: string[]) {
      for (let i = 0; i < header.length; i++) {
        const h = header[i];
        if (keys.includes(h)) return i;
      }
      return -1;
    }

    const idxCatalog = findIdx(ALIASES.catalog_num.map(normalizeHeader));
    const idxSubject = findIdx(ALIASES.subject.map(normalizeHeader));
    const idxNumber = findIdx(ALIASES.course_num.map(normalizeHeader));
    const idxTitle = findIdx(ALIASES.title.map(normalizeHeader));

    // Some files combine subject+number into one column (e.g., "ME 300")
    const isCombinedCourse = idxSubject >= 0 && idxNumber < 0;

    const out: ClassInfo[] = [];
    for (let r = headerRowIdx + 1; r < raw.length; r++) {
      const row = raw[r] ?? [];
      if (row.every(c => String(c ?? "").trim() === "")) continue;

      const catalogRaw = idxCatalog >= 0 ? String(row[idxCatalog] ?? "").trim() : "";
      const subjectRaw = idxSubject >= 0 ? String(row[idxSubject] ?? "").trim() : "";
      const numberRaw = idxNumber >= 0 ? String(row[idxNumber] ?? "").trim() : "";
      const titleRaw = idxTitle >= 0 ? String(row[idxTitle] ?? "").trim() : "";

      let course_subject = subjectRaw;
      let course_num = numberRaw;

      if (isCombinedCourse) {
        const m = subjectRaw.match(/^([A-Za-z&]+)\s*-?\s*(\d+[A-Za-z]?)$/);
        if (m) {
          course_subject = m[1];
          course_num = m[2];
        }
      }

      const catalog_num = catalogRaw || [course_subject, course_num].filter(Boolean).join(" ").trim();
      if (!titleRaw && !catalog_num) continue;

      out.push({
        _id: undefined,
        course_subject,
        course_num,
        catalog_num,
        title: titleRaw,
      });
    }

    return out;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBusy(true);
    setFileName(file.name);

    try {
      const buf = await file.arrayBuffer();
      const wb = xlsx.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json<(string | number | null | undefined)[]>(sheet, { header: 1 });

      const parsed = flexParse(rows);
      if (!parsed.length) {
        toast({ description: "No recognizable rows found.", variant: "error" });
        setPendingUpload(null);
        return;
      }

      setPendingUpload(parsed);
      toast({ description: `Parsed ${parsed.length} course${parsed.length === 1 ? "" : "s"}.`, variant: "success" });
    } catch (err) {
      console.error(err);
      toast({ description: "Failed to read file.", variant: "error" });
    } finally {
      setIsBusy(false);
    }
  };

  function classKey(c: ClassInfo) {
    // Prefer catalog_num; fallback to SUBJECT + NUMBER
    const cat = (c.catalog_num || "").replace(/\s+/g, "").toUpperCase();
    if (cat) return `CAT:${cat}`;
    const subj = (c.course_subject || "").replace(/\s+/g, "").toUpperCase();
    const num = (c.course_num || "").replace(/\s+/g, "").toUpperCase();
    return `SN:${subj}-${num}`;
  }

  function sortClasses(list: ClassInfo[]) {
    return [...list].sort((a, b) => {
      const asub = (a.course_subject || "").toLowerCase();
      const bsub = (b.course_subject || "").toLowerCase();
      if (asub !== bsub) return asub < bsub ? -1 : 1;

      const anum = (a.course_num || "").toLowerCase();
      const bnum = (b.course_num || "").toLowerCase();
      if (anum !== bnum) return anum.localeCompare(bnum, undefined, { numeric: true });

      const atitle = (a.title || "").toLowerCase();
      const btitle = (b.title || "").toLowerCase();
      return atitle.localeCompare(btitle);
    });
  }

  // Append parsed -> merge+dedupe against existing, then replace in DB
  const handleAppendParsed = async () => {
    if (!pendingUpload || !hasDepartment) return;
    if (!currentDepartment || !currentDepartment._id) return;

    setIsBusy(true);
    try {
      // Build map from current classes
      const map = new Map<string, ClassInfo>();
      for (const c of classes) map.set(classKey(c), c);

      // Merge parsed: insert new or update title if the new row has a better/different title
      for (const nc of pendingUpload) {
        const key = classKey(nc);
        const existing = map.get(key);
        if (!existing) {
          map.set(key, nc);
        } else {
          const title = (nc.title || "").trim();
          // Prefer non-empty new title when different
          const merged: ClassInfo = {
            _id: existing._id, // keep existing id if present
            course_subject: nc.course_subject || existing.course_subject,
            course_num: nc.course_num || existing.course_num,
            catalog_num: nc.catalog_num || existing.catalog_num,
            title: title || existing.title,
          };
          map.set(key, merged);
        }
      }

      const next = sortClasses(Array.from(map.values()));

      // Replace the full list in DB with merged
      const result = await insertDepartmentCourses(next, currentDepartment._id);
      if (!result) {
        toast({ description: "Failed to save merged courses", variant: "error" });
        return;
      }
      toast({ description: "Appended & deduped courses successfully", variant: "success" });

      setPendingUpload(null);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      await loadDepartmentCourses();
    } catch (e) {
      console.error(e);
      toast({ description: "Failed to append & dedupe.", variant: "error" });
    } finally {
      setIsBusy(false);
    }
  };

  // Replace all with parsed
  const handleReplaceAllParsed = async () => {
    if (!pendingUpload || !hasDepartment) return;
    if (!currentDepartment || !currentDepartment._id) return;

    setIsBusy(true);
    try {
      const next = sortClasses(pendingUpload);
      const result = await insertDepartmentCourses(next, currentDepartment._id);
      if (!result) {
        toast({ description: "Failed to replace courses", variant: "error" });
        return;
      }
      toast({ description: "Replaced all courses successfully", variant: "success" });

      setPendingUpload(null);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      await loadDepartmentCourses();
    } catch (e) {
      console.error(e);
      toast({ description: "Failed to replace.", variant: "error" });
    } finally {
      setIsBusy(false);
    }
  };

  const clearParsed = () => {
    setPendingUpload(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
            <p className="text-sm opacity-80">Please create and select a department before managing classes.</p>
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
        {/* Header + pills + upload */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Department Classes</h1>
            {hasDepartment && (
              <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                Department: {currentDepartment!.name}
              </span>
            )}
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-600">
              Total: {(pendingUpload ?? classes).length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isBusy ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 dark:border-blue-400" />
            ) : (
              <>
                <label
                  htmlFor="dept-classes-file"
                  className="flex items-center cursor-pointer bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-md px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                  title="Upload"
                >
                  <MdFileUpload className="text-blue-600 dark:text-blue-300 mr-2" size={20} />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                    {fileName ? "Change File" : "Upload List"}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="dept-classes-file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isBusy}
                  />
                </label>

                {fileName && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[140px]">{fileName}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Toolbar: search + subject filter */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Subjects" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pendingUpload && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-2 rounded-t-lg bg-blue-50 dark:bg-blue-900/30 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                Parsed {pendingUpload.length} class{pendingUpload.length === 1 ? "" : "es"}
              </span>
              <span className="text-xs text-blue-900/70 dark:text-blue-200/80">
                Review & confirm before saving
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAppendParsed}
                disabled={isBusy || !hasDepartment}
                className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-xs font-medium disabled:opacity-50"
              >
                Append &amp; Dedupe
              </button>
              <button
                onClick={handleReplaceAllParsed}
                disabled={isBusy || !hasDepartment}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors text-xs font-medium disabled:opacity-50"
              >
                Replace All
              </button>
              <button
                onClick={clearParsed}
                disabled={isBusy}
                className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors text-xs font-medium disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        {isBusy && !classes.length && !pendingUpload ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-hidden rounded-lg rounded-t-none shadow-sm bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-zinc-600 text-gray-700 dark:text-gray-200">
                  <tr>
                    <Th label="Subject" onClick={() => toggleSort("course_subject")} active={sortKey === "course_subject"} dir={sortDir} />
                    <Th label="Number" onClick={() => toggleSort("course_num")} active={sortKey === "course_num"} dir={sortDir} />
                    <Th label="Catalog #" onClick={() => toggleSort("catalog_num")} active={sortKey === "catalog_num"} dir={sortDir} />
                    <Th label="Title" onClick={() => toggleSort("title")} active={sortKey === "title"} dir={sortDir} />
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={(c._id ?? `${c.course_subject}-${c.course_num}-${i}`).toString()}
                      className="border-t border-gray-200 dark:border-zinc-600 hover:bg-white/60 dark:hover:bg-zinc-600/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{c.course_subject || "-"}</td>
                      <td className="px-4 py-3">{c.course_num || "-"}</td>
                      <td className="px-4 py-3">{c.catalog_num || "-"}</td>
                      <td className="px-4 py-3">{c.title || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        {!pendingUpload && c._id && (
                          <button
                            onClick={() => deleteCourse(c._id as string, c.course_subject, c.course_num)}
                            className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-150"
                            aria-label="Delete course"
                          >
                            <MdDelete size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pendingUpload && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Parsed {pendingUpload.length} class{pendingUpload.length === 1 ? "" : "es"}
                  </span>
                  <span className="text-xs text-blue-900/70 dark:text-blue-200/80">
                    Review & confirm before saving
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAppendParsed}
                    disabled={isBusy || !hasDepartment}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    Append &amp; Dedupe
                  </button>
                  <button
                    onClick={handleReplaceAllParsed}
                    disabled={isBusy || !hasDepartment}
                    className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    Replace All
                  </button>
                  <button
                    onClick={clearParsed}
                    disabled={isBusy}
                    className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-8 text-center border border-gray-200 dark:border-zinc-600">
            <div className="inline-block p-3 bg-gray-100 dark:bg-zinc-600 rounded-full mb-3">
              <svg className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0116 9v10a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium mb-1">No Department Classes</h4>
            <p className="text-gray-600 dark:text-gray-400">Upload a course list to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({
  label,
  onClick,
  active,
  dir,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th className="px-4 py-3 text-left select-none">
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 font-medium ${active ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"
          }`}
      >
        <span>{label}</span>
        {active && (
          <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-80">
            {dir === "asc" ? (
              <path fill="currentColor" d="M7 14l5-5 5 5z" />
            ) : (
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            )}
          </svg>
        )}
      </button>
    </th>
  );
}
