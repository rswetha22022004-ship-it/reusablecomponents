import { useMemo } from "react";
import type { DataRow } from "../types/dashboard";
import AddRowForm from "../components/reusablecomponent/AddRowForm";
import BarChart from "../components/reusablecomponent/BarChart";
import ChartCard from "../components/reusablecomponent/ChartCard";
import DashboardLayout, { GridItem } from "../components/reusablecomponent/DashboardLayout";
import Graph from "../components/reusablecomponent/Graph";
import Icon from "../components/reusablecomponent/Icon";
import PieChart from "../components/reusablecomponent/PieChart";
import SettingsPanel from "../components/reusablecomponent/SettingsPanel";
import StatsCard from "../components/reusablecomponent/StatsCard";
import TableCard from "../components/reusablecomponent/TableCard";
import { adminConfig as baseConfig } from "../config/adminConfig";
import { adminEmployeeFields } from "../config/adminFormFields";
import { adminData, isEmployeeRow, nextEmployeeId, type AdminData, type EmployeeRow } from "../data/adminData";
import { useDashboardSettings } from "../hooks/useDashboardSettings";
import { useSavedRows } from "../hooks/useSavedRows";
import { applySettings, settingsFromConfig } from "../utils/settings";


const DEFAULT_SETTINGS = settingsFromConfig(baseConfig);
const STORAGE_KEY = "dashboard-settings:admin";
const ROWS_KEY = "dashboard-rows:admin";

interface AdminDashboardProps {
  
  data?: AdminData;
}

export default function AdminDashboard({ data = adminData }: AdminDashboardProps) {
  const { settings, update, reset } = useDashboardSettings(STORAGE_KEY, DEFAULT_SETTINGS);
  
  const config = useMemo(() => applySettings(baseConfig, settings), [settings]);

  const { rows: employees, addRow, removeRow, resetRows } = useSavedRows(ROWS_KEY, data.employees, isEmployeeRow);

  const handleRemoveEmployee = (row: EmployeeRow) => {
    if (window.confirm(`Remove ${row.name} (${row.id})?`)) removeRow(row);
  };

  const handleAddEmployee = (values: DataRow) => {
    const row = { id: nextEmployeeId(employees), ...values };
    if (isEmployeeRow(row)) addRow(row);
  };

  return (
    <DashboardLayout title={config.title} subtitle={config.subtitle} layout={config.layout}>
      <GridItem span={config.layout.columns}>
        <SettingsPanel
          settings={settings}
          onChange={update}
          onReset={reset}
          card={config.card}
          labelColor={config.layout.pageTextColor}
          accentColor={config.statsCard.iconColor}
          borderColor={config.card.borderColor}
        />
      </GridItem>

      {data.stats.map((stat) => (
        <GridItem key={stat.id} span={config.statsSpan}>
          <StatsCard
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={<Icon name={stat.icon} />}
            {...config.statsCard}
          />
        </GridItem>
      ))}

      <GridItem span={config.bar.span}>
        <ChartCard
          title={config.bar.title}
          description={config.bar.description}
          {...config.card}
          {...config.bar.card}
          chart={<BarChart data={data.revenue} {...config.bar.chart} />}
        />
      </GridItem>

      <GridItem span={config.pie.span}>
        <ChartCard
          title={config.pie.title}
          description={config.pie.description}
          {...config.card}
          {...config.pie.card}
          chart={<PieChart data={data.userRoles} {...config.pie.chart} />}
        />
      </GridItem>

      <GridItem span={config.line.span}>
        <ChartCard
          title={config.line.title}
          description={config.line.description}
          {...config.card}
          {...config.line.card}
          chart={<Graph data={data.traffic} {...config.line.chart} />}
        />
      </GridItem>

      <GridItem span={config.table.span}>
        <TableCard
          title={config.table.title}
          description={config.table.description}
          card={{ ...config.card, ...config.table.card }}
          table={config.table.table}
          columns={config.table.columns}
          rows={employees}
          onRemoveRow={handleRemoveEmployee}
          toolbar={
            <AddRowForm
              fields={adminEmployeeFields}
              onSubmit={handleAddEmployee}
              onReset={resetRows}
              buttonLabel="Add employee"
              labelColor={config.card.descriptionColor}
              inputBackground={config.table.table.rowBackground}
              inputBorderColor={config.table.table.borderColor}
              inputTextColor={config.table.table.textColor}
              accentColor={config.statsCard.iconColor}
            />
          }
          getRowKey={(row) => row.id}
        />
      </GridItem>
    </DashboardLayout>
  );
}
