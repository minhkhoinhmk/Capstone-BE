import * as moment from 'moment-timezone';

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const dateInVietnam = () => moment.tz(VIETNAM_TIMEZONE).toDate();

export const convertDateToVietnamDate = (date: Date) =>
  moment.tz(date, 'Asia/Ho_Chi_Minh').toDate();
