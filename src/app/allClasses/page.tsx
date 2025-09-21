"use client";

import { useMemo, useState } from "react";
import { MdDelete, MdSearch, MdFilterList, MdVisibility, MdVisibilityOff, MdInfoOutline } from "react-icons/md";
import { useToast } from "@/components/Toast/Toast";
import type { CombinedClass, ClassData, ClassProperty } from "@/lib/types";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { useConfirm } from "@/components/Confirm/Confirm";

type StatusFilter = "all" | "open" | "closed" | "cancelled";

export default function MyClassesPage() {
  const { toast } = useToast();
  const { confirm: confirmDialog } = useConfirm();

  // Pull classes + calendar info from context (preferred)
  const {
    allClasses = [],
    updateOneClass,
    deleteClass,
    currentCalendar,
  } = ((): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      // If context is wired, this succeeds; otherwise fallback to empty.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useCalendarContext();
    } catch {
      return { allClasses: [], updateOneClass: undefined, deleteClass: undefined, currentCalendar: undefined };
    }
  })();

  // Local UI state
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [visibleOnly, setVisibleOnly] = useState<boolean>(false);
  const [isBusyId, setIsBusyId] = useState<string | null>(null);

  // Subject options (derived)
  const subjects = useMemo(() => {
    const s = new Set<string>();
    allClasses.forEach((c: CombinedClass) => s.add(c.data.course_subject));
    return ["all", ...Array.from(s).sort()];
  }, [allClasses]);

  // Derived semester/year badges
  const calendarName = currentCalendar?.info?.name ?? "—";
  const semester = currentCalendar?.info?.semester ?? "—";
  const year = currentCalendar?.info?.year ?? "—";

  // Filtering + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (allClasses as CombinedClass[]).filter((c) => {
      const { data, properties, visible } = c;

      // Search across several fields
      const textHaystack = [
        data.title,
        data.catalog_num,
        data.course_subject,
        data.course_num,
        data.section,
        properties?.instructor_name,
        properties?.instructor_email,
        properties?.room,
        properties?.facility_id,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .join(" ");

      const matchesQuery = q.length === 0 || textHaystack.includes(q);

      const matchesSubject = subjectFilter === "all" || data.course_subject === subjectFilter;

      const status = (properties?.class_status || "").toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && status.includes("open")) ||
        (statusFilter === "closed" && status.includes("closed")) ||
        (statusFilter === "cancelled" && (status.includes("cancel") || status.includes("canceled") || status.includes("cancelled")));

      const matchesVisible = !visibleOnly || visible === true;

      return matchesQuery && matchesSubject && matchesStatus && matchesVisible;
    });
  }, [allClasses, query, subjectFilter, statusFilter, visibleOnly]);

  // Helpers
  const formatCode = (d: ClassData) => `${d.course_subject} ${d.course_num}-${d.section}`;
  const formatDays = (p: ClassProperty) => (Array.isArray(p.days) && p.days.length ? p.days.join(", ") : "—");
  const formatTime = (p: ClassProperty) => {
    const s = p.start_time?.trim();
    const e = p.end_time?.trim();
    if (!s && !e) return "—";
    if (s && !e) return s;
    if (!s && e) return e;
    return `${s} – ${e}`;
  };
  const statusBadge = (status?: string) => {
    const s = (status || "").toLowerCase();
    const base = "px-2 py-0.5 rounded-full text-xs font-medium";
    if (s.includes("open")) return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200`}>Open</span>;
    if (s.includes("closed")) return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200`}>Closed</span>;
    if (s.includes("cancel")) return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200`}>Cancelled</span>;
    return <span className={`${base} bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-200`}>{status || "—"}</span>;
  };

  // Actions
  const onToggleVisible = async (cls: CombinedClass) => {
    if (!updateOneClass) {
      toast({ description: "Visibility toggling isn’t wired to context here.", variant: "info" });
      return;
    }
    try {
      setIsBusyId(cls._id);
      updateOneClass({ ...cls, visible: !cls.visible });
      toast({ description: `Class ${cls.visible ? "hidden" : "shown"}.`, variant: "success" });
    } catch (e) {
      toast({ description: "Failed to toggle visibility. " + e, variant: "error" });
    } finally {
      setIsBusyId(null);
    }
  };

  const onDelete = async (cls: CombinedClass) => {
    if (!deleteClass) {
      toast({ description: "Delete isn’t wired to context here.", variant: "info" });
      return;
    }
    const ok = await confirmDialog({
      title: "Delete class?",
      description: `Delete "${cls.data.title}" (${formatCode(cls.data)})?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;
    try {
      setIsBusyId(cls._id);
      deleteClass(cls._id);
      toast({ description: "Class deleted.", variant: "success" });
    } catch (e) {
      toast({ description: "Failed to delete class. " + e, variant: "error" });
    } finally {
      setIsBusyId(null);
    }
  };

  const onPeek = (cls: CombinedClass) => {
    console.log("Class JSON:", cls);
    toast({ description: "Class JSON logged to console.", variant: "info" });
  };

  return (
    <div className="p-4 bg-white dark:bg-zinc-800 min-h-screen text-black dark:text-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Classes</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-300" /> Calendar: {calendarName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800 px-3 py-1 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-300" /> Semester: {semester} {year}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 text-gray-700 border border-gray-200 dark:bg-zinc-700 dark:text-gray-200 dark:border-zinc-600 px-3 py-1 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-300" /> Classes: {filtered.length}
              </span>
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative flex-grow max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, code, instructor, room…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All Subjects" : s}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdFilterList className="text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="pl-9 pr-4 py-2.5 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdFilterList className="text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visibleOnly}
                onChange={(e) => setVisibleOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Visible only</span>
            </label>
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="bg-gray-50 dark:bg-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200/70 dark:border-zinc-600/70"
              >
                <div className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold leading-snug">{c.data.title}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{formatCode(c.data)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(c.properties?.class_status)}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-2 text-sm flex-grow">
                    <p className="flex">
                      <span className="w-24 font-medium">Instructor:</span>
                      <span className="truncate">{c.properties?.instructor_name || "—"}</span>
                    </p>
                    <p className="flex">
                      <span className="w-24 font-medium">Email:</span>
                      <a
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                        href={c.properties?.instructor_email ? `mailto:${c.properties.instructor_email}` : "#"}
                        onClick={(e) => !c.properties?.instructor_email && e.preventDefault()}
                      >
                        {c.properties?.instructor_email || "—"}
                      </a>
                    </p>
                    <p className="flex">
                      <span className="w-24 font-medium">Days:</span>
                      <span>{formatDays(c.properties)}</span>
                    </p>
                    <p className="flex">
                      <span className="w-24 font-medium">Time:</span>
                      <span>{formatTime(c.properties)}</span>
                    </p>
                    <p className="flex">
                      <span className="w-24 font-medium">Room:</span>
                      <span className="truncate">{c.properties?.room || "—"}</span>
                    </p>
                    {Array.isArray(c.properties?.tags) && c.properties.tags.length > 0 && (
                      <div className="pt-1">
                        <p className="font-medium mb-1">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {c.properties.tags.slice(0, 6).map((t, i) => (
                            <span
                              key={`${t.tagCategory}:${t.tagName}:${i}`}
                              className="px-2 py-0.5 rounded-md text-xs bg-gray-200 text-gray-800 dark:bg-zinc-600 dark:text-gray-100"
                              title={`${t.tagCategory}: ${t.tagName}`}
                            >
                              {t.tagName}
                            </span>
                          ))}
                          {c.properties.tags.length > 6 && (
                            <span className="px-2 py-0.5 rounded-md text-xs bg-gray-200 text-gray-800 dark:bg-zinc-600 dark:text-gray-100">
                              +{c.properties.tags.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => onPeek(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-600 dark:hover:bg-zinc-500 transition-colors"
                      title="Peek JSON in console"
                    >
                      <MdInfoOutline /> Details
                    </button>
                    <button
                      onClick={() => onToggleVisible(c)}
                      disabled={isBusyId === c._id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                      title={c.visible ? "Hide class" : "Show class"}
                    >
                      {c.visible ? <MdVisibilityOff /> : <MdVisibility />}
                      {c.visible ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      disabled={isBusyId === c._id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                      title="Delete class"
                    >
                      <MdDelete /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block p-3 bg-gray-100 dark:bg-zinc-700 rounded-full mb-3">
              <MdSearch className="h-7 w-7 text-gray-500 dark:text-gray-300" />
            </div>
            <h3 className="text-lg font-medium mb-1">No classes found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
