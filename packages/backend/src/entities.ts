import { Student } from './students/student.entity';
import { Group } from './groups/group.entity';
import { Course } from './courses/course.entity';
import { ClassEntity } from './classes/class.entity';
import { Room } from './rooms/room.entity';
import { GroupTemplate } from './group-templates/group-template.entity';
import { Settings } from './settings/settings.entity';
import { User } from './users/user.entity';
import { Payment } from './payments/payment.entity';
import { Debit } from './debits/debit.entity';

export const entities = [
  Student,
  Group,
  Course,
  ClassEntity,
  Room,
  GroupTemplate,
  Settings,
  User,
  Payment,
  Debit,
];
