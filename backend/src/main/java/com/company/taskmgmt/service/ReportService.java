package com.company.taskmgmt.service;

import com.company.taskmgmt.entity.Task;
import com.company.taskmgmt.entity.TaskStatus;
import com.company.taskmgmt.entity.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final TaskService taskService;
    private final CurrentUserService currentUser;

    public ReportService(TaskService taskService, CurrentUserService currentUser) {
        this.taskService = taskService;
        this.currentUser = currentUser;
    }

    /** ADMIN gets every task; MANAGER gets only the tasks of their own team (see TaskService.visibleTasks). */
    public byte[] tasksPdf() {
        User me = currentUser.get();
        List<Task> tasks = taskService.visibleTasks(null, null, null);

        long doneCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long inProgCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long pendingCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Title and Metadata
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(15, 23, 42));
        Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 9.5f, new Color(100, 116, 139));
        Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, new Color(30, 41, 59));

        doc.add(new Paragraph("TaskFlow Enterprise - Task Execution & Audit Report", titleFont));
        doc.add(new Paragraph("Prepared for: " + me.getFullName() + " (" + me.getRole() + ") · Generated: " + LocalDate.now(), metaFont));
        doc.add(new Paragraph("Summary: Total Tasks: " + tasks.size() + "  |  Completed: " + doneCount + "  |  In Progress: " + inProgCount + "  |  Pending: " + pendingCount + "\n\n", summaryFont));

        // 9 Columns Table: ID, Title, Status, Priority, Assigned Date, Deadline, Completed Date, Assignee, Assigned By
        PdfPTable table = new PdfPTable(new float[]{0.8f, 3.8f, 1.8f, 1.4f, 2.0f, 2.0f, 2.0f, 2.5f, 2.5f});
        table.setWidthPercentage(100);

        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        String[] headers = new String[]{
                "ID", "Title", "Status", "Priority", "Assign Date", "Deadline", "Complete Date", "Assignee", "Assigned by"
        };
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headFont));
            cell.setBackgroundColor(new Color(15, 23, 42));
            cell.setPadding(6);
            cell.setBorderColor(new Color(226, 232, 240));
            table.addCell(cell);
        }

        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, new Color(30, 41, 59));
        Font doneFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, new Color(16, 185, 129));
        Font inProgFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, new Color(2, 132, 199));
        Font pendingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, new Color(217, 119, 6));

        int index = 0;
        for (Task t : tasks) {
            Color rowBg = (index % 2 == 0) ? Color.WHITE : new Color(248, 250, 252);

            String assignDate = t.getCreatedAt() != null ? t.getCreatedAt().toLocalDate().toString() : "-";
            String deadline = t.getDeadline() != null ? t.getDeadline().toString() : "-";
            String completeDate;
            if (t.getStatus() == TaskStatus.DONE) {
                completeDate = t.getUpdatedAt() != null ? t.getUpdatedAt().toLocalDate().toString()
                        : (t.getCreatedAt() != null ? t.getCreatedAt().toLocalDate().toString() : LocalDate.now().toString());
            } else {
                completeDate = "-";
            }

            String[] row = {
                    String.valueOf(t.getId()),
                    t.getTitle(),
                    t.getStatus().name(),
                    t.getPriority().name(),
                    assignDate,
                    deadline,
                    completeDate,
                    t.getAssignedTo().getFullName(),
                    t.getAssignedBy().getFullName()
            };

            for (int i = 0; i < row.length; i++) {
                String val = row[i];
                Font cellFont = bodyFont;
                if (i == 2) { // Status column
                    if ("DONE".equals(val)) cellFont = doneFont;
                    else if ("IN_PROGRESS".equals(val)) cellFont = inProgFont;
                    else if ("PENDING".equals(val)) cellFont = pendingFont;
                }
                PdfPCell cell = new PdfPCell(new Phrase(val, cellFont));
                cell.setBackgroundColor(rowBg);
                cell.setPadding(5);
                cell.setBorderColor(new Color(226, 232, 240));
                table.addCell(cell);
            }
            index++;
        }

        doc.add(table);
        doc.close();
        return out.toByteArray();
    }
}
