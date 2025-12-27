import { Injectable } from '@angular/core';
import { ServiceService } from './service.service';
import { lastValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LmsService {
  isTeacher = false;
  isClassAdmin = false;
  classCode = '';
  checkLeaveClass = false;
  constructor(
    private service: ServiceService,
    private translate: TranslateService
  ) { }
  async getTutorScheduleText(id: any) {
    let rs: any;
    try {
      rs = await lastValueFrom(this.service.postAPI(this.service.getHost() +
      `MobileLogin/GetItemTutoringSession?id=${id}`, ''));
    } catch (error) {
      console.log(error);
    }
    if (rs && rs.Object) {
      const tutorSchedule = rs.Object as TutorSchedule;
      let result = `<h1 class="color-green">${tutorSchedule.Title}</h1>
      <h1 style="font-size: 80%">[ ${tutorSchedule.SessionCode} ]</h1>
      <p class="color-dark">${this.translate.instant('MeetingSchedulePage.HTML_START')} : ${tutorSchedule.StartTime}</p>
      <p class="color-dark">${this.translate.instant('MeetingSchedulePage.HTML_END')} : ${tutorSchedule.EndTime}</p>
      <p>${this.translate.instant('LMS_LECTURE.HTML_TEACHER')} : ${tutorSchedule.Teacher}</p>
      <div>${tutorSchedule.Description}</div>
      <p>${this.translate.instant('LMS_TUTOR_SCH.HTML_REVIEW')} : ${tutorSchedule.Review}</p>
      <div>${tutorSchedule.ReviewComment}</div>
      `;

      try {
        rs = await lastValueFrom(this.service.postAPI(this.service.getHost() +
        `MobileLogin/GetListStudentApproved?id=${id}`, ''));
      } catch (error) {
        console.log(error);
      }
      if (rs && rs.Object) {
        const tutorStudents = rs.Object as TutorStudent[];
        result += `<p><b>${this.translate.instant('LMS_MY_CLASS.HTML_LIST_STUDENT')}</b> : ${tutorStudents.length}</p>`;
        let i = 1;
        for (const student of tutorStudents) {
          result += `<p>${i}. ${student.GivenName}</p>`;
          i++;
        }
      }

      return result;
    }
    return '';
  }
}
export interface TutorSchedule {
  Id: number
  SessionCode: string
  Title: string
  Price: number
  StartTime: string
  EndTime: string
  Description: string
  ListUserApproved: string
  BackgroundColor: string
  BackgroundImage: string
  JsonStatus: string
  IsPopupAllowed: any
  LessonDoc: string
  SubjectCode: string
  CourseCode: string
  ClassCode: string
  Teacher: string
  AccountZoom: string
  CreatedBy: string
  CreatedTime: string
  JoinUrl: string
  ZoomId: string
  Password: string
  HostKey: string
  PathNotepad: any
  MeetingId: number
  Status: string
  Type: string
  Review: string
  ReviewComment: string
}
export interface TutorStudent {
  UserName: string
  GivenName: string
  Avatar: string
  PhoneNumber: string
  Email: string
  Status: any
  IsApproved: boolean
  TimeStamp: any
  TimeRegist: string
  IsJoined: boolean
}
export type AudioBookSource = 'system' | 'personal';
