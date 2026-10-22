/** 月份材料不补造发生日。 */
export const formatRecordDate = (date: string) => date.length === 7
  ? `${date.replace('-', '年')}月`
  : `${date.replace('-', '年').replace('-', '月')}日`;
