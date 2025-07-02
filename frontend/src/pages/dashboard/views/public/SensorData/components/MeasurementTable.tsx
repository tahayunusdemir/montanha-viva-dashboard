import { useMemo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Paper, FormControl, FormLabel } from "@mui/material";
import { Measurement } from "@/types";
import dayjs from "dayjs";

interface MeasurementTableProps {
  data: Measurement[];
  selectedTypes: string[];
}

const MeasurementTable = ({ data, selectedTypes }: MeasurementTableProps) => {
  const { columns, rows } = useMemo(() => {
    if (!data || data.length === 0 || selectedTypes.length === 0) {
      return { columns: [], rows: [] };
    }

    const pivotedData = data.reduce(
      (acc, { recorded_at, measurement_type, value }) => {
        if (!selectedTypes.includes(measurement_type)) {
          return acc;
        }
        const time = dayjs(recorded_at).format("YYYY-MM-DD HH:mm:ss");
        if (!acc[time]) {
          acc[time] = { id: time, time };
        }
        acc[time][measurement_type] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    const tableRows = Object.values(pivotedData);

    const tableColumns: GridColDef[] = [
      {
        field: "time",
        headerName: "Timestamp",
        width: 180,
      },
      ...selectedTypes.map(
        (type) =>
          ({
            field: type,
            headerName: type.charAt(0).toUpperCase() + type.slice(1),
            width: 150,
            type: "number",
          }) as GridColDef,
      ),
    ];

    return { columns: tableColumns, rows: tableRows };
  }, [data, selectedTypes]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
      <FormLabel component="legend">Measurement Data</FormLabel>
      <Paper variant="outlined" sx={{ mt: 2, height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 25,
              },
            },
            sorting: {
              sortModel: [{ field: "time", sort: "asc" }],
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          density="compact"
          sx={{
            border: "none",
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: "background.paper",
            },
          }}
        />
      </Paper>
    </FormControl>
  );
};

export default MeasurementTable;
