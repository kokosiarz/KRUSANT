import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../class-attendance.entity';

// Swagger/typing only — the body of POST /classes/:id/attendance is a bare
// array (`[{studentId, status}]`, matching the pre-existing bare-array
// convention), which Nest's global ValidationPipe does not validate item by
// item. ClassesService.setAttendance does its own defensive filtering, the
// same way it always rejected a malformed attendedStudentsIds body.
export class AttendanceEntryDto {
  @ApiProperty({ description: 'Student ID' })
  studentId: number;

  @ApiProperty({
    enum: AttendanceStatus,
    description:
      'present (obecność) or absent (nieobecność) both bill the student; rescheduled (przełożone) does not and instead counts toward their make-up balance.',
  })
  status: AttendanceStatus;
}
