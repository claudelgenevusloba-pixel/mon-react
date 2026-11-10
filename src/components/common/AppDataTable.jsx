import DataTable from "react-data-table-component";
import EmptyState from "./EmptyState";

const STYLES_TABLEAU = {
  table: { style: { backgroundColor: "#ffffff" } },
  headRow: {
    style: {
      minHeight: "48px",
      backgroundColor: "#f5f8fc",
      borderBottom: "1px solid #e4eaf2",
    },
  },
  headCells: {
    style: {
      color: "#475569",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  rows: {
    style: {
      minHeight: "54px",
      color: "#334155",
      fontSize: "14px",
      borderBottom: "1px solid #edf1f6",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f5f8fc",
      transitionDuration: "0.15s",
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingTop: "10px",
      paddingBottom: "10px",
    },
  },
  pagination: {
    style: {
      minHeight: "56px",
      borderTop: "1px solid #edf1f6",
      color: "#64748b",
      fontSize: "13px",
    },
  },
};

export default function AppDataTable({
  noDataMessage = "Aucune donnée disponible.",
  customStyles,
  paginationComponentOptions,
  ...props
}) {
  return (
    <div className="app-data-table">
      <DataTable
        responsive
        highlightOnHover
        striped
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 20, 50]}
        paginationComponentOptions={{
          noRowsPerPage: false,
          selectAllRowsItem: false,
          ...paginationComponentOptions,
        }}
        noDataComponent={
          <EmptyState title={noDataMessage} compact />
        }
        customStyles={customStyles || STYLES_TABLEAU}
        {...props}
      />
    </div>
  );
}
