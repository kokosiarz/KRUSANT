"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _appcontroller = require("./app.controller");
const _appservice = require("./app.service");
const _studentsmodule = require("./students/students.module");
const _typeorm = require("@nestjs/typeorm");
const _studententity = require("./students/student.entity");
const _groupsmodule = require("./groups/groups.module");
const _groupentity = require("./groups/group.entity");
const _teachersmodule = require("./teachers/teachers.module");
const _teacherentity = require("./teachers/entities/teacher.entity");
const _coursesmodule = require("./courses/courses.module");
const _courseentity = require("./courses/course.entity");
const _roomsmodule = require("./rooms/rooms.module");
const _roomentity = require("./rooms/room.entity");
const _paymentsmodule = require("./payments/payments.module");
const _paymententity = require("./payments/payment.entity");
const _authservice = require("./auth/auth.service");
const _authmodule = require("./auth/auth.module");
const _classesmodule = require("./classes/classes.module");
const _classentity = require("./classes/class.entity");
const _usersmodule = require("./users/users.module");
const _userentity = require("./users/user.entity");
const _grouptemplatesmodule = require("./group-templates/group-templates.module");
const _grouptemplateentity = require("./group-templates/group-template.entity");
const _settingsmodule = require("./settings/settings.module");
const _settingsentity = require("./settings/settings.entity");
const _debitsmodule = require("./debits/debits.module");
const _debitentity = require("./debits/debit.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: 'db.sqlite',
                // entities: ['dist/**/*.entity{.ts,.js}'],
                entities: [
                    _studententity.Student,
                    _groupentity.Group,
                    _teacherentity.Teacher,
                    _courseentity.Course,
                    _classentity.ClassEntity,
                    _roomentity.Room,
                    _grouptemplateentity.GroupTemplate,
                    _settingsentity.Settings,
                    _userentity.User,
                    _paymententity.Payment,
                    _debitentity.Debit
                ],
                synchronize: true
            }),
            _studentsmodule.StudentsModule,
            _paymentsmodule.PaymentsModule,
            _groupsmodule.GroupsModule,
            _teachersmodule.TeachersModule,
            _coursesmodule.CoursesModule,
            _roomsmodule.RoomsModule,
            _classesmodule.ClassesModule,
            _grouptemplatesmodule.GroupTemplatesModule,
            _settingsmodule.SettingsModule,
            _authmodule.AuthModule,
            _usersmodule.UsersModule,
            _debitsmodule.DebitsModule
        ],
        controllers: [
            _appcontroller.AppController
        ],
        providers: [
            _appservice.AppService,
            _authservice.AuthService
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map