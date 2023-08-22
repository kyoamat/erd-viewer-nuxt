import { FieldPacket, createConnection } from 'mysql2';
import type { Table, Column, Constraint } from '@/types/table';

export default defineEventHandler(async (event) => {
  try {
    const connStr = (await readBody(event)).connStr;
    const client = createConnection(connStr);

    const showTablesRes = (await client.promise().query('show tables;')) as (
      | any
      | FieldPacket
    )[][];

    if (showTablesRes.length < 2) {
      return [];
    }

    const tables = showTablesRes[0].map(
      (el) => Object.values(el)[0]
    ) as string[];
    const result = [] as Table[];
    for (const table of tables) {
      const showColumnsRes = (await client
        .promise()
        .query(`show columns from ${table};`)) as (Column | FieldPacket)[][]; // quoteされると動作しないのでplaceholderは利用しない

      const columns = [] as Column[];
      if (showColumnsRes.length > 1) {
        columns.push(...(showColumnsRes[0] as Column[]));
      }

      const showConstraintsRes = (await client
        .promise()
        .query(
          "select column_name, constraint_name, referenced_table_name, referenced_column_name from information_schema.key_column_usage where table_name = ? and not constraint_name = 'primary';",
          [table]
        )) as (Constraint | FieldPacket)[][]; // PK制約はColumn定義からわかるので除く

      const constraints = [] as Constraint[];
      if (showConstraintsRes.length > 1) {
        constraints.push(...(showConstraintsRes[0] as Constraint[]));
      }

      result.push({
        name: table,
        columns,
        constraints,
      });
    }

    return result;
  } catch (e) {
    console.error(e);
    throw createError({
      statusCode: 500,
      statusMessage: 'something wrong occurred.',
    });
  }
});
