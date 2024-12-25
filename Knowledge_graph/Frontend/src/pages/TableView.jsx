import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/table"

export default function TableView({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Relationship</TableHead>
          <TableHead>Target</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.source}</TableCell>
            <TableCell>{row.relationship}</TableCell>
            <TableCell>{row.target}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
