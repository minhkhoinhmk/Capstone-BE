import * as moment from 'moment-timezone';

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

const now = moment.tz(VIETNAM_TIMEZONE);

export const dateInVietnam = () => now.toDate();

export const convertDateToVietnamDate = (date: Date) =>
  moment.tz(date, 'Asia/Ho_Chi_Minh').toDate();
