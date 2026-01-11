import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarPanel({ todos, onPickDate }) {
  // 把有 dueDate 的 todo 變成日曆事件
  const events = (todos || [])
    .filter((t) => t.dueDate)
    .map((t) => ({
      id: t._id,
      title: t.title,
      start: t.dueDate, // ISO 字串可直接用
      allDay: true,
    }));

  return (
    <div style={{ overflow: "hidden" }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        dateClick={(info) => {
          // info.dateStr 是 yyyy-mm-dd
          onPickDate(info.dateStr);
        }}
        events={events}
      />
      <div style={{ marginTop: 8, opacity: 0.8, fontSize: 12 }}>
        點日期可直接帶入「截止日期」新增待辦。
      </div>
    </div>
  );
}
