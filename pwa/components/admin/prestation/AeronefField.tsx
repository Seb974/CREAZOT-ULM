import { useRecordContext, type UseRecordContextParams } from "react-admin";
import Link from "next/link";
import slugify from "slugify";

import { getItemPath } from "../../../utils/dataAccess";

export const AeronefField = (props: UseRecordContextParams) => {
  const record = useRecordContext(props);
  if (!record || !record.aeronef) return null;
  return (
    <Link
      target="_blank"
      href={getItemPath(
        {
          id: record.aeronef["@id"].replace(/^\/books\//, ""),
          slug: slugify(`${record.aeronef.immatriculation}-${record.book.author}`, {
            lower: true,
            trim: true,
            remove: /[*+~.(),;'"!:@]/g,
          }),
        },
        "/books/[id]/[slug]"
      )}
    >
      {record.book.title} - {record.book.author}
    </Link>
  );
};
AeronefField.defaultProps = { label: "Aeronef" };
