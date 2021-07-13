import moment from "moment"; 

export const SLOT_DURATION = 30;

export function toCents(price: number) {
  return parseInt(price.toString().replace(".", "").replace(",", ""));
}

export function hourToMinuts(hourMinute: string) {
  const [hour, minutes] = hourMinute.split(":");
  return parseInt(hour) * 60 + parseInt(minutes);
}

export function sliceMinutes(start: any, end: any, duration: number) {
  const slices = [];
  let count = 0;

  start = moment(start);
  end = moment(end);

  while (end > start) {
    slices.push(start.format("HH:mm"));

    start = start.add(duration, "minutes");
    count++;
  }
  return slices;
}

export function mergeDateTime(date: any, time: any) {
  const merged = `${moment(date).format("YYYY-MM-DD")}T${moment(time).format(
    "HH:mm"
  )}`;

  return merged;
}

export function splitByValue(array: any, value: string) {
  let newArray = [[]];
  array.forEach((item) => {
    if (item !== value) {
      newArray[newArray.length - 1].push(item);
    } else {
      newArray.push([]);
    }
  });
  return newArray;
}
