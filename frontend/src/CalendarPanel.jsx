import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarPanel({ todos, onPickDate }) {
  const events = (todos || [])
    .filter((t) => t.dueDate)
    .map((t) => {
      const priority = t.priority || "中";
      const bg =
        priority === "高"
          ? "var(--danger)"
          : priority === "低"
          ? "var(--muted)"
          : "var(--primary)";

      return {
        id: t._id,
        title: t.title,
        start: t.dueDate,
        allDay: true,
        backgroundColor: bg,
        borderColor: "transparent",
      };
    });

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 10 }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height={520}                 // ✅ 直接固定高度，最穩
        eventDisplay="block"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        dayCellClassNames={(arg) => {
          const d = arg.date.getDay(); // 0 Sunday, 6 Saturday
          if (d === 0 || d === 6) return ["fc-weekend-cell"];
          return [];
        }}
        dateClick={(info) => {
          onPickDate?.(info.dateStr);
        }}
        events={events}
      />
      <div style={{ marginTop: 8, opacity: 0.75, fontSize: 12 }}>
        點日期 → 自動填入「截止日期」，再到左邊直接新增。
      </div>
    </div>
  );
}
