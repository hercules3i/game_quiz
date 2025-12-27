import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  getDatesInRange(start: Date, end: Date, daysOfWeek: string[]): Date[] {
    const selectedDates: Date[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

      if (daysOfWeek.includes(dayOfWeek)) {
        selectedDates.push(new Date(currentDate));
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return selectedDates;
  }
}
