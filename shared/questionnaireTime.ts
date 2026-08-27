const QUESTIONNAIRE_DATE_TIME_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/;

const padDateTimePart = (value: number | string) => String(value).padStart(2, '0');

export const formatQuestionnaireCompletionTime = (value: string) => {
  const parts = value.match(QUESTIONNAIRE_DATE_TIME_PATTERN);
  if (!parts) return value;
  const [, , month, day, hour, minute] = parts;
  const dateText = `${Number(month)}月${Number(day)}日`;
  return hour && minute ? `${dateText} ${padDateTimePart(hour)}:${minute}` : dateText;
};

export const formatQuestionnaireTimestamp = (value = new Date()) => (
  `${value.getFullYear()}-${padDateTimePart(value.getMonth() + 1)}-${padDateTimePart(value.getDate())} `
  + `${padDateTimePart(value.getHours())}:${padDateTimePart(value.getMinutes())}:${padDateTimePart(value.getSeconds())}`
);
