import { customType } from "drizzle-orm/pg-core";

// https://github.com/drizzle-team/drizzle-orm/issues/1511#issuecomment-1824687669
export const customJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "jsonb";
    },
    // @ts-ignore
    toDriver(value: TData) {
      return value;
    },
  })(name);
